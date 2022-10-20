import request from '@/utils/request'

// 查询调度日志列表
export function listJobLog(query) {
  return request({
    url: '/monitor/taskLog/list',
    method: 'get',
    params: query
  })
}

// 删除调度日志
export function delJobLog(taskLogId) {
  return request({
    url: '/monitor/taskLog/' + taskLogId,
    method: 'delete'
  })
}

// 清空调度日志
export function cleanJobLog() {
  return request({
    url: '/monitor/taskLog/clean',
    method: 'delete'
  })
}
