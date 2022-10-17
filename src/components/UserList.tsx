import { trpc } from '~/utils/trpc'
import { UserSingle } from '~/components/UserSingle'
import { Spinner } from '~/components/Spinner'
import autoAnimate from '@formkit/auto-animate'
import { useEffect, useRef, useState } from 'react'

export const UserList = ({}) => {
    const { data: userListData, isLoading: userListIsLoading } = trpc.user.listLatest.useQuery({ limit: 10 })

    const [show, setShow] = useState(false)
    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    return (
        <div ref={parent} className={'w-full'}>
            <div className={'w-full text-center'}>{userListIsLoading && <Spinner />}</div>
            {userListData &&
                userListData.map((user) => {
                    return <UserSingle key={user.id} user={user} />
                })}
        </div>
    )
}
