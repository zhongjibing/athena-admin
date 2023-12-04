<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="登录地址" prop="loginIp">
                <el-input
                    v-model="queryParams.loginIp"
                    placeholder="请输入登录地址"
                    clearable
                    style="width: 240px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="用户名称" prop="username">
                <el-input
                    v-model="queryParams.username"
                    placeholder="请输入用户名称"
                    clearable
                    style="width: 240px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="登录状态" clearable style="width: 240px">
                    <el-option
                        v-for="dict in sys_common_status"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="登录时间" style="width: 308px">
                <el-date-picker
                    v-model="dateRange"
                    value-format="YYYY-MM-DD"
                    type="daterange"
                    range-separator="-"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                ></el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table ref="logininforRef" v-loading="loading" :data="loginRecords">
            <el-table-column label="访问编号" align="center" prop="id" width="100" />
            <el-table-column
                label="用户名称"
                align="center"
                prop="username"
                min-width="120"
                :show-overflow-tooltip="true"
            />
            <el-table-column label="地址" align="center" prop="loginIp" min-width="120" :show-overflow-tooltip="true" />
            <el-table-column
                label="登录地点"
                align="center"
                prop="loginLocation"
                min-width="180"
                :show-overflow-tooltip="true"
            />
            <el-table-column label="操作系统" align="center" prop="os" min-width="120" :show-overflow-tooltip="true" />
            <el-table-column
                label="浏览器"
                align="center"
                prop="browser"
                min-width="120"
                :show-overflow-tooltip="true"
            />
            <el-table-column label="登录状态" align="center" prop="status" min-width="120">
                <template #default="scope">
                    <dict-tag :options="sys_common_status" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column label="描述" align="center" prop="msg" min-width="200" />
            <el-table-column label="访问时间" align="center" prop="loginTime" min-width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.loginTime) }}</span>
                </template>
            </el-table-column>
        </el-table>

        <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
        />
    </div>
</template>

<script setup name="Loginlog">
    import { list } from '@/api/monitor/loginlog'

    const { proxy } = getCurrentInstance()
    const { sys_common_status } = proxy.useDict('sys_common_status')

    const loginRecords = ref([])
    const loading = ref(true)
    const showSearch = ref(true)
    const total = ref(0)
    const dateRange = ref([])
    const defaultSort = ref({ prop: 'loginTime', order: 'descending' })

    // 查询参数
    const queryParams = ref({
        pageNum: 1,
        pageSize: 10,
        loginIp: undefined,
        username: undefined,
        status: undefined
    })

    /** 查询登录日志列表 */
    function getList() {
        loading.value = true
        list(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
            loginRecords.value = response.data.data
            total.value = response.data.total
            loading.value = false
        })
    }

    /** 搜索按钮操作 */
    function handleQuery() {
        queryParams.value.pageNum = 1
        getList()
    }

    /** 重置按钮操作 */
    function resetQuery() {
        dateRange.value = []
        proxy.resetForm('queryRef')
        proxy.$refs['logininforRef'].sort(defaultSort.value.prop, defaultSort.value.order)
        handleQuery()
    }

    getList()
</script>
