import useAuthStore from '~/store/useAuthStore'
import { useEffect, useRef, useState } from 'react'
import { IconPropertyDisplay } from '~/components/IconPropertyDisplay'
import autoAnimate from '@formkit/auto-animate'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'
import { Avatar, Button, Tooltip } from '@mui/material'
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
                        <Tooltip title={'edit user'}>
                            <Avatar
                                onClick={openEditUser}
                                id={'button-edit-profile'}
                                alt={`profile image of ${user.userName}`}
                                src={user.profileImage}
                            />
                        </Tooltip>
                    ) : (
                        <AccountCircleIcon fontSize={'medium'} />
                    )}

                    <div className={'grow text-xs lg:text-base'}>
                        <div>
                            <IconPropertyDisplay identifier={'publicKey'} value={user.publicKey?.slice(0, 16) + '...'}>
                                <FingerprintIcon fontSize={'small'} />
                            </IconPropertyDisplay>
                            <IconPropertyDisplay identifier={'userName'} value={'@' + user.userName}>
                                <AccountCircleIcon fontSize={'small'} />
                            </IconPropertyDisplay>
                        </div>
                    </div>
                    <div className={'hidden grow lg:block'}>
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

                    <Tooltip title={'transactions & balance'}>
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
                    </Tooltip>

                    <Tooltip title={'un-authenticate'}>
                        <Button variant="contained" onClick={handleLogout} id={'logout-button'} color="primary">
                            <BoltIcon fontSize={'medium'} color={'warning'} />
                        </Button>
                    </Tooltip>
                </div>
            ) : (
                <Tooltip title={'authenticate'}>
                    <Button
                        variant="contained"
                        onClick={openAuthenticate}
                        id={'open-authenticate-button'}
                        color="primary"
                        className={'w-28 self-end'}
                    >
                        <BoltIcon fontSize={'medium'} color={'warning'} />
                    </Button>
                </Tooltip>
            )}
        </div>
    )
}
