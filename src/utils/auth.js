import useUserStore from '@/store/modules/user'

export function authenticated() {
    return useUserStore().authenticated()
}
