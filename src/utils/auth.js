import useUserStore from '@/store/modules/user'

export function authenticated() {
    return useUserStore().authenticated()
}

export function getToken() {
    return ""
}

export function setToken(token) {
}

export function removeToken() {
}
