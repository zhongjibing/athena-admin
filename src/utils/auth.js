import useUserStore from '@/store/modules/user'

export function authenticated() {
    return useUserStore().status
}

export function getToken() {
    return ""
}

export function setToken(token) {
}

export function removeToken() {
}
