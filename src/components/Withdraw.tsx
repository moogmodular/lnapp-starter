import { trpc } from '~/utils/trpc'
import { PollingQRCode } from '~/components/PollingQRCode'

interface WithdrawProps {
    done: () => void
}

export const Withdraw = ({ done }: WithdrawProps) => {
    const utils = trpc.useContext()
    const { data: withdrawData } = trpc.withdrawal.getWithdrawalUrl.useQuery()
    trpc.withdrawal.wasWithdrawalSettled.useQuery(
        { k1: withdrawData?.secret ?? '' },
        {
            refetchInterval: (data) => {
                console.log('data', data)
                if (!(data?.transactionStatus === 'SETTLED')) {
                    return 1000
                }
                utils.accounting.myBalance.invalidate()
                done()
                return false
            },
        },
    )

    return <>{withdrawData && <PollingQRCode bolt11={withdrawData.encoded} />}</>
}
