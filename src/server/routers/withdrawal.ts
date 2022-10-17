import { t } from '../trpc'
import { prisma } from '~/server/prisma'
import { TRPCError } from '@trpc/server'
import { encodedUrl, getK1Hash, k1 } from '~/server/service/lnurl'
import { z } from 'zod'
import { decodePaymentRequest, subscribeToPayViaRequest } from 'lightning'
import { lnd } from '~/server/service/lnd'
import { SINGLE_TRANSACTION_CAP, TRANSACTION_MAX_AGE } from '~/server/service/constants'
import { recentSettledTransaction, userBalance } from '~/server/service/accounting'
import { isAuthed } from '~/server/middlewares/authed'

export const withdrawalRouter = t.router({
    getWithdrawalUrl: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        const secret = k1()
        const maxAmount = await userBalance(prisma, ctx?.user?.id)

        const encoded = encodedUrl(`${process.env.LN_WITH_CREATE_URL}`, 'withdrawRequest', secret)

        const k1Hash = getK1Hash(secret)

        await prisma.transaction.create({
            data: {
                k1Hash: k1Hash,
                userId: ctx.user.id,
                transactionStatus: 'PENDING',
                transactionKind: 'WITHDRAWAL',
                maxAgeSeconds: TRANSACTION_MAX_AGE,
                mSatsTarget: maxAmount,
                bolt11: encoded,
                description: '',
                lndId: k1Hash,
                hash: k1Hash,
            },
        })

        return { secret, encoded }
    }),
    wasWithdrawalSettled: t.procedure
        .use(isAuthed)
        .input(
            z.object({
                k1: z.string(),
            }),
        )
        .query(async ({ ctx, input }) => {
            const lnWithdrawal = await prisma.transaction.findUnique({
                where: { k1Hash: getK1Hash(input.k1) },
                select: { transactionStatus: true },
            })

            if (!lnWithdrawal) {
                return { transactionStatus: 'CREATION_PENDING' }
            } else {
                return { transactionStatus: lnWithdrawal.transactionStatus }
            }
        }),
    createWithdrawal: t.procedure
        .meta({ openapi: { method: 'GET', path: '/create-withdrawal' } })
        .input(
            z.object({
                k1: z.string(),
            }),
        )
        .output(z.any())
        .query(async ({ ctx, input }) => {
            const { k1 } = input
            let reason
            try {
                const lnWithdrawal = await prisma.transaction.findFirst({
                    where: {
                        k1Hash: getK1Hash(k1),
                        createdAt: {
                            gt: new Date(new Date().setHours(new Date().getHours() - 1)),
                        },
                    },
                })
                if (lnWithdrawal) {
                    const user = await prisma.user.findUnique({
                        where: { id: lnWithdrawal.userId! },
                        include: { transaction: true },
                    })
                    const maxAmount = user ? await userBalance(prisma, user?.id) : 0
                    const cappedAmount = Math.min(maxAmount, SINGLE_TRANSACTION_CAP)
                    if (maxAmount) {
                        const lnUrlWithdrawal = {
                            tag: 'withdrawRequest',
                            callback: `${process.env.LN_WITH_DO_URL}`,
                            k1: k1,
                            defaultDescription: `Withdrawal for @${user?.userName} on noteblitz.app for maximum ${
                                maxAmount - 1
                            }`,
                            minWithdrawable: 10,
                            maxWithdrawable: cappedAmount * 1000 - 1000,
                        }
                        await prisma.transaction.update({
                            where: { id: lnWithdrawal.id },
                            data: {
                                description: lnUrlWithdrawal.defaultDescription,
                            },
                        })
                        return lnUrlWithdrawal
                    } else {
                        reason = 'user not found'
                    }
                } else {
                    reason = 'withdrawal not found'
                }
            } catch (error) {
                reason = 'internal server error'
            }

            throw new TRPCError({ code: 'BAD_REQUEST', message: reason })
        }),
    doWithdrawal: t.procedure
        .meta({ openapi: { method: 'GET', path: '/do-withdrawal' } })
        .input(
            z.object({
                pr: z.string(),
                k1: z.string(),
            }),
        )
        .output(z.any())
        .query(async ({ ctx, input }) => {
            const { k1, pr } = input
            const lnWithdrawal = await prisma.transaction.findUnique({ where: { k1Hash: getK1Hash(k1) } })
            if (!lnWithdrawal) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'invalid k1' })
            }
            const user = await prisma.user.findUnique({ where: { id: lnWithdrawal.userId ?? '' } }) // TODO: fix this
            if (!user) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'user not found' })
            }

            if (await recentSettledTransaction(prisma, user.id, 'WITHDRAWAL')) {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'last withdrawal too recent' })
            }

            let decoded: any
            try {
                decoded = await decodePaymentRequest({ lnd, request: pr })
            } catch (error) {
                throw new TRPCError({ code: 'UNAUTHORIZED', message: 'could not decode invoice' })
            }

            if (decoded.mtokens > SINGLE_TRANSACTION_CAP * 1000) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `you can only withdraw up to ${SINGLE_TRANSACTION_CAP} in a single transaction`,
                })
            }

            if (!decoded.mtokens || Number(decoded.mtokens) <= 0) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'your invoice must specify an amount' })
            }

            const maxAmount = user ? await userBalance(prisma, user?.id) : 0

            if (!maxAmount) {
                return new TRPCError({ code: 'BAD_REQUEST', message: 'user not found' })
            }

            if (decoded.mtokens > maxAmount * 1000) {
                return { status: 'ERROR', reason: 'insufficient balance' }
            }

            const sub = await subscribeToPayViaRequest({
                lnd,
                request: pr,
                max_fee: Number(10),
                pathfinding_timeout: 30000,
            })

            sub.once('confirmed', async (payment) => {
                console.log('payment confirmed', payment)
                await prisma.transaction.update({
                    where: { k1Hash: getK1Hash(k1) },
                    data: {
                        transactionStatus: 'SETTLED',
                        mSatsTarget: parseInt(payment.mtokens),
                        mSatsSettled: parseInt(payment.mtokens) - parseInt(payment.fee_mtokens),
                    },
                })
            })

            return { status: 'OK' }
        }),
})
