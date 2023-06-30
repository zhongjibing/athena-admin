<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
         <el-form-item label="任务名称" prop="taskName">
            <el-input
               v-model="queryParams.taskName"
               placeholder="请输入任务名称"
               clearable
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="任务组名" prop="taskGroup">
            <el-select v-model="queryParams.taskGroup" placeholder="请选择任务组名" clearable>
               <el-option
                  v-for="dict in sys_task_group"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="任务状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择任务状态" clearable>
               <el-option
                  v-for="dict in sys_task_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['monitor:task:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['monitor:task:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['monitor:task:delete']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="info"
               plain
               icon="Operation"
               @click="handleJobLog"
               v-hasPermi="['monitor:task:logs']"
            >日志</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="任务编号" width="100" align="center" prop="id" />
         <el-table-column label="任务名称" align="left" prop="taskName" min-width="180" :show-overflow-tooltip="true" />
         <el-table-column label="任务组名" align="center" prop="taskGroup" width="160">
            <template #default="scope">
               <dict-tag :options="sys_task_group" :value="scope.row.taskGroup" />
            </template>
         </el-table-column>
         <el-table-column label="调用目标字符串" align="left" prop="invokeTarget" min-width="220" :show-overflow-tooltip="true" />
         <el-table-column label="cron执行表达式" align="center" prop="cronExpression" min-width="180" :show-overflow-tooltip="true" />
         <el-table-column label="状态" align="center" min-width="120" v-hasPermi="['monitor:task:status']">
            <template #default="scope">
               <el-switch
                  v-model="scope.row.status"
                  active-value="0"
                  inactive-value="1"
                  @change="handleStatusChange(scope.row)"
                  v-hasPermi="['monitor:task:status']"
               ></el-switch>
            </template>
         </el-table-column>
         <el-table-column label="操作" align="center" width="360" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-tooltip content="修改" placement="top" effect="light" :visible="toolTips.edit[scope.row.id]">
                  <el-button
                     type="primary"
                     link
                     icon="Edit"
                     @click="handleUpdate(scope.row)"
                     @mouseenter="toolTips.edit[scope.row.id] = true"
                     @mouseleave="toolTips.edit[scope.row.id] = false"
                     v-hasPermi="['monitor:task:edit']"
                  ></el-button>
               </el-tooltip>
               <el-tooltip content="删除" placement="top" effect="light" :visible="toolTips.remove[scope.row.id]">
                  <el-button
                     type="primary"
                     link
                     icon="Delete"
                     @click="handleDelete(scope.row)"
                     @mouseenter="toolTips.remove[scope.row.id] = true"
                     @mouseleave="toolTips.remove[scope.row.id] = false"
                     v-hasPermi="['monitor:task:delete']"
                  ></el-button>
               </el-tooltip>
               <el-tooltip content="执行一次" placement="top" effect="light" :visible="toolTips.run[scope.row.id]">
                  <el-button
                     type="primary"
                     link
                     icon="CaretRight"
                     @click="handleRun(scope.row)"
                     @mouseenter="toolTips.run[scope.row.id] = true"
                     @mouseleave="toolTips.run[scope.row.id] = false"
                     v-hasPermi="['monitor:task:run']"
                  ></el-button>
               </el-tooltip>
               <el-tooltip content="任务详细" placement="top" effect="light" :visible="toolTips.view[scope.row.id]">
                  <el-button
                     type="primary"
                     link
                     icon="View"
                     @click="handleView(scope.row)"
                     @mouseenter="toolTips.view[scope.row.id] = true"
                     @mouseleave="toolTips.view[scope.row.id] = false"
                     v-hasPermi="['monitor:task:query']"
                  ></el-button>
               </el-tooltip>
               <el-tooltip content="调度日志" placement="top" effect="light" :visible="toolTips.log[scope.row.id]">
                  <el-button
                     type="primary"
                     link
                     icon="Operation"
                     @click="handleJobLog(scope.row)"
                     @mouseenter="toolTips.log[scope.row.id] = true"
                     @mouseleave="toolTips.log[scope.row.id] = false"
                     v-hasPermi="['monitor:task:logs']"
                  ></el-button>
               </el-tooltip>
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

      <!-- 添加或修改定时任务对话框 -->
      <el-dialog :title="title" v-model="open" width="800px" append-to-body>
         <el-form ref="taskRef" :model="form" :rules="rules" label-width="120px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="任务名称" prop="taskName">
                     <el-input v-model="form.taskName" placeholder="请输入任务名称" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="任务分组" prop="taskGroup">
                     <el-select v-model="form.taskGroup" placeholder="请选择">
                        <el-option
                           v-for="dict in sys_task_group"
                           :key="dict.value"
                           :label="dict.label"
                           :value="dict.value"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item prop="invokeTarget">
                     <template #label>
                        <span>
                           调用方法
                           <el-tooltip placement="top">
                              <template #content>
                                 <div>
                                    Bean调用示例：testTask.test('test')
                                    <br />Class类调用示例：com.icezhg.athena.task.TestTask.test('test')
                                    <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                                 </div>
                              </template>
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                        </span>
                     </template>
                     <el-input v-model="form.invokeTarget" placeholder="请输入调用目标字符串" />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="cron表达式" prop="cronExpression">
                     <el-input v-model="form.cronExpression" placeholder="请输入cron执行表达式" readonly>
                        <template #append>
                           <el-button type="primary" @click="handleShowCron">
                              生成表达式
                              <i class="el-icon-time el-icon--right"></i>
                           </el-button>
                        </template>
                     </el-input>
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="执行策略" prop="misfirePolicy">
                     <el-radio-group v-model="form.misfirePolicy">
                        <el-radio-button label="1">立即执行</el-radio-button>
                        <el-radio-button label="2">执行一次</el-radio-button>
                        <el-radio-button label="3">放弃执行</el-radio-button>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="是否并发" prop="concurrent">
                     <el-radio-group v-model="form.concurrent">
                        <el-radio-button label="0">允许</el-radio-button>
                        <el-radio-button label="1">禁止</el-radio-button>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="状态">
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_task_status"
                           :key="dict.value"
                           :label="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>

       <el-dialog title="Cron表达式生成器" v-model="openCron" append-to-body destroy-on-close>
           <crontab ref="crontabRef" @hide="openCron=false" @fill="crontabFill" :expression="expression"></crontab>
       </el-dialog>

      <!-- 任务日志详细 -->
      <el-dialog title="任务详细" v-model="openView" width="700px" append-to-body>
         <el-form :model="form" label-width="120px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="任务编号：">{{ form.id }}</el-form-item>
                  <el-form-item label="任务名称：">{{ form.taskName }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="任务分组：">{{ taskGroupFormat(form) }}</el-form-item>
                  <el-form-item label="创建时间：">{{ parseTime(form.createTime) }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="cron表达式：">{{ form.cronExpression }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="下次执行时间：">{{ parseTime(form.nextFireTime) }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="调用目标方法：">{{ form.invokeTarget }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="任务状态：">{{ selectDictLabel(sys_task_status, form.status) }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="是否并发：">
                     <div v-if="form.concurrent === '0'">允许</div>
                     <div v-else-if="form.concurrent === '1'">禁止</div>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="执行策略：">
                     <div v-if="form.misfirePolicy === ''">默认策略</div>
                     <div v-else-if="form.misfirePolicy === '1'">立即执行</div>
                     <div v-else-if="form.misfirePolicy === '2'">执行一次</div>
                     <div v-else-if="form.misfirePolicy === '3'">放弃执行</div>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button @click="openView = false">关 闭</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Task">
import { listTask, getTask, delTask, addTask, updateTask, runTask, changeTaskStatus } from "@/api/monitor/task"
import Crontab from '@/components/Crontab'

const router = useRouter()
const { proxy } = getCurrentInstance()
const { sys_task_group, sys_task_status } = proxy.useDict("sys_task_group", "sys_task_status")

const taskList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const openView = ref(false)
const openCron = ref(false)
const expression = ref("")
const toolTips = ref({
    edit: [],
    remove: [],
    run: [],
    view: [],
    log: []
})

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        taskName: undefined,
        taskGroup: undefined,
        status: undefined
    },
    rules: {
        taskName: [{required: true, message: "任务名称不能为空", trigger: "blur"}],
        invokeTarget: [{required: true, message: "调用目标字符串不能为空", trigger: "blur"}],
        cronExpression: [{required: true, message: "cron执行表达式不能为空", trigger: "change"}]
    }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询定时任务列表 */
function getList() {
    loading.value = true
    listTask(queryParams.value).then(response => {
        taskList.value = response.data.data
        total.value = response.data.total
        loading.value = false
    })
}

/** 任务组名字典翻译 */
function taskGroupFormat(row, column) {
    return proxy.selectDictLabel(sys_task_group.value, row.taskGroup)
}

/** 取消按钮 */
function cancel() {
    open.value = false
    reset()
}

/** 表单重置 */
function reset() {
    form.value = {
        id: undefined,
        taskName: undefined,
        taskGroup: undefined,
        invokeTarget: undefined,
        cronExpression: undefined,
        misfirePolicy: 1,
        concurrent: 1,
        status: "0"
    }
    proxy.resetForm("taskRef")
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.value.pageNum = 1
    getList()
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef")
    handleQuery()
}

// 多选框选中数据
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id)
    single.value = selection.length !== 1
    multiple.value = !selection.length
}

// 任务状态修改
function handleStatusChange(row) {
    let text = row.status === "0" ? "启用" : "停用"
    proxy.$modal.confirm('确认要"' + text + '""' + row.taskName + '"任务吗?').then(function () {
        return changeTaskStatus(row.id, row.status)
    }).then(() => {
        proxy.$modal.msgSuccess(text + "成功")
    }).catch(function () {
        row.status = row.status === "0" ? "1" : "0"
    })
}

/* 立即执行一次 */
function handleRun(row) {
    proxy.$modal.confirm('确认要立即执行一次"' + row.taskName + '"任务吗?').then(function () {
        return runTask(row.id)
    }).then(() => {
        proxy.$modal.msgSuccess("执行成功")
    }).catch(() => {
    })
}

/** 任务详细信息 */
function handleView(row) {
    getTask(row.id).then(response => {
        form.value = response.data
        openView.value = true
    })
}

/** cron表达式按钮操作 */
function handleShowCron() {
    expression.value = form.value.cronExpression
    openCron.value = true
}

/** 确定后回传值 */
function crontabFill(value) {
    form.value.cronExpression = value
}

/** 任务日志列表查询 */
function handleJobLog(row) {
    const taskId = row ? row.id : ''
    router.push({path: "/monitor/task-log/index", query: {taskId: taskId}})
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加任务"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const taskId = row.id || ids.value
    getTask(taskId).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改任务"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["taskRef"].validate(valid => {
        if (valid) {
            if (form.value.id !== undefined) {
                updateTask(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addTask(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功")
                    open.value = false
                    getList()
                })
            }
        }
    })
}

/** 删除按钮操作 */
function handleDelete(row) {
    const taskIds = row.id || ids.value
    proxy.$modal.confirm('是否确认删除定时任务编号为"' + taskIds + '"的数据项?').then(function () {
        return delTask(taskIds)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

getList()
</script>

<style lang="scss" scoped>
.el-button--text {
    padding-right: 1rem;
}

.el-input-group__append button.el-button {
    color: var(--el-radio-button-checked-text-color, var(--el-color-white));
    background-color: var(--el-radio-button-checked-bg-color, var(--el-color-primary));
}
</style>
