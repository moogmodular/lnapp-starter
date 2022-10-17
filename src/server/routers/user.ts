import { t } from '../trpc'
import { z } from 'zod'
import { prisma } from '~/server/prisma'
import { editUserInput } from '~/components/EditUser'
import { TRPCError } from '@trpc/server'
import { isAuthed } from '~/server/middlewares/authed'

export const userRouter = t.router({
    listLatest: t.procedure
        .input(
            z.object({
                limit: z.number().min(1).max(100),
            }),
        )
        .query(async ({ input }) => {
            return await prisma.user.findMany({
                take: input.limit,
                orderBy: { createdAt: 'desc' },
            })
        }),
    edit: t.procedure
        .use(isAuthed)
        .input(editUserInput)
        .mutation(async ({ input, ctx }) => {
            return await prisma.user
                .update({
                    where: { id: ctx.user.id },
                    data: { userName: input.userName, profileImage: input.base64EncodedImage, bio: input.bio },
                })
                .catch((error) => {
                    console.log(error)
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
                })
        }),
    deleteMe: t.procedure.use(isAuthed).mutation(async ({ ctx }) => {
        return await prisma.user
            .delete({
                where: { id: ctx.user.id },
            })
            .catch((error) => {
                console.log(error)
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
            })
    }),
})
