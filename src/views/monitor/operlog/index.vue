<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="操作描述" prop="title">
                <el-input
                    v-model="queryParams.title"
                    placeholder="请输入操作描述"
                    clearable
                    style="width: 240px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="操作人员" prop="username">
                <el-input
                    v-model="queryParams.username"
                    placeholder="请输入操作人员"
                    clearable
                    style="width: 240px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="操作状态" clearable style="width: 240px">
                    <el-option
                        v-for="dict in sys_common_status"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="操作时间" style="width: 308px">
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

        <el-table ref="operlogRef" v-loading="loading" :data="operlogList">
            <el-table-column label="日志编号" align="center" prop="id" width="100" />
            <el-table-column label="操作描述" align="left" prop="title" min-width="160" :show-overflow-tooltip="true" />
            <el-table-column label="操作类型" align="center" prop="operationType" min-width="120" />
            <el-table-column label="请求方式" align="center" prop="requestMethod" min-width="100" />
            <el-table-column
                label="请求地址"
                align="left"
                prop="requestUrl"
                min-width="210"
                :show-overflow-tooltip="true"
            />
            <el-table-column label="请求耗时" align="center" prop="cost" min-width="100">
                <template #default="scope">
                    <span>{{ scope.row.cost + ' ms' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作人员" align="center" prop="username" min-width="120" />
            <el-table-column
                label="操作地址"
                align="center"
                prop="requestIp"
                min-width="120"
                :show-overflow-tooltip="true"
            />
            <el-table-column
                label="操作地点"
                align="center"
                prop="requestLocation"
                min-width="180"
                :show-overflow-tooltip="true"
            />
            <el-table-column label="操作状态" align="center" prop="status" min-width="100">
                <template #default="scope">
                    <dict-tag :options="sys_common_status" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column label="操作日期" align="center" prop="operTime" min-width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" min-width="180" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button
                        type="primary"
                        link
                        icon="View"
                        @click="handleView(scope.row, scope.index)"
                        v-hasPermi="['log:operation:query']"
                        >详细
                    </el-button>
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

        <!-- 操作日志详细 -->
        <el-dialog title="操作日志详细" v-model="open" width="900px" append-to-body>
            <el-form :model="form" label-width="100px">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="操作描述：">
                            <span style="color: #409eff; padding-right: 9px">{{ form.operationType }}</span>
                            <span>{{ form.title }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="登录信息：">
                            <span style="padding-right: 9px; font-weight: bold">{{ form.username }}</span>
                            <span>{{ form.requestIp }}&nbsp;|&nbsp;{{ form.requestLocation }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="请求地址：">{{ form.requestMethod }} {{ form.requestUrl }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="操作耗时：">{{ form.cost + ' ms' }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="请求参数：" v-if="form.parameter">{{ form.parameter }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="返回参数：" v-if="form.status === '0'">
                            {{ form.result ? form.result : '略' }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="异常信息：" style="white-space: pre-line" v-if="form.status === '1'">
                            {{ (form.errorMsg || '').substring(0, 1000) }}
                            {{ (form.errorMsg || '').length > 1000 ? '\n... ...' : '' }}
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="操作状态：">
                            <div v-if="form.status === '0'">正常</div>
                            <div v-else-if="form.status === '1'">失败</div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="操作时间：">{{ parseTime(form.createTime) }}</el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="open = false">关 闭</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Operlog">
    import { list } from '@/api/monitor/operlog'

    const { proxy } = getCurrentInstance()
    const { sys_common_status } = proxy.useDict('sys_common_status')

    const operlogList = ref([])
    const open = ref(false)
    const loading = ref(true)
    const showSearch = ref(true)
    const total = ref(0)
    const title = ref('')
    const dateRange = ref([])

    const data = reactive({
        form: {},
        queryParams: {
            pageNum: 1,
            pageSize: 10,
            title: undefined,
            username: undefined,
            status: undefined
        }
    })

    const { queryParams, form } = toRefs(data)

    /** 查询登录日志 */
    function getList() {
        loading.value = true
        list(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
            operlogList.value = response.data.data
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
        handleQuery()
    }

    /** 详细按钮操作 */
    function handleView(row) {
        open.value = true
        form.value = row
    }

    getList()
</script>
