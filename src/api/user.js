import request from '@/utils/request'

export function authenticated() {
    return request({
        url: '/authenticated',
        method: 'get'
    })
}

export function userInfo() {
    return request({
        url: '/user/info',
        method: 'get'
    })
}

export function logOut() {
    return request({
        url: '/logout',
        method: 'post'
    })
}
