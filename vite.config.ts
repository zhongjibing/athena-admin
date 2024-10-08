import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'
import setupExtend from 'vite-plugin-vue-setup-extend'
import autoImport from 'unplugin-auto-import/vite'
import topLevelAwait from 'vite-plugin-top-level-await'
import { createStyleImportPlugin, VxeTableResolve } from 'vite-plugin-style-import'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const { VITE_APP_SERVER_PORT, VITE_APP_SERVER_BASE } = env
    const port = parseInt(VITE_APP_SERVER_PORT || '8080')
    return {
        root: process.cwd(), // 项目根目录
        base: VITE_APP_SERVER_BASE,
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                '/@': fileURLToPath(new URL('./src', import.meta.url))
            },
            extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
        },
        plugins: [
            vue(), // Vue 插件
            vueJsx(),
            setupExtend(), // setup语法糖增强插件
            autoImport({
                imports: ['vue', 'vue-router', 'pinia'], // 自动导入的依赖库数组
                dts: 'auto-imports.d.ts' // 自动导入类型定义文件路径
            }),
            createStyleImportPlugin({
                resolves: [VxeTableResolve()] // 配置vxetable 按需加载
            }),
            topLevelAwait({
                promiseExportName: '__tla', // TLA Promise 变量名
                promiseImportName: i => `__tla_${i}` // TLA Promise 导入名
            }),
            viteCompression({
                deleteOriginFile: false // 压缩后删除原来的文件
            })
        ],
        optimizeDeps: {
            include: ['element-plus/dist/locale/zh-cn.mjs', 'element-plus/dist/locale/en.mjs']
        },
        server: {
            port: port,
            host: '0.0.0.0',
            open: false, // 是否自动打开浏览器
            hmr: true // 启用热更新
        },
        build: {
            outDir: 'dist', // 打包输出目录
            chunkSizeWarningLimit: 1500, // 代码分包阈值
            rollupOptions: {
                output: {
                    entryFileNames: `assets/[name].[hash].js`,
                    chunkFileNames: `assets/[name].[hash].js`,
                    assetFileNames: `assets/[name].[hash].[ext]`,
                    compact: true,
                    manualChunks: {
                        vue: ['vue', 'vue-router', 'pinia'],
                        echarts: ['echarts']
                    }
                }
            }
        },
        css: { preprocessorOptions: { css: { charset: false } } },
        define: {
            __NEXT_NAME__: JSON.stringify(process.env.npm_package_name)
        }
    }
})
