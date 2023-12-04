const useConfigStore = defineStore('config', {
    state: () => ({
        configs: {}
    }),
    actions: {
        getConfig(key) {
            if (!key) {
                return null
            }
            if (this.dict.hasOwnProperty(key)) {
                return this.dict[key]
            }
            return null
        },
        setConfig(key, value) {
            if (key !== null && key !== '') {
                this.dict[key] = value
            }
        },
        removeConfig(key) {
            return delete this.dict[key]
        },
        clear() {
            this.dict = {}
        }
    }
})

export default useConfigStore
