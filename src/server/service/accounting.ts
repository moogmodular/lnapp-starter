import { PrismaClient } from '@prisma/client'
import { differenceInSeconds, sub } from 'date-fns'
import { INVOICE_LIMIT, TRANSACTION_FREQUENCY_SECONDS_LIMIT, TRANSACTION_MAX_AGE } from '~/server/service/constants'

export const userBalance = async (prisma: PrismaClient, userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { transaction: { where: { transactionStatus: 'SETTLED' } }, userTipped: true, userTipsReceived: true },
    })

    const sumTipped = user?.userTipped.reduce((acc, cur) => acc + cur.amount, 0) || 0
    const sumReceived = user?.userTipsReceived.reduce((acc, cur) => acc + cur.amount, 0) || 0

    return (
        user?.transaction.reduce((acc, cur) => {
            if (cur.mSatsSettled) {
                const transactionValue = {
                    INVOICE: cur.mSatsSettled,
                    WITHDRAWAL: -cur.mSatsSettled,
                    TRANSFER: cur.mSatsSettled,
                }[cur.transactionKind]
                return acc + transactionValue / 1000
            }
            return acc
        }, sumReceived - sumTipped) ?? 0
    )
}

export const belowInvoiceLimit = async (prisma: PrismaClient, userId: string) => {
    const count = await prisma.transaction.count({
        where: {
            userId,
            transactionKind: 'INVOICE',
            transactionStatus: { not: 'SETTLED' },
            createdAt: { gt: sub(new Date(), { seconds: TRANSACTION_MAX_AGE }) },
        },
    })

    return count < INVOICE_LIMIT
}

export const recentSettledTransaction = async (
    prisma: PrismaClient,
    userId: string,
    transactionKind: 'INVOICE' | 'WITHDRAWAL',
) => {
    return prisma.transaction
        .findMany({
            where: {
                userId,
                transactionKind: transactionKind,
                transactionStatus: 'SETTLED',
            },
            orderBy: {
                createdAt: 'desc',
            },
        })
        .then((transactions) => {
            const lastTransaction = transactions[0]
            return lastTransaction
                ? differenceInSeconds(lastTransaction.updatedAt, new Date()) < TRANSACTION_FREQUENCY_SECONDS_LIMIT
                : false
        })
}
