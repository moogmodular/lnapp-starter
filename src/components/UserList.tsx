import { trpc } from '~/utils/trpc'
import { UserSingle } from '~/components/UserSingle'
import autoAnimate from '@formkit/auto-animate'
import { useEffect, useRef } from 'react'
import { CircularProgress } from '@mui/material'

export const UserList = ({}) => {
    const { data: userListData, isLoading: userListIsLoading } = trpc.user.listLatest.useQuery({ limit: 50 })

    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    return (
        <div ref={parent} className={'w-full'}>
            <div className={'w-full text-center'}>{userListIsLoading && <CircularProgress />}</div>
            {userListData &&
                userListData.map((user) => {
                    return <UserSingle key={user.id} user={user} />
                })}
        </div>
    )
}
