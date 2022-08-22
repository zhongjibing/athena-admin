import request from '@/utils/request'
import { constantRoutes, dynamicRoutes } from '@/router'

// 获取路由
export const getRouters = () => {
  return new Promise(resolve => resolve({data: constantRoutes}))
}
