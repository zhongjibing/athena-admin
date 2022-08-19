import {defineConfig, loadEnv} from 'vite'
import createVitePlugins from './vite/plugins'
import path from 'path'

// https://vitejs.cn/config/
export default defineConfig(({mode, command}) => {
    const env = loadEnv(mode, process.cwd())
    const {VITE_APP_ENV, VITE_APP_SERVER_PORT} = env
    const port = VITE_APP_SERVER_PORT || 8080
    return {
        base: VITE_APP_ENV === 'production' ? '/' : '/',
        plugins: createVitePlugins(env, command === 'build'),
        resolve: {
            alias: {
                '~': path.resolve(__dirname, './'),
                '@': path.resolve(__dirname, './src')
            },
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
        },
        server: {
            port: port,
            host: "icezhg.cn",
            open: false,
            proxy: {
                '/dev': {
                    target: 'http://icezhg.cn:8092',
                    changeOrigin: true,
                    rewrite: (p) => p.replace(/^\/dev/, '')
                },
                '/oauth2': {
                    target: 'http://icezhg.cn:8092',
                    changeOrigin: true,
                    rewrite: (p) => p.replace(/^\/dev/, ''),
                    configure: (proxy, options) => {
                        proxy.on('proxyRes', (proxyRes, req, res) => {
                            if (proxyRes.statusCode === 302) {
                                console.log(proxyRes.headers)
                                res.writeHead(232, proxyRes.headers)
                            }
                        })
                    },
                    cookieDomainRewrite: {
                        '*': 'icezhg.cn'
                    },
                    cookiePathRewrite: {
                        '*': '/'
                    }
                }
            }
        }
    }
})
