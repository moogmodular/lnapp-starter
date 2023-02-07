import { t } from '../trpc'
import { isAuthed } from '~/server/middlewares/authed'
import { userBalance } from '~/server/service/accounting'
import { prisma } from '~/server/prisma'
import { TRPCError } from '@trpc/server'
import { createTipForUser } from '~/components/UserSingle'
import { sendDMToUser } from '~/server/service/nostr'

export const tipRouter = t.router({
    creteTipForUser: t.procedure
        .use(isAuthed)
        .input(createTipForUser)
        .mutation(async ({ ctx, input }) => {
            const maxAmount = ctx.user ? await userBalance(prisma, ctx.user?.id) : 0

            if (!maxAmount) {
                return new TRPCError({ code: 'BAD_REQUEST', message: 'user not found' })
            }
            if (input.amount > maxAmount * 1000) {
                return { status: 'ERROR', reason: 'insufficient balance' }
            }

            const targetUser = await prisma.user.findUnique({ where: { userName: input.userName } })

            if (!targetUser) {
                return new TRPCError({ code: 'BAD_REQUEST', message: 'user not found' })
            }

            await prisma.tip.create({
                data: {
                    amount: input.amount,
                    tipper: { connect: { id: ctx.user?.id } },
                    tippee: { connect: { id: targetUser.id } },
                },
            })

            if (targetUser.nostrPubKey) {
                // void sendDMToUser(
                //     targetUser.nostrPubKey,
                //     `@${targetUser.userName}. You have received a tip of ${input.amount} on ${process.env.DOMAIN}.`,
                // )
            }

            return { status: 'OK' }
        }),
})
