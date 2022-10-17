import { t } from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { lnurlPayDescriptionHash } from '~/server/service/lnurl'
import { prisma } from '~/server/prisma'
import { createInvoice, getInvoice, subscribeToInvoice } from 'lightning'
import { add, addSeconds, format } from 'date-fns'
import { lnd } from '~/server/service/lnd'
import { PER_USER_BALANCE_CAP, SINGLE_TRANSACTION_CAP, TRANSACTION_MAX_AGE } from '~/server/service/constants'
import { createInvoiceInput } from '~/components/Transact'
import { isAuthed } from '~/server/middlewares/authed'
import { belowInvoiceLimit, recentSettledTransaction, userBalance } from '~/server/service/accounting'

export const invoiceRouter = t.router({
    createInvoice: t.procedure
        .use(isAuthed)
        .input(createInvoiceInput)
        .query(async ({ ctx, input }) => {
            if (!input.amount || input.amount <= 0) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'amount must be positive' })
            }

            if (!(await belowInvoiceLimit(prisma, ctx.user.id))) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'too many pending invoices' })
            }

            if (await recentSettledTransaction(prisma, ctx.user.id, 'INVOICE')) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'last deposit too recent' })
            }

            if (input.amount > SINGLE_TRANSACTION_CAP) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'invoice amount too high' })
            }

            const expiresAt = add(new Date(), { minutes: 60 })
            const description = `${input.amount} sats for @${ctx.user.userName} on generic.app at ${format(
                new Date(),
                'dd.MM.yyyy hh:mm:ss',
            )}`

            const balance = await userBalance(prisma, ctx.user.id)

            if (balance >= PER_USER_BALANCE_CAP) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'user balance too high' })
            }

            const descriptionHash = lnurlPayDescriptionHash(description)
            try {
                const lndInvoice = await createInvoice({
                    lnd,
                    tokens:
                        balance + input.amount > PER_USER_BALANCE_CAP ? PER_USER_BALANCE_CAP - balance : input.amount,
                    description: description,
                    description_hash: descriptionHash,
                    expires_at: expiresAt.toString(),
                })

                const invoiceSub = await subscribeToInvoice({
                    lnd,
                    id: lndInvoice.id,
                })

                const newTransaction = await prisma.transaction.create({
                    data: {
                        lndId: lndInvoice.id,
                        userId: ctx.user.id,
                        hash: descriptionHash,
                        description: description,
                        maxAgeSeconds: TRANSACTION_MAX_AGE,
                        bolt11: lndInvoice.request,
                        transactionKind: 'INVOICE',
                        transactionStatus: 'PENDING',
                        mSatsTarget: input.amount * 1000,
                    },
                })

                invoiceSub.on('invoice_updated', async (invoice) => {
                    if (invoice.is_confirmed) {
                        console.log('invoice confirmed', invoice.id)
                        return await prisma.transaction
                            .update({
                                where: { id: newTransaction.id },
                                data: {
                                    mSatsSettled: Number(invoice.received_mtokens),
                                    confirmedAt: new Date(),
                                    transactionStatus: 'SETTLED',
                                },
                            })
                            .catch(console.log)
                    } else if (invoice.is_canceled) {
                        return await prisma.transaction
                            .update({
                                where: {
                                    id: newTransaction.id,
                                },
                                data: {
                                    confirmedAt: new Date(),
                                    transactionStatus: 'CANCELED',
                                },
                            })
                            .catch(console.log)
                    }
                })

                return {
                    lndId: lndInvoice.id,
                    expiresAt: addSeconds(new Date(), 3600).toISOString(),
                    userId: ctx.user.id,
                    mSatsRequested: Number(input.amount) * 1000,
                    hash: lnurlPayDescriptionHash(description),
                    bolt11: lndInvoice.request,
                }
            } catch (error) {
                console.log(error)
                throw error
            }
        }),
    isInvoicePaid: t.procedure
        .use(isAuthed)
        .input(
            z.object({
                lndId: z.string(),
                hash: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            let inv
            try {
                inv = await getInvoice({ id: input.lndId, lnd })
            } catch (err) {
                console.log(err)
                return { transactionStatus: 'CREATION_PENDING' }
            }

            return await prisma.transaction.findUnique({
                where: { lndId: inv.id },
                select: { transactionStatus: true },
            })
        }),
})
