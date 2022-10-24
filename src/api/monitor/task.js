import request from '@/utils/request'

// 查询定时任务调度列表
export function listTask(query) {
  return request({
    url: '/monitor/task/list',
    method: 'get',
    params: query
  })
}

// 查询定时任务调度详细
export function getTask(taskId) {
  return request({
    url: '/monitor/task/' + taskId,
    method: 'get'
  })
}

// 新增定时任务调度
export function addTask(data) {
  return request({
    url: '/monitor/task',
    method: 'post',
    data: data
  })
}

// 修改定时任务调度
export function updateTask(data) {
  return request({
    url: '/monitor/task',
    method: 'put',
    data: data
  })
}

// 删除定时任务调度
export function delTask(taskId) {
  return request({
    url: '/monitor/task/' + taskId,
    method: 'delete'
  })
}

// 任务状态修改
export function changeTaskStatus(taskId, status) {
  const data = {
    id: taskId,
    status: status
  }
  return request({
    url: '/monitor/task/changeStatus',
    method: 'put',
    data: data
  })
}


// 定时任务立即执行一次
export function runTask(taskId) {
  const data = {
    taskId
  }
  return request({
    url: '/monitor/task/run',
    method: 'post',
    params: data
  })
}
