import { authenticated as isLogin } from '@/api/user'

export function authenticated() {
    return isLogin()
}

export function getToken() {
    return ""
}

export function setToken(token) {
}

export function removeToken() {
}
