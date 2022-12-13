<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
            <el-form-item label="登录地址" prop="loginIp">
                <el-input
                    v-model="queryParams.loginIp"
                    placeholder="请输入登录地址"
                    clearable
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="用户名称" prop="username">
                <el-input
                    v-model="queryParams.username"
                    placeholder="请输入用户名称"
                    clearable
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>
        <el-table
            v-loading="loading"
            :data="onlineList.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
            style="width: 100%;"
        >
            <el-table-column label="序号" width="50" type="index" align="center">
                <template #default="scope">
                    <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column label="会话编号" align="center" prop="sessionId" min-width="180" :show-overflow-tooltip="true"/>
            <el-table-column label="登录名称" align="center" prop="username" min-width="100" :show-overflow-tooltip="true"/>
            <el-table-column label="用户昵称" align="center" prop="nickname" min-width="100" :show-overflow-tooltip="true"/>
            <el-table-column label="主机" align="center" prop="loginIp" min-width="120" :show-overflow-tooltip="true"/>
            <el-table-column label="登录地点" align="center" prop="loginLocation" min-width="120" :show-overflow-tooltip="true"/>
            <el-table-column label="操作系统" align="center" prop="os" min-width="120" :show-overflow-tooltip="true"/>
            <el-table-column label="浏览器" align="center" prop="browser" min-width="120" :show-overflow-tooltip="true"/>
            <el-table-column label="登录时间" align="center" prop="loginTime" min-width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.loginTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="最新访问时间" align="center" prop="lastAccessedTime" min-width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.lastAccessedTime) }}</span>
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

<script setup name="Online">
import { forceLogout, list as initData } from "@/api/monitor/online"

const { proxy } = getCurrentInstance()

const onlineList = ref([])
const loading = ref(true)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const queryParams = ref({
    pageNum: 1,
    pageSize: 10,
    loginIp: undefined,
    username: undefined
})

/** 查询登录日志列表 */
function getList() {
    loading.value = true
    initData(queryParams.value).then(response => {
        onlineList.value = response.data.data
        total.value = response.data.total
        loading.value = false
    })
}

/** 搜索按钮操作 */
function handleQuery() {
    pageNum.value = 1
    getList()
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef")
    handleQuery()
}

getList()
</script>
