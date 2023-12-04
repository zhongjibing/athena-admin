import request from '@/utils/request'

// 查询参数列表
export function list(query) {
    return request({
        url: '/system/passwd/list',
        method: 'get',
        params: query
    })
}

// 查询参数详细
export function get(id) {
    return request({
        url: '/system/passwd/' + id,
        method: 'get'
    })
}

// 新增参数配置
export function add(data) {
    return request({
        url: '/system/passwd',
        method: 'post',
        data: data
    })
}

// 修改参数配置
export function update(data) {
    return request({
        url: '/system/passwd',
        method: 'put',
        data: data
    })
}

// 删除参数配置
export function del(ids) {
    return request({
        url: '/system/passwd',
        method: 'delete',
        data: ids
    })
}

// 生成参数配置
export function generate(size) {
    return request({
        url: '/system/passwd/generate',
        method: 'get',
        params: { size: size }
    })
}

// 查询密码
export function passwd(id, secretKey) {
    return request({
        url: '/system/passwd/' + id,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        method: 'post',
        data: 'secretKey=' + encodeURIComponent(secretKey)
    })
}
