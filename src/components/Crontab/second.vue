<template>
    <el-form size="small">
        <el-form-item>
            <el-radio v-model='radioValue' :label="1">
                秒，允许的通配符[, - * /]
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :label="2">
                周期从
                <el-input-number v-model='cycle01' :min="0" :max="58" /> -
                <el-input-number v-model='cycle02' :min="cycle01 + 1" :max="59" /> 秒
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :label="3">
                从
                <el-input-number v-model='average01' :min="0" :max="59" /> 秒开始，每
                <el-input-number v-model='average02' :min="1" :max="1000" /> 秒执行一次
            </el-radio>
        </el-form-item>

        <el-form-item>
            <el-radio v-model='radioValue' :label="4">
                指定
                <el-select clearable v-model="checkboxList" placeholder="可多选" multiple style="width:100%">
                    <el-option v-for="item in 60" :key="item" :value="item-1">{{item-1}}</el-option>
                </el-select>
            </el-radio>
        </el-form-item>
    </el-form>
</template>

<script setup>
const emit = defineEmits(['update'])

const props = defineProps({
    cron: {
        type: Object,
        default: {
            second: "*",
            min: "*",
            hour: "*",
            day: "*",
            month: "*",
            week: "?",
            year: "",
        }
    },
    check: {
        type: Function,
        default: () => {
        }
    }
})

const radioValue = ref(1)
const cycle01 = ref(0)
const cycle02 = ref(1)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref([])

const cycleTotal = computed(() => {
    cycle01.value = props.check(cycle01.value, 0, 58)
    cycle02.value = props.check(cycle02.value, cycle01.value + 1, 59)
    return cycle01.value + '-' + cycle02.value
})

const averageTotal = computed(() => {
    average01.value = props.check(average01.value, 0, 59)
    average02.value = props.check(average02.value, 1, 1000)
    return average01.value + '/' + average02.value
})

const checkboxString = computed(() => {
    if (radioValue.value === 4 && checkboxList.value.length === 0) {
        checkboxList.value.push(0)
    }
    return checkboxList.value.join(',')
})

watch(() => props.cron.second, value => changeRadioValue(value))

watch([radioValue, cycleTotal, averageTotal, checkboxString], () => onRadioChange())


function changeRadioValue(value) {
    if (value === '*') {
        radioValue.value = 1
    } else if (value.indexOf('-') > -1) {
        const indexArr = value.split('-')
        cycle01.value = Number(indexArr[0])
        cycle02.value = Number(indexArr[1])

        radioValue.value = 2
    } else if (value.indexOf('/') > -1) {
        const indexArr = value.split('/')
        average01.value = Number(indexArr[0])
        average02.value = Number(indexArr[1])

        radioValue.value = 3
    } else {
        checkboxList.value = [...new Set(value.split(',').map(item => Number(item)))]
        radioValue.value = 4
    }
}

// 单选按钮值变化时
function onRadioChange() {
    switch (radioValue.value) {
        case 1:
            emit('update', 'second', '*', 'second')
            break
        case 2:
            emit('update', 'second', cycleTotal.value, 'second')
            break
        case 3:
            emit('update', 'second', averageTotal.value, 'second')
            break
        case 4:
            if (checkboxList.value.length === 0) {
                checkboxList.value.push(0)
            }
            emit('update', 'second', checkboxString.value, 'second')
            break
    }
}

</script>
