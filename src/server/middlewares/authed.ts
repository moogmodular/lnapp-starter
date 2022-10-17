import { t } from '~/server/trpc'
import { TRPCError } from '@trpc/server'

export const isAuthed = t.middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    return next({
        ctx: {
            user: ctx.user,
        },
    })
})
