import create from 'zustand'
import authedUserStore from '~/store/authedUserStore'

const useAuthStore = create(authedUserStore)

export default useAuthStore
