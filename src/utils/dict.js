import useDictStore from '@/store/modules/dict'
import { getDicts } from '@/api/system/dict/data'

/**
 * 获取字典数据
 */
export function useDict(...args) {
    const res = ref({})
    return (() => {
        args.forEach((dictType, index) => {
            res.value[dictType] = []
            const dicts = useDictStore().getDict(dictType)
            if (dicts) {
                res.value[dictType] = dicts
            } else {
                getDicts(dictType).then(resp => {
                    res.value[dictType] = resp.data.map(p => ({
                        label: p.dictLabel,
                        value: convertDictValue(p),
                        elTagType: p.listClass,
                        elTagClass: p.cssClass
                    }))
                    useDictStore().setDict(dictType, res.value[dictType])
                })
            }
        })
        return toRefs(res.value)
    })()
}

function convertDictValue(data) {
    if (data.dictValueType === 'boolean') {
        return data.dictValue === '1'
    }
    if (data.dictValueType === 'number') {
        return Number(data.dictValue)
    }
    return data.dictValue
}
