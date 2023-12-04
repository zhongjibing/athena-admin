import request from '@/utils/request'

// 查询调度日志列表
export function listLogs(query) {
    return request({
        url: '/monitor/task/log/list',
        method: 'get',
        params: query
    })
}
