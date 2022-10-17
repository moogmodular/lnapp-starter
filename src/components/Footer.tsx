import { trpc } from '~/utils/trpc'

export const Footer = ({}) => {
    const { data: nodeConnectionData } = trpc.nodeUtils.nodeConnection.useQuery()

    return (
        <div className={'flex flex-row justify-center gap-1 break-all border-2 border-black p-2 text-sm'}>
            {nodeConnectionData}
        </div>
    )
}
