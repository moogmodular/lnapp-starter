import { useStore } from 'zustand'
import { authedUserStore } from '~/store/authedUserStore'

interface WelcomeScreenProps {
    close: () => void
}

export const WelcomeScreen = ({}: WelcomeScreenProps) => {
    const { user } = useStore(authedUserStore)

    return (
        <div>
            Hello <b>@{user?.userName}</b> welcome to the <b>LN App starter</b> demo. If you see any bugs or have any
            suggestions please head to the{' '}
            <a href={'https://github.com/zerealschlauskwab/lnapp-starter'} className={'underline hover:text-blue-500'}>
                repo
            </a>{' '}
            and create an issue.
        </div>
    )
}
