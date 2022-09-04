import { defineStore } from 'pinia'
import { authenticated, logOut, userInfo } from '@/api/user'
import defAva from '@/assets/images/profile.jpg'

const userStore = defineStore('user', {
    state: () => ({
        status: authenticated(),
        name: '',
        avatar: '',
        roles: [],
        permissions: [],
        csrf: ''
    }),
    actions: {
        // 获取用户信息
        getInfo() {
            return new Promise((resolve, reject) => {
                userInfo().then(res => {
                    this.status = res.data['name'] === 'anonymousUser' ? 0 : 1
                    this.name = res.data['name']
                    this.avatar = res.data['picture'] || defAva
                    this.roles = res.data['authorities'] || ['ROLE_DEFAULT']
                    this.csrf = res.headers['x-csrf-token'] || ''
                    this.permissions = ['*:*:*']
                    resolve(res.data)
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
