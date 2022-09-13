<template>
   <div class="app-container">
         <!--用户数据-->
       <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
           <el-form-item label="用户名称" prop="name">
               <el-input
                   v-model="queryParams.name"
                   placeholder="请输入用户名称"
                   clearable
                   style="width: 240px"
                   @keyup.enter="handleQuery"
               />
           </el-form-item>
           <el-form-item label="手机号码" prop="mobile">
               <el-input
                   v-model="queryParams.mobile"
                   placeholder="请输入手机号码"
                   clearable
                   style="width: 240px"
                   @keyup.enter="handleQuery"
               />
           </el-form-item>
           <el-form-item label="创建时间" style="width: 308px">
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
                   type="primary"
                   plain
                   icon="Plus"
                   @click="handleAdd"
                   v-hasPermi="['system:user:add']"
               >新增</el-button>
           </el-col>
           <el-col :span="1.5">
               <el-button
                   type="success"
                   plain
                   icon="Edit"
                   :disabled="single"
                   @click="handleUpdate"
                   v-hasPermi="['system:user:edit']"
               >修改</el-button>
           </el-col>
           <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
       </el-row>

       <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
           <el-table-column type="selection" width="55" align="center"/>
           <el-table-column label="用户编号" align="center" key="id" prop="id" width="80" v-if="columns[0].visible"/>
           <el-table-column label="用户名称" align="center" key="username" prop="username" width="120" v-if="columns[1].visible" :show-overflow-tooltip="true"/>
           <el-table-column label="用户昵称" align="center" key="nickname" prop="nickname" width="120" v-if="columns[2].visible" :show-overflow-tooltip="true"/>
           <el-table-column label="邮箱" align="center" key="email" prop="email" min-width="120" v-if="columns[2].visible" :show-overflow-tooltip="true"/>
           <el-table-column label="手机号码" align="center" key="mobile" prop="mobile" width="120" v-if="columns[4].visible">
               <template #default="scope">
                   <span>{{ formatMobile(scope.row) }}</span>
               </template>
           </el-table-column>
           <el-table-column label="性别" align="center" key="gender" prop="gender" width="100" v-if="columns[2].visible">
               <template #default="scope">
                   <span>{{ scope.row.gender === '0' ? '女' : '男' }}</span>
               </template>
           </el-table-column>
           <el-table-column label="生日" align="center" key="birthdate" prop="birthdate" width="120" v-if="columns[2].visible" :show-overflow-tooltip="true"/>
           <el-table-column label="用户冻结" align="center" key="accountLocked" prop="accountLocked" width="100" v-if="columns[5].visible">
               <template #default="scope">
                   <el-switch
                       v-model="scope.row.accountLocked"
                       active-value="1"
                       inactive-value="0"
                       @change="handleStatusChange(scope.row)"
                   ></el-switch>
               </template>
           </el-table-column>
           <el-table-column label="创建时间" align="center" prop="createTime" width="160" v-if="columns[6].visible">
               <template #default="scope">
                   <span>{{ parseTime(scope.row.createTime) }}</span>
               </template>
           </el-table-column>
           <el-table-column label="用户有效时间" align="center" key="deadline" prop="deadline" width="160" v-if="columns[4].visible">
               <template #default="scope">
                   <span>{{ parseTime(scope.row.deadline) }}</span>
               </template>
           </el-table-column>
           <el-table-column label="密码已过期" align="center" key="archived" width="100" v-if="columns[5].visible">
               <template #default="scope">
                   <span>{{ scope.row.credentialsExpired ? '是' : '否' }}</span>
               </template>
           </el-table-column>
           <el-table-column label="最近登录时间" align="center" prop="lastLoginTime" width="160" v-if="columns[6].visible">
               <template #default="scope">
                   <span>{{ parseTime(scope.row.lastLoginTime) }}</span>
               </template>
           </el-table-column>
           <el-table-column label="备注" align="center" key="remark" prop="remark" min-width="180" v-if="columns[4].visible" :show-overflow-tooltip="true"/>
           <el-table-column label="操作" align="center" min-width="280" class-name="small-padding fixed-width">
               <template #default="scope">
                   <el-button
                       type="primary"
                       icon="Edit"
                       @click="handleUpdate(scope.row)"
                       v-hasPermi="['system:user:edit']"
                       text
                   >修改</el-button>
                   <el-button
                       type="primary"
                       icon="Key"
                       @click="handleResetPwd(scope.row)"
                       v-hasPermi="['system:user:resetPwd']"
                       text
                   >重置密码</el-button>
                   <el-button
                       type="primary"
                       icon="CircleCheck"
                       @click="handleAuthRole(scope.row)"
                       v-hasPermi="['system:user:edit']"
                       text
                   >分配角色</el-button>
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

      <!-- 添加或修改用户配置对话框 -->
       <el-dialog :title="title" v-model="open" width="600px" append-to-body>
           <el-form :model="form" :rules="rules" ref="userRef" label-width="80px">
               <el-row>
                   <el-col :span="12">
                       <el-form-item label="用户名" prop="username">
                           <el-input v-model="form.username" placeholder="请输入用户名" maxlength="30"/>
                       </el-form-item>
                   </el-col>
                   <el-col :span="12">
                       <el-form-item label="用户昵称" prop="nickname">
                           <el-input v-model="form.nickname" placeholder="请输入用户昵称" maxlength="30"/>
                       </el-form-item>
                   </el-col>
               </el-row>
               <el-row>
                   <el-col :span="12">
                       <el-form-item label="手机号码" prop="mobile">
                           <el-input v-model="form.mobile" placeholder="请输入手机号码" maxlength="11"/>
                       </el-form-item>
                   </el-col>
                   <el-col :span="12">
                       <el-form-item label="邮箱" prop="email">
                           <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50"/>
                       </el-form-item>
                   </el-col>
               </el-row>
               <el-row>
                   <el-col :span="12">
                       <el-form-item label="用户性别" prop="gender">
                           <el-select v-model="form.gender" placeholder="请选择">
                               <el-option
                                   v-for="dict in sys_user_sex"
                                   :key="dict.value"
                                   :label="dict.label"
                                   :value="dict.value"
                               ></el-option>
                           </el-select>
                       </el-form-item>
                   </el-col>
                   <el-col :span="12">
                       <el-form-item label="出生日期" prop="birthdate">
                           <el-date-picker
                               v-model="form.birthdate"
                               type="date"
                               placeholder="请选择"
                               value-format="YYYY-MM-DD"
                           />
                       </el-form-item>
                   </el-col>
               </el-row>
               <el-row>
                   <el-col :span="24">
                       <el-form-item label="备注" prop="remark">
                           <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
   </div>
</template>

<script setup name="User">
import { changeUserStatus, listUser, resetUserPwd, getUser, updateUser, addUser } from "@/api/system/user"

const router = useRouter()
const { proxy } = getCurrentInstance()
const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex")

const userList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])

// 列显隐信息
const columns = ref([
    {key: 0, label: `用户编号`, visible: true},
    {key: 1, label: `用户名称`, visible: true},
    {key: 2, label: `用户昵称`, visible: true},
    {key: 3, label: `部门`, visible: true},
    {key: 4, label: `手机号码`, visible: true},
    {key: 5, label: `状态`, visible: true},
    {key: 6, label: `创建时间`, visible: true}
])

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        mobile: undefined
    },
    rules: {
        username: [
            {required: true, message: "用户名称不能为空", trigger: "blur"},
            {min: 2, max: 20, message: "用户名称长度必须介于 2 和 20 之间", trigger: "blur"}
        ],
        nickname: [
            {required: true, message: "用户昵称不能为空", trigger: "blur"},
            {min: 2, max: 20, message: "用户名称长度必须介于 2 和 20 之间", trigger: "blur"}
        ],
        email: [
            {type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"]}
        ],
        mobile: [
            {pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "请输入正确的手机号码", trigger: "blur"}
        ]
    }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询用户列表 */
function getList() {
    loading.value = true
    listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
        loading.value = false
        userList.value = res.data.data
        total.value = res.data.total
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
  proxy.resetForm("queryRef")
  handleQuery()
}


/** 用户状态修改  */
function handleStatusChange(row) {
    const text = row.accountLocked === '1' ? "冻结" : "解冻"
    proxy.$modal.confirm('确认要' + text + ' "' + row.username + '" 用户吗?').then(function () {
        return changeUserStatus(row.id, row.accountLocked)
    }).then(() => {
        proxy.$modal.msgSuccess(text + "成功")
    }).catch(() => {
        row.accountLocked = row.accountLocked === '0' ? '1' : '0'
    })
}

/** 跳转角色分配 */
function handleAuthRole(row) {
    const userId = row.id
    router.push("/system/user-auth/role/" + userId)
}

/** 重置密码按钮操作 */
function handleResetPwd(row) {
    proxy.$prompt('请输入"' + row.username + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnClickModal: false,
        inputPattern: /^.{5,20}$/,
        inputErrorMessage: "用户密码长度必须介于 5 和 20 之间",
    }).then(({value}) => {
        resetUserPwd(row.id, value).then(response => {
            proxy.$modal.msgSuccess("修改成功，新密码是：" + value)
        })
    }).catch(() => {
    })
}

/** 选择条数  */
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id)
    single.value = selection.length !== 1
    multiple.value = !selection.length
}

/** 重置操作表单 */
function reset() {
    form.value = {
        id: undefined,
        username: undefined,
        nickname: undefined,
        password: undefined,
        mobile: undefined,
        email: undefined,
        gender: '0',
        birthdate: undefined,
        remark: undefined
    }
    proxy.resetForm("userRef")
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    open.value = true
    title.value = "添加用户"
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const userId = row.id || ids.value
    getUser(userId).then(response => {
        form.value = response.data
        open.value = true
        title.value = "修改用户"
    })
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["userRef"].validate(valid => {
        if (valid) {
            if (form.value.id !== undefined) {
                updateUser(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                addUser(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功")
                    open.value = false
                    getList()
                })
            }
        }
    })
}

function formatMobile(row) {
    if (row.mobile === null || row.mobile === "" || row.mobile === undefined) {
        return ""
    }

    if (row.mobile.length < 5) {
        return "*******" + row.mobile.substring(row.mobile.length - 1)
    }
    if (row.mobile.length < 8) {
        return row.mobile.substring(0, 1) + "****" + row.mobile.substring(row.mobile.length - 3)
    }
    return row.mobile.substring(0, 3) + "****" + row.mobile.substring(row.mobile.length - 4)
}

getList()
</script>
