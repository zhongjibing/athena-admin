import request from '@/utils/request'

// 查询参数列表
export function listConfig(query) {
    return request({
        url: '/system/config/list',
        method: 'get',
        params: query
    })
}

// 查询参数详细
export function getConfig(configId) {
    return request({
        url: '/system/config/' + configId,
        method: 'get'
    })
}

// 根据参数键名查询参数值
export function getConfigByKey(configKey) {
    return request({
        url: '/system/config',
        method: 'get',
        params: {key: configKey}
    })
}

// 新增参数配置
export function addConfig(data) {
    return request({
        url: '/system/config',
        method: 'post',
        data: data
    })
}

// 修改参数配置
export function updateConfig(data) {
    return request({
        url: '/system/config',
        method: 'put',
        data: data
    })
}

// 删除参数配置
export function delConfig(configIds) {
    return request({
        url: '/system/config',
        method: 'delete',
        data: configIds
    })
}

