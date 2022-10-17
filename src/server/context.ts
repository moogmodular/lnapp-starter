import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import jwt from 'jsonwebtoken'

export interface TokenUser {
    id: string
    userName: string
    publicKey: string
    createdAt: string
    updatedAt: string
    lastLogin: string
}

interface CreateContextOptions {
    user?: TokenUser
}

export async function createContextInner(_opts: CreateContextOptions) {
    return {
        user: _opts.user,
    }
}

export type Context = trpc.inferAsyncReturnType<typeof createContextInner>

export async function createContext(opts: trpcNext.CreateNextContextOptions): Promise<Context> {
    const token = opts.req.headers.authorization?.split(' ')[1]
    const user = token ? (jwt.verify(token, process.env.JWT_SECRET ?? '') as TokenUser) : undefined
    return await createContextInner({
        user,
    })
}
