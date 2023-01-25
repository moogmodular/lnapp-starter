import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import { NextPageContext } from 'next'
import superjson from 'superjson'
import type { AppRouter } from '~/server/routers/_app'
import { authedUserStore } from '~/store/authedUserStore'

function getBaseUrl() {
    if (typeof window !== 'undefined') {
        return ''
    }

    if (process.env.COMPOSITE_DOMAIN) {
        return process.env.COMPOSITE_DOMAIN
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }
    if (process.env.RENDER_INTERNAL_HOSTNAME) {
        return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`
    }
    return `http://localhost:${process.env.PORT ?? 3000}`
}

export interface SSRContext extends NextPageContext {
    status?: number
}

export const trpc = createTRPCNext<AppRouter, SSRContext>({
    config({ ctx }) {
        return {
            transformer: superjson,
            links: [
                loggerLink({
                    enabled: (opts) =>
                        process.env.NODE_ENV === 'development' ||
                        (opts.direction === 'down' && opts.result instanceof Error),
                }),
                httpBatchLink({
                    url: `${getBaseUrl()}/api/trpc`,
                    headers() {
                        if (ctx?.req) {
                            const {
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                connection: _connection,
                                ...headers
                            } = ctx.req.headers
                            return {
                                ...headers,
                                'x-ssr': '1',
                            }
                        }
                        return {
                            Authorization: `Bearer ${authedUserStore.getState().storeToken}`,
                        }
                    },
                }),
            ],
        }
    },
    ssr: true,
    responseMeta(opts) {
        const ctx = opts.ctx as SSRContext

        if (ctx.status) {
            return {
                status: ctx.status,
            }
        }

        const error = opts.clientErrors[0]
        if (error) {
            return {
                status: error.data?.httpStatus ?? 500,
            }
        }

        return {}
    },
})
