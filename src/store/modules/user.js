import { defineStore } from 'pinia'
import { authenticated, logOut, userInfo } from '@/api/user'
import defAva from '@/assets/images/profile.jpg'

const userStore = defineStore('user', {
    state: () => ({
        authenticated: authenticated(),
        name: '',
        avatar: '',
        roles: [],
        permissions: []
    }),
    actions: {
        authenticated() {
            return new Promise((resolve, reject) => {
                authenticated().then(res => {
                    resolve(res)
                }).catch(error => {
                    reject(false)
                })
            })
        },
        // 获取用户信息
        getInfo() {
            return new Promise((resolve, reject) => {
                userInfo().then(res => {
                    // const user = res.user
                    // const avatar = (user.avatar == "" || user.avatar == null) ? defAva : import.meta.env.VITE_APP_BASE_API + user.avatar;
                    //
                    // if (res.roles && res.roles.length > 0) { // 验证返回的roles是否是一个非空数组
                    //     this.roles = res.roles
                    //     this.permissions = res.permissions
                    // } else {
                    //     this.roles = ['ROLE_DEFAULT']
                    // }
                    // this.name = user.userName
                    // this.avatar = avatar;

                    resolve(res)
                }).catch(error => {
                    reject(error)
                })
            })
        },
        // 退出系统
        logOut() {
            return new Promise((resolve, reject) => {
                logOut().then(() => {
                    this.name = ''
                    this.avatar = ''
                    this.roles = []
                    this.permissions = []

                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        }
    }
})

export default userStore
