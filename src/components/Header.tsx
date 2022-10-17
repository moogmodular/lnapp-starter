import useAuthStore from '~/store/useAuthStore'
import { useEffect, useRef, useState } from 'react'
import { IconPropertyDisplay } from '~/components/IconPropertyDisplay'
import autoAnimate from '@formkit/auto-animate'
import { format } from 'date-fns'
import { standardDateFormat } from '~/utils/date'

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
                <div className={'flex flex-row justify-center justify-between'}>
                    {user.profileImage ? (
                        <button onClick={openEditUser} id={'button-edit-profile'}>
                            <img
                                className="mr-2 h-10 w-10"
                                src={user.profileImage}
                                alt={`profile image of ${user.userName}`}
                            />
                        </button>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="mr-2 h-10 w-10"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                        </svg>
                    )}

                    <div className={'grow'}>
                        <div>
                            <IconPropertyDisplay identifier={'publicKey'} value={user.publicKey?.slice(0, 24) + '...'}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-3 w-3"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-4.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                                    />
                                </svg>
                            </IconPropertyDisplay>
                            <IconPropertyDisplay identifier={'userName'} value={'@' + user.userName}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-4 w-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-4 0 3 3 0 016 0z"
                                    />
                                </svg>
                            </IconPropertyDisplay>
                        </div>
                    </div>
                    <div className={'grow'}>
                        <IconPropertyDisplay identifier={'id'} value={user.id}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                                />
                            </svg>
                        </IconPropertyDisplay>
                        <IconPropertyDisplay
                            identifier={'createdAt'}
                            value={format(user.createdAt ?? 0, standardDateFormat)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </IconPropertyDisplay>
                    </div>

                    <div
                        className={'flex flex-col items-center'}
                        onMouseEnter={() => setBalanceHover(true)}
                        onMouseLeave={() => setBalanceHover(false)}
                        ref={parent}
                    >
                        <button onClick={openTransact} id={'button-transact'}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                className={`${balanceHover ? 'h-6 w-10' : 'h-10 w-10'}`}
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 18v-1.511h-.5v1.511h-1v-1.511h-2.484l.25-1.489h.539c.442 0 .695-.425.695-.854v-4.444c0-.416-.242-.702-.683-.702h-.817v-1.5h2.5v-1.5h1v1.5h.5v-1.5h1v1.526c2.158.073 3.012.891 3.257 1.812.29 1.09-.429 2.005-1.046 2.228.75.192 1.789.746 1.789 2.026 0 1.742-1.344 2.908-4 2.908v1.5h-1zm-.5-5.503v2.503c1.984 0 3.344-.188 3.344-1.258 0-1.148-1.469-1.245-3.344-1.245zm0-.997c1.105 0 2.789-.078 2.789-1.25 0-1-1.039-1.25-2.789-1.25v2.5z" />
                            </svg>

                            {balanceHover ? (
                                <div>
                                    <p className={'text-xs'}>{user.balance}</p>
                                </div>
                            ) : null}
                        </button>
                    </div>

                    <button onClick={handleLogout} id={'logout-button'}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="yellow"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="ml-2 h-10 w-10"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                            />
                        </svg>
                    </button>
                </div>
            ) : (
                <button onClick={openAuthenticate} id={'open-authenticate-button'}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="ml-auto h-10 w-10"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                        />
                    </svg>
                </button>
            )}
        </div>
    )
}
