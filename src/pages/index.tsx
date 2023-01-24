import { trpc } from '../utils/trpc'
import { NextPageWithLayout } from './_app'
import { useEffect, useState } from 'react'
import { Header } from '~/components/Header'
import useAuthStore from '~/store/useAuthStore'
import { Authenticate } from '~/components/Authenticate'
import { Transact } from '~/components/Transact'
import { UserList } from '~/components/UserList'
import { Footer } from '~/components/Footer'
import { InteractionModal } from '~/components/InteractionModal'
import { EditUser } from '~/components/EditUser'
import { WelcomeScreen } from '~/components/WelcomeScreen'

const IndexPage: NextPageWithLayout = () => {
    const { user, setUser, storeToken, storeLogin } = useAuthStore()
    const [modal, setModal] = useState<'none' | 'authenticate' | 'transact' | 'editUser' | 'welcome'>('none')

    const utils = trpc.useContext()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            storeLogin(token)
        }
        if (storeToken) {
            utils.auth.getMe.fetch().then((data) => {
                setUser(data)
                setModal('none')
            })
        }
    }, [storeToken])

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden px-2">
            <div className="absolute inset-y-60  -z-10 h-4/5 overflow-hidden blur-xl">
                <img src="/the_one_and_only_king.jpg" alt="The one and only king" className={'h-full w-full'} />
            </div>
            <div className={'flex h-full w-full flex-col self-center py-4 lg:w-3/5'}>
                <div>
                    <Header
                        openAuthenticate={() => setModal('authenticate')}
                        openTransact={() => setModal('transact')}
                        openEditUser={() => setModal('editUser')}
                    />
                </div>
                <div>
                    {
                        {
                            authenticate: (
                                <InteractionModal title={'Authenticate'} close={() => setModal('none')}>
                                    <Authenticate openWelcomeDialog={() => setModal('welcome')} />
                                </InteractionModal>
                            ),
                            transact: (
                                <InteractionModal title={'Transact'} close={() => setModal('none')}>
                                    <Transact />
                                </InteractionModal>
                            ),
                            editUser: (
                                <InteractionModal title={'Edit User'} close={() => setModal('none')}>
                                    <EditUser close={() => setModal('none')} />
                                </InteractionModal>
                            ),
                            welcome: (
                                <InteractionModal title={'Welcome!'} close={() => setModal('none')}>
                                    <WelcomeScreen close={() => setModal('none')} />
                                </InteractionModal>
                            ),
                            none: null,
                        }[modal]
                    }
                </div>
                <div className={'no-scrollbar mt-4 flex grow justify-center overflow-x-auto'}>
                    <UserList />
                </div>
                <div>
                    <Footer />
                </div>
            </div>
        </div>
    )
}

export default IndexPage
