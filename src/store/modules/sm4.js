import { defineStore } from 'pinia'
import { getConfigByKey } from '@/api/system/config'
import JSSM4 from 'jssm4'

const CONFIG_KEY = 'sys.pw.sm4.salt'

const useSm4Store = defineStore('sm4', {
    state: () => ({
        sKey: '',
        sm4: null
    }),
    actions: {
        encrypt(key) {
            return this.init().then(res => {
                if (res) {
                    return key ? this.sm4.encryptData_ECB(key) : key
                }
                return ''
            })
        },
        decrypt(value) {
            return this.init().then(res => {
                if (res) {
                    return value ? this.sm4.decryptData_ECB(value) : value
                }
                return ''
            })
        },
        init() {
            return new Promise((resolve, reject) => {
                if (this.sm4) {
                    resolve(true)
                    return
                }
                if (this.sKey) {
                    this.sm4 = new JSSM4(this.sKey)
                    resolve(true)
                    return
                }

                getConfigByKey(CONFIG_KEY)
                    .then(res => {
                        if (res.data['value']) {
                            this.sKey = res.data['value']
                            this.sm4 = new JSSM4(res.data['value'].substring(1 << (1 + 1)))
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    })
                    .catch(err => {
                        resolve(false)
                    })
            })
        }
    }
})

export default useSm4Store
