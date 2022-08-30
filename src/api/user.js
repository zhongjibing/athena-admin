import request from '@/utils/request'
import ajax from '@/utils/ajax';

export function authenticated() {
    const result = ajax({
        url: import.meta.env.VITE_APP_BASE_API + '/authenticated',
        method: 'get'
    })
    return result === 'true'
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
