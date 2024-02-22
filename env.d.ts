/// <reference types="vite/client" />
declare module '*.vue' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'crypto-js'
declare module 'sm-crypto'

declare module '@/types/global'
