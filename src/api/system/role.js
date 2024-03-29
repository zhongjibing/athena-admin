import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
    return request({
        url: '/system/role/list',
        method: 'get',
        params: query
    })
}

// 查询角色详细
export function getRole(roleId) {
    return request({
        url: '/system/role/' + roleId,
        method: 'get'
    })
}

// 新增角色
export function addRole(data) {
    return request({
        url: '/system/role',
        method: 'post',
        data: data
    })
}

// 修改角色
export function updateRole(data) {
    return request({
        url: '/system/role',
        method: 'put',
        data: data
    })
}

// 角色数据权限
export function dataScope(data) {
    return request({
        url: '/system/role/dataScope',
        method: 'put',
        data: data
    })
}

// 角色状态修改
export function changeRoleStatus(id, status) {
    const data = {
        id,
        status
    }
    return request({
        url: '/system/role/changeStatus',
        method: 'put',
        data: data
    })
}

// 删除角色
export function delRole(roleIds) {
    return request({
        url: '/system/role',
        method: 'delete',
        data: roleIds
    })
}

// 查询角色已授权用户列表
export function allocatedUserList(roleId, query) {
    return request({
        url: '/system/role/' + roleId + '/allocatedUsers',
        method: 'get',
        params: query
    })
}

// 查询角色未授权用户列表
export function unallocatedUserList(roleId, query) {
    return request({
        url: '/system/role/' + roleId + '/unallocatedUsers',
        method: 'get',
        params: query
    })
}

// 取消用户授权角色
export function authUserCancel(roleId, userIds) {
    return request({
        url: '/system/role/' + roleId + '/authUser',
        method: 'delete',
        data: userIds
    })
}

// 授权用户选择
export function authUserSelect(roleId, userIds) {
    return request({
        url: '/system/role/' + roleId + '/authUser',
        method: 'post',
        data: userIds
    })
}

// 根据角色ID查询部门树结构
export function deptTreeSelect(roleId) {
    return request({
        url: '/system/role/deptTree/' + roleId,
        method: 'get'
    })
}
