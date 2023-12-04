import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { isHttp } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'
import { authenticated } from '@/utils/auth'

NProgress.configure({ showSpinner: false })

const whiteList = []

router.beforeEach(async (to, from, next) => {
    NProgress.start()
    const isLogin = await authenticated()
    if (isLogin) {
        to.meta.title && useSettingsStore().setTitle(to.meta.title)
        // 判断当前用户是否已拉取完user_info信息
        if (useUserStore().roles.length === 0) {
            isRelogin.show = true
            try {
                await useUserStore().getInfo()
                isRelogin.show = false
                const accessRoutes = await usePermissionStore().generateRoutes()
                // 根据roles权限生成可访问的路由表
                accessRoutes.forEach(route => {
                    if (!isHttp(route.path)) {
                        router.addRoute(route) // 动态添加可访问路由表
                    }
                })
                next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
            } catch (err) {
                console.log(err)
                await useUserStore()
                    .logOut()
                    .catch(() => {})
                next({ path: '/' })
            }
        } else {
            next()
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) {
            next()
        } else {
            next(false)
            location.href = import.meta.env.VITE_APP_LOGIN_PAGE
        }
    }
})

router.afterEach(() => {
    NProgress.done()
})
