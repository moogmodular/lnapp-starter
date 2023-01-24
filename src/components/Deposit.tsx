import { trpc } from '~/utils/trpc'
import { PollingQRCode } from '~/components/PollingQRCode'

interface DepositProps {
    done: () => void
    amount: number
}

export const Deposit = ({ amount, done }: DepositProps) => {
    const utils = trpc.useContext()
    const { data: invoiceData } = trpc.invoice.createInvoice.useQuery({ amount: amount })
    trpc.invoice.isInvoicePaid.useQuery(
        { lndId: invoiceData?.lndId ?? '', hash: invoiceData?.hash ?? '' },
        {
            refetchInterval: (data) => {
                if (!(data?.transactionStatus === 'SETTLED')) {
                    return 1000
                }
                utils.accounting.myBalance.invalidate()
                done()
                return false
            },
        },
    )

    return (
        <div className={'flex flex-col items-center'}>
            {invoiceData && <PollingQRCode bolt11={invoiceData.bolt11} />}
        </div>
    )
}
