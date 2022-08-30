import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import {isHttp} from '@/utils/validate'
import {isRelogin} from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import { authenticated } from "./utils/auth.js";

NProgress.configure({showSpinner: false})

const whiteList = []

router.beforeEach((to, from, next) => {
    NProgress.start()
    if (authenticated()) {
        to.meta.title && useSettingsStore().setTitle(to.meta.title)
        if (useUserStore().roles.length === 0) {
            isRelogin.show = true
            // 判断当前用户是否已拉取完user_info信息
            useUserStore().getInfo().then(() => {
                isRelogin.show = false
                usePermissionStore().generateRoutes().then(accessRoutes => {
                    // 根据roles权限生成可访问的路由表
                    accessRoutes.forEach(route => {
                        if (!isHttp(route.path)) {
                            console.log(route)

                            router.addRoute(route) // 动态添加可访问路由表
                        }
                    })
                    next({...to, replace: true}) // hack方法 确保addRoutes已完成
                })
            }).catch(err => {
                console.log(err)
                useUserStore().logOut().then(() => {
                    ElMessage.error(err)
                    next({path: '/'})
                })
            })
        } else {
            next()
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) {
            next()
        } else {
            NProgress.done()
            location.href = import.meta.env.VITE_APP_LOGIN_PAGE
        }
    }
})

router.afterEach(() => {
    NProgress.done()
})
