import axios from 'axios'
import {ElLoading, ElMessage, ElMessageBox} from 'element-plus'
import errorCode from '@/utils/errorCode'
import {blobValidate, tansParams} from '@/utils/ruoyi'
import cache from '@/plugins/cache'
import {saveAs} from 'file-saver'
import useUserStore from '@/store/modules/user'

let downloadLoadingInstance;
// 是否显示重新登录
export let isRelogin = {show: false};

const service = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API,
    headers: {'Accept': 'application/json'},
    timeout: 10000,
    withCredentials: true
})

service.interceptors.request.use(config => {
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
    if (config.method === 'get' && config.params) {
        let url = config.url + '?' + tansParams(config.params);
        url = url.slice(0, -1);
        config.params = {};
        config.url = url;
    }
    if (config.method === 'post' || config.method === 'put') {
        config.headers['X-CSRF-TOKEN'] = useUserStore().csrf
    }
    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
        const requestObj = {
            url: config.url,
            data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
            time: new Date().getTime()
        }
        const sessionObj = cache.session.getJSON('sessionObj')
        if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
            cache.session.setJSON('sessionObj', requestObj)
        } else {
            const s_url = sessionObj.url;                // 请求地址
            const s_data = sessionObj.data;              // 请求数据
            const s_time = sessionObj.time;              // 请求时间
            const interval = 1000;                       // 间隔时间(ms)，小于此时间视为重复提交
            if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
                const message = '数据正在处理，请勿重复提交';
                return Promise.reject(new Error(message))
            } else {
                cache.session.setJSON('sessionObj', requestObj)
            }
        }
    }
    return config
}, error => {
    console.log(error)
    Promise.reject(error)
})

service.interceptors.response.use(response => {
        console.log(response)
        return Promise.resolve(response)
    },
    error => {
        const code = error.response.status
        if (code === 401) {
            if (!isRelogin.show) {
                isRelogin.show = true
                ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
                        confirmButtonText: '重新登录',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                ).then(() => {
                    isRelogin.show = false;
                    useUserStore().logOut().then(() => {
                        location.href = import.meta.env.VITE_APP_LOGIN_PAGE
                    })
                }).catch(() => {
                    isRelogin.show = false;
                });
            }
            return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
        }
        if (code === 500) {
            ElMessage({
                message: "msg",
                type: 'error'
            })
            return Promise.reject(new Error("msg"))
        }

        ElMessage({
            message: message,
            type: 'error',
            duration: 5 * 1000
        })
        return Promise.reject(error)
    }
)

// 通用下载方法
export function download(url, params, filename) {
    downloadLoadingInstance = ElLoading.service({text: "正在下载数据，请稍候", background: "rgba(0, 0, 0, 0.7)",})
    return service.post(url, params, {
        transformRequest: [(params) => {
            return tansParams(params)
        }],
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        responseType: 'blob'
    }).then(async (data) => {
        const isLogin = await blobValidate(data);
        if (isLogin) {
            const blob = new Blob([data])
            saveAs(blob, filename)
        } else {
            const resText = await data.text();
            const rspObj = JSON.parse(resText);
            const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
            ElMessage.error(errMsg);
        }
        downloadLoadingInstance.close();
    }).catch((r) => {
        console.error(r)
        ElMessage.error('下载文件出现错误，请联系管理员！')
        downloadLoadingInstance.close();
    })
}

export default service
