import { trpc } from '~/utils/trpc'
import TwitterIcon from '@mui/icons-material/Twitter'
import Link from '@mui/material/Link'
import { IconButton } from '@mui/material'
import TelegramIcon from '@mui/icons-material/Telegram'
import GitHubIcon from '@mui/icons-material/GitHub'

export const Footer = ({}) => {
    const { data: nodeConnectionData } = trpc.nodeUtils.nodeConnection.useQuery()

    return (
        <div className={'flex flex-row items-center justify-center gap-1 break-all border-2 border-black p-2 text-sm'}>
            {nodeConnectionData}
            <IconButton color="primary">
                <Link href={`https://twitter.com/SchlausKwab`} rel={'noreferrer'} target={'_blank'}>
                    <TwitterIcon fontSize={'small'} />
                </Link>
            </IconButton>
            <IconButton color="primary">
                <Link href={'https://github.com/zerealschlauskwab/lnapp-starter'} rel={'noreferrer'} target={'_blank'}>
                    <TelegramIcon fontSize={'small'} />
                </Link>
            </IconButton>
            <IconButton color="primary">
                <Link href={'https://t.me/zeRealSchlausKwab'} rel={'noreferrer'} target={'_blank'}>
                    <GitHubIcon fontSize={'small'} />
                </Link>
            </IconButton>
        </div>
    )
}
