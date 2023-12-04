import { defineStore } from 'pinia'
import { authenticated, logOut, userInfo } from '@/api/user'
import defAva from '@/assets/images/profile.jpg'

const userStore = defineStore('user', {
    state: () => ({
        defAva: defAva,
        status: null,
        name: '',
        avatar: '',
        roles: [],
        permissions: [],
        authorities: [],
        csrf: ''
    }),
    actions: {
        async authenticated() {
            if (this.status === null) {
                const res = await authenticated()
                this.status = res.data
                if (this.status) {
                    this.csrf = res.headers['x-csrf-token'] || ''
                }
            }
            return this.status
        },
        // 获取用户信息
        getInfo() {
            return new Promise((resolve, reject) => {
                userInfo()
                    .then(res => {
                        this.status = res.data['name'] === 'anonymousUser' ? 0 : 1
                        this.name = res.data['name']
                        this.avatar = res.data['picture']
                            ? import.meta.env.VITE_APP_PIC_VIEW_PREFIX + res.data['picture']
                            : defAva
                        this.roles = res.data['authorities'] || ['ROLE_DEFAULT']
                        this.permissions = ['*:*:*']
                        resolve(res.data)
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
        },
        // 退出系统
        logOut() {
            return new Promise((resolve, reject) => {
                logOut()
                    .then(() => {
                        this.status = null
                        this.name = ''
                        this.avatar = ''
                        this.roles = []
                        this.permissions = []

                        resolve()
                    })
                    .catch(error => {
                        reject(error)
                    })
            })
        }
    }
})

export default userStore
