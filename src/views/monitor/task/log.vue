<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="任务名称" prop="taskName" v-if="!queryParams.taskId">
            <el-input
               v-model="queryParams.taskName"
               placeholder="请输入任务名称"
               clearable
               style="width: 240px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="任务组名" prop="taskGroup" v-if="!queryParams.taskId">
            <el-select
               v-model="queryParams.taskGroup"
               placeholder="请选择任务组名"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_task_group"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="执行状态" prop="status">
            <el-select
               v-model="queryParams.status"
               placeholder="请选择执行状态"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_common_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="执行时间" style="width: 308px">
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
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Close"
               @click="handleClose"
            >关闭</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>
      <el-table v-loading="loading" :data="jobLogList">
         <el-table-column label="日志编号" width="100" align="center" prop="id" />
         <el-table-column label="任务名称" align="center" prop="taskName" min-width="180" :show-overflow-tooltip="true" />
         <el-table-column label="任务组名" align="center" prop="taskGroup" min-width="160" :show-overflow-tooltip="true">
            <template #default="scope">
               <dict-tag :options="sys_task_group" :value="scope.row.taskGroup" />
            </template>
         </el-table-column>
         <el-table-column label="调用目标字符串" align="center" prop="invokeTarget" min-width="220" :show-overflow-tooltip="true" />
         <el-table-column label="日志信息" align="center" prop="message" min-width="360" :show-overflow-tooltip="true" />
         <el-table-column label="执行状态" align="center" prop="status" min-width="120" >
            <template #default="scope">
               <dict-tag :options="sys_common_status" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="执行时间" align="center" prop="createTime" min-width="160">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="120" >
            <template #default="scope">
               <el-button
                  type="text"
                  icon="View"
                  @click="handleView(scope.row)"
                  v-hasPermi="['monitor:job:query']"
               >详细</el-button>
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

      <!-- 调度日志详细 -->
      <el-dialog title="调度日志详细" v-model="open" width="700px" append-to-body>
         <el-form :model="form" label-width="100px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="日志序号：">{{ form.id }}</el-form-item>
                  <el-form-item label="任务名称：">{{ form.taskName }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="任务分组：">{{ selectDictLabel(sys_task_group, form.taskGroup) }}</el-form-item>
                  <el-form-item label="执行时间：">{{ parseTime(form.createTime) }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="调用方法：">{{ form.invokeTarget }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="日志信息：">{{ form.message }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="执行状态：">
                     <div v-if="form.status === '0'">正常</div>
                     <div v-else-if="form.status === '1'">失败</div>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="异常信息：" v-if="form.status === '1'" style="white-space: pre-line">{{ form.exceptionInfo }}</el-form-item>
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

<script setup name="JobLog">
import { listLogs } from "@/api/monitor/taskLog"

const { proxy } = getCurrentInstance()
const { sys_task_group, sys_common_status } = proxy.useDict("sys_task_group", "sys_common_status")

const jobLogList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const total = ref(0)
const dateRange = ref([])
const route = useRoute()

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        taskId: undefined,
        taskName: undefined,
        taskGroup: undefined,
        status: undefined
    }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询调度日志列表 */
function getList() {
    loading.value = true
    listLogs(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
        jobLogList.value = response.data.data
        total.value = response.data.total
        loading.value = false
    })
}

// 返回按钮
function handleClose() {
    const obj = {path: "/monitor/task"}
    proxy.$tab.closeOpenPage(obj)
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1
    getList()
}

/** 重置按钮操作 */
function resetQuery() {
    dateRange.value = []
    proxy.resetForm("queryRef")
    handleQuery()
}

/** 详细按钮操作 */
function handleView(row) {
    open.value = true
    form.value = row
}

(() => {
    const taskId = route.query.taskId;
    if (taskId !== undefined && taskId !== '') {
        queryParams.value.taskId = taskId
    }
})()

getList()
</script>
