const useDictStore = defineStore('dict', {
    state: () => ({
        dict: {}
    }),
    actions: {
        // 获取字典
        getDict(_key) {
            if (_key == null && _key === "") {
                return null;
            }
            if (this.dict.hasOwnProperty(_key)) {
                return this.dict[_key]
            }
            return null
        },
        // 设置字典
        setDict(_key, value) {
            if (_key !== null && _key !== "") {
                this.dict[_key] = value
            }
        },
        // 删除字典
        removeDict(_key) {
            return delete this.dict[_key]
        },
        // 清空字典
        cleanDict() {
            this.dict = {};
        },
        // 初始字典
        initDict() {
        }
    }
})

export default useDictStore
