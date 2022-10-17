import { t } from '../trpc'
import { healthRouter } from './health'
import { authRouter } from '~/server/routers/auth'
import { withdrawalRouter } from '~/server/routers/withdrawal'
import { invoiceRouter } from '~/server/routers/invoice'
import { nodeUtilsRouter } from '~/server/routers/nodeUtils'
import { accountingRouter } from '~/server/routers/accounting'
import { userRouter } from '~/server/routers/user'
import { walletRouter } from '~/server/routers/wallet'

export const appRouter = t.router({
    auth: authRouter,
    user: userRouter,
    health: healthRouter,
    withdrawal: withdrawalRouter,
    invoice: invoiceRouter,
    nodeUtils: nodeUtilsRouter,
    accounting: accountingRouter,
    wallet: walletRouter,
})

export type AppRouter = typeof appRouter
