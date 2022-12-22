import { t } from '../trpc'
import { encodedUrl, getK1Hash, k1 } from '~/server/service/lnurl'
import { prisma } from '~/server/prisma'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import secp256k1 from 'secp256k1'
import jwt from 'jsonwebtoken'
import { userBalance } from '~/server/service/accounting'
import { sub } from 'date-fns'
import { defaultUserData } from '~/server/service/user'
import { isAuthed } from '~/server/middlewares/authed'

export const authRouter = t.router({
    getMe: t.procedure.use(isAuthed).query(async ({ ctx }) => {
        const tokenUser = ctx.user
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id: tokenUser?.id,
                },
            })
            return { ...user, balance: user ? await userBalance(prisma, user.id) : 0 }
        } catch (error) {
            throw new TRPCError({
                code: 'UNAUTHORIZED',
                message: 'User not found.',
            })
        }
    }),
    loginUrl: t.procedure.query(async () => {
        const secret = k1()
        await prisma.userAuth.create({ data: { k1Hash: getK1Hash(secret) } })
        const encoded = encodedUrl(process.env.LN_AUTH_URL ?? 'http://localhost:3000/api/authenticate', 'login', secret)

        return {
            secret: secret,
            encoded: encoded,
        }
    }),
    isLoggedIn: t.procedure
        .input(
            z.object({
                secret: z.string().optional(),
            }),
        )
        .query(async ({ input }) => {
            if (!input.secret) {
                return { user: null }
            }

            const k1Hash = getK1Hash(input.secret)
            const user = await prisma.$transaction(async (transactionPrisma) => {
                const userFromAuth = await transactionPrisma.userAuth.findUnique({ where: { k1Hash } })

                if (userFromAuth?.publicKey) {
                    return await transactionPrisma.user.findUnique({
                        where: { publicKey: userFromAuth?.publicKey },
                        select: {
                            id: true,
                            publicKey: true,
                            createdAt: true,
                            updatedAt: true,
                            userName: true,
                            lastLogin: true,
                        },
                    })
                }

                return null
            })

            if (!user) {
                return { user: null }
            }

            await prisma.userAuth.deleteMany({
                where: { OR: [{ k1Hash }, { createdAt: { lt: sub(new Date(), { seconds: 90 }) } }] },
            })
            return { user: jwt.sign({ ...user }, process.env.JWT_SECRET ?? ''), lastLogin: user.lastLogin }
        }),
    authenticate: t.procedure
        .meta({ openapi: { method: 'GET', path: '/authenticate' } })
        .input(
            z.object({
                sig: z.string(),
                k1: z.string(),
                key: z.string().length(66, { message: 'Invalid public key length' }),
            }),
        )
        .output(z.any())
        .query(async ({ input }) => {
            try {
                const sig = Buffer.from(input.sig, 'hex')
                const k1 = Buffer.from(input.k1, 'hex')
                const key = Buffer.from(input.key, 'hex')
                const signature = secp256k1.signatureImport(sig)
                const k1Hash = getK1Hash(input.k1)
                const userAuth = await prisma.userAuth.findFirst({ where: { AND: [{ k1Hash }, { publicKey: null }] } })

                if (!userAuth) {
                    throw new TRPCError({ code: 'NOT_FOUND', message: 'No such secret.' })
                }

                if (secp256k1.ecdsaVerify(signature, k1, key)) {
                    await prisma.$transaction(async (transactionPrisma) => {
                        let innerUser
                        innerUser = await transactionPrisma.user.findUnique({
                            where: {
                                publicKey: input.key,
                            },
                        })

                        if (!innerUser) {
                            const { randomName, image } = await defaultUserData()

                            innerUser = await transactionPrisma.user.create({
                                data: {
                                    userName: randomName,
                                    publicKey: input.key,
                                    profileImage: `data:image/png;base64,${image}`,
                                },
                            })
                        } else {
                            await transactionPrisma.user.update({
                                where: { id: innerUser.id },
                                data: { lastLogin: new Date() },
                            })
                        }

                        await transactionPrisma.userAuth.update({
                            where: { k1Hash },
                            data: { publicKey: input.key },
                        })

                        return { status: 'OK' }
                    })
                } else {
                    console.log('Something went wrong')
                    return { status: 'ERROR', reason: 'Something went wrong' }
                }
            } catch (error) {
                console.log(error)
            }

            return new TRPCError({ code: 'BAD_REQUEST', message: 'Something went wrong' })
        }),
})
