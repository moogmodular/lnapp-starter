import useAuthStore from '~/store/useAuthStore'
import { useEffect, useRef, useState } from 'react'
import { IconPropertyDisplay } from '~/components/IconPropertyDisplay'
import autoAnimate from '@formkit/auto-animate'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { Button } from '@mui/material'
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin'
import BoltIcon from '@mui/icons-material/Bolt'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import BadgeIcon from '@mui/icons-material/Badge'

interface HeaderProps {
    openAuthenticate: () => void
    openTransact: () => void
    openEditUser: () => void
}

export const Header = ({ openAuthenticate, openTransact, openEditUser }: HeaderProps) => {
    const [balanceHover, setBalanceHover] = useState(false)
    const { user, logout } = useAuthStore()

    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    const handleLogout = () => {
        logout()
    }

    return (
        <div className={'h-18 flex flex-col border-2 border-black p-3 text-sm'}>
            {user ? (
                <div className={'flex flex-row justify-center justify-between gap-4'}>
                    {user.profileImage ? (
                        <button onClick={openEditUser} id={'button-edit-profile'}>
                            <img
                                className="mr-2 h-10 w-10"
                                src={user.profileImage}
                                alt={`profile image of ${user.userName}`}
                            />
                        </button>
                    ) : (
                        <AccountCircleIcon fontSize={'medium'} />
                    )}

                    <div className={'grow'}>
                        <div>
                            <IconPropertyDisplay identifier={'publicKey'} value={user.publicKey?.slice(0, 24) + '...'}>
                                <FingerprintIcon fontSize={'small'} />
                            </IconPropertyDisplay>
                            <IconPropertyDisplay identifier={'userName'} value={'@' + user.userName}>
                                <AccountCircleIcon fontSize={'small'} />
                            </IconPropertyDisplay>
                        </div>
                    </div>
                    <div className={'grow'}>
                        <IconPropertyDisplay identifier={'id'} value={user.id}>
                            <BadgeIcon fontSize={'small'} />
                        </IconPropertyDisplay>
                        <IconPropertyDisplay
                            identifier={'createdAt'}
                            value={format(user.createdAt ?? 0, standardDateFormat)}
                        >
                            <AccessTimeIcon fontSize={'small'} />
                        </IconPropertyDisplay>
                    </div>

                    <Button
                        onMouseEnter={() => setBalanceHover(true)}
                        onMouseLeave={() => setBalanceHover(false)}
                        ref={parent}
                        variant="contained"
                        onClick={openTransact}
                        id={'button-transact'}
                        color="primary"
                    >
                        <CurrencyBitcoinIcon fontSize={'medium'} color={'warning'} />
                        {balanceHover ? (
                            <div>
                                <p className={'text-xs'}>{user.balance}</p>
                            </div>
                        ) : null}
                    </Button>

                    <Button variant="contained" onClick={handleLogout} id={'logout-button'} color="primary">
                        <BoltIcon fontSize={'medium'} color={'warning'} />
                    </Button>
                </div>
            ) : (
                <Button variant="contained" onClick={openAuthenticate} id={'open-authenticate-button'} color="primary">
                    <BoltIcon fontSize={'medium'} />
                </Button>
            )}
        </div>
    )
}
