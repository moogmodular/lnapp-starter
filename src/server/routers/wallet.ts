import { t } from '../trpc'

const wallets = [
    { url: 'https://getalby.com/', name: 'Alby' },
    { url: 'https://github.com/alexbosworth/balanceofsatoshis', name: 'Balance of Satoshis' },
    { url: 'https://blixt.tech/', name: 'Blixt' },
    { url: 'https://breez.technology/', name: 'Breez' },
    { url: 'https://bluewallet.io/', name: 'BlueWallet' },
    { url: 'https://coinos.io', name: 'coinos' },
    { url: 'https://www.gysr.io/', name: 'Geyser' },
    { url: 'https://lnbits.com/', name: 'LNbits' },
    { url: 'https://telegram.me/lntxbot', name: 'lntxbot' },
    { url: 'https://phoenix.acinq.co/', name: 'Phoenix' },
    { url: 'https://sbw.app/', name: 'SimpleBitcoinWallet' },
    { url: 'https://sparrowwallet.com/', name: 'Sparrow Wallet' },
    { url: 'https://thunderhub.io/', name: 'ThunderHub' },
    { url: 'https://zaphq.io/', name: 'Zap' },
    { url: 'https://zeusln.app/', name: 'Zeus' },
]

export const walletRouter = t.router({
    list: t.procedure.query(async ({ ctx, input }) => {
        return wallets
    }),
})
