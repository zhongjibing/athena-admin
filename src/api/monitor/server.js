import request from '@/utils/request'

// 获取服务信息
export function getServer(name) {
    return request({
        url: '/monitor/server',
        method: 'get',
        params: { name }
    })
}
