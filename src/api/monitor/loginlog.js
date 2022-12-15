import request from '@/utils/request'

// 查询登录日志列表
export function list(query) {
    return request({
        url: '/monitor/login/records',
        method: 'get',
        params: query
    })
}
