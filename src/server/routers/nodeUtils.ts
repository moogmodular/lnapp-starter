import { t } from '../trpc'
import { lnd } from '~/server/service/lnd'
import { getWalletInfo } from 'lightning'

export const nodeUtilsRouter = t.router({
    nodeConnection: t.procedure.query(async ({ ctx }) => {
        const walletInfo = (await getWalletInfo({ lnd })) as unknown as { uris: string[] }
        const uri = walletInfo.uris[0] as string
        return uri
    }),
})
