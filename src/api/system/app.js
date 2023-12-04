import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/common'

// 查询应用列表
export function listApps(query) {
    return request({
        url: '/system/client/list',
        method: 'get',
        params: query
    })
}

// 查询用户详细
export function getApp(clientName) {
    return request({
        url: '/system/client/' + parseStrEmpty(clientName),
        method: 'get'
    })
}

// 新增用户
export function addApp(data) {
    return request({
        url: '/system/client',
        method: 'post',
        data: data
    })
}

// 修改用户
export function updateApp(data) {
    return request({
        url: '/system/client',
        method: 'put',
        data: data
    })
}

// 用户密码重置
export function resetAppPwd(id, passwd) {
    const data = {
        id,
        passwd
    }
    return request({
        url: '/system/client/resetPasswd',
        method: 'put',
        data: data
    })
}

// 用户状态修改
export function changeAppStatus(id, status) {
    const data = {
        id,
        status
    }
    return request({
        url: '/system/client/changeStatus',
        method: 'put',
        data: data
    })
}
