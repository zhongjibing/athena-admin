import { defineConfig, loadEnv } from 'vite'
import createVitePlugins from './vite/plugins'
import path from 'path'

// https://vitejs.cn/config/
export default defineConfig(({mode, command}) => {
    const env = loadEnv(mode, process.cwd())
    const { VITE_APP_SERVER_PORT, VITE_APP_SERVER_BASE } = env
    const port = VITE_APP_SERVER_PORT || 8080
    return {
        base: VITE_APP_SERVER_BASE,
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
            open: false
        }
    }
})
