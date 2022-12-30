<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="主题" prop="name">
                <el-input
                    v-model="queryParams.name"
                    placeholder="请输入主题"
                    clearable
                    style="width: 240px;"
                    @keyup.enter="handleQuery"
                />
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
                    v-hasPermi="['system:passwd:add']"
                >新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="success"
                    plain
                    icon="Edit"
                    :disabled="single"
                    @click="handleUpdate"
                    v-hasPermi="['system:passwd:update']"
                >修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="danger"
                    plain
                    icon="Delete"
                    :disabled="multiple"
                    @click="handleDelete"
                    v-hasPermi="['system:passwd:remove']"
                >删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="success"
                    plain
                    icon="Key"
                    @click="openPasswd = true"
                    v-hasPermi="['system:passwd:generate']"
                >生成密码</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table ref="recordRef" v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column label="编号" align="center" prop="id" min-width="260"/>
            <el-table-column label="主题" align="center" prop="title" min-width="220" />
            <el-table-column label="密码" align="center" prop="passwd" min-width="220">
                <template #default="scope">
                    <span>{{ '**********' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark" min-width="180" />
            <el-table-column label="创建人" align="center" prop="createBy" min-width="120" />
            <el-table-column label="创建时间" align="center" prop="createTime" min-width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="更新人" align="center" prop="updateBy" min-width="120" />
            <el-table-column label="更新时间" align="center" prop="updateTime" min-width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.updateTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" min-width="300" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button
                        type="text"
                        icon="Edit"
                        @click="handleUpdate(scope.row)"
                        v-hasPermi="['system:passwd:update']"
                    >修改</el-button>
                    <el-button
                        type="text"
                        icon="View"
                        @click="handleView(scope.row, scope.index)"
                        v-hasPermi="['system:passwd:view']"
                    >查看密码</el-button>
                    <el-button
                        type="text"
                        icon="Delete"
                        @click="handleDelete(scope.row)"
                        v-hasPermi="['system:passwd:remove']"
                    >删除</el-button>
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

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" v-model="open" width="700px" destroy-on-close>
            <el-form :model="form" ref="formRef" label-width="100px">
                <el-row v-if="form.id">
                    <el-col :span="24">
                        <el-form-item label="编号" prop="id">
                            <span>{{ form.id }}</span>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="主题" prop="title">
                            <el-input v-model="form.title" placeholder="请输入主题" maxlength="20"/>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="密码" prop="passwd">
                            <el-input v-model="form.passwd" placeholder="请输入密码" maxlength="20"/>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="备注" prop="remark">
                            <el-input v-model="form.remark" type="textarea"
                                      @blur="form.remark = form.remark ? form.remark.trim() : form.remark"
                                      placeholder="请输入内容"/>
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

        <!-- 查看详细 -->
        <el-dialog title="查看密码" v-model="openView" width="700px" destroy-on-close>
            <el-form :model="form" label-width="120px">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="编号：">{{ form.id }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="主题：">{{ form.title }}</el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="密码：">{{ form.passwd }}</el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="">
                            <div class="input" style="width: 150px;margin-left: -120px">
                                <el-input type="password" v-if="!form.passwd" v-model="secret" placeholder="密码" />
                            </div>
                            <div style="margin-left: 20px">
                                <el-button type="primary" v-if="!form.passwd" @click="handleDecrypt" >显 示</el-button>
                            </div>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="备注：">{{ form.remark }}</el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="closeView">关 闭</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 生成密码 -->
        <el-dialog title="生成密码" v-model="openPasswd" width="700px" destroy-on-close>
            <el-form label-width="120px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="密码长度">
                            <el-input-number v-model="size" min="6" max="32" placeholder="请输入密码长度" controls="false"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item>
                            <el-button type="primary" @click="handleGenerate" :blur="size <= 6 ? size = 6 : size">确 定</el-button>
                        </el-form-item>
                    </el-col>

                    <el-col :span="24">
                        <el-form-item label="" style="height:320px; font-family: monospace;white-space: pre-line;background-color: bisque">
                            {{ pwds.join('\n') }}
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="closePasswd">关 闭</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup name="Passwd">
import { list, get, add, update, del, generate, passwd } from "@/api/system/passwd"
import { encrypt, decrypt } from "@/utils/encrypt"

const { proxy } = getCurrentInstance()

const recordList = ref([])
const open = ref(false)
const openEdit = ref(false)
const openView = ref(false)
const openPasswd = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const secret = ref("")
const size = ref(10)
const pwds = ref([])
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref("")
const total = ref(0)

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined
    }
})

const { queryParams, form } = toRefs(data)

/** 查询登录日志 */
function getList() {
    loading.value = true
    list(queryParams.value).then(response => {
        recordList.value = response.data.data
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
    proxy.resetForm("queryRef")
    handleQuery()
}

/** 详细按钮操作 */
function handleView(row) {
    openView.value = true
    form.value = {
        id: row.id,
        title: row.title,
        passwd: row.passwd,
        remark: row.remark
    }
}

function handleDecrypt() {
    const proc = encrypt(secret.value)
    secret.value = ''
    proc.then(enc => {
        passwd(form.value.id, enc).then(res => {
            decrypt(res.data.salt + res.data.passwd).then(dec => {
                form.value.passwd = dec
            })
        })
    })
}

function closeView() {
    openView.value = false
    secret.value = ''
    reset()
}

function handleGenerate() {
    generate(size.value).then(res => {
        console.log(res)
        pwds.value = res.data
    })
}

function closePasswd() {
    openPasswd.value = false
    size.value = 10
    pwds.value = []
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id)
    single.value = selection.length !== 1
    multiple.value = !selection.length
}

/** 重置操作表单 */
function reset() {
    form.value = {
        id: undefined,
        title: undefined,
        passwd: undefined,
        remark: undefined
    }
}

/** 新增按钮操作 */
function handleAdd() {
    reset()
    title.value = "添加密码"
    open.value = true
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    const passwdId = row.id || ids.value
    get(passwdId).then(response => {
        form.value = response.data
        title.value = "修改密码"
        open.value = true
    })
}

/** 取消按钮 */
function cancel() {
    open.value = false
    proxy.resetForm("formRef")
    reset()
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["formRef"].validate(valid => {
        if (valid) {
            const data = {
                id: form.value.id,
                title: form.value.title,
                passwd: form.value.passwd,
                remark: form.value.remark
            }
            form.value.passwd = ''

            encrypt(data.passwd).then(enc => {
                data.salt = enc ? enc.substring(0, 8) : ''
                data.passwd = enc ? enc.substring(8) : ''

                if (data.id !== undefined) {
                    update(data).then(response => {
                        proxy.$modal.msgSuccess("修改成功")
                        open.value = false
                        getList()
                    })
                } else {
                    add(data).then(response => {
                        proxy.$modal.msgSuccess("新增成功")
                        open.value = false
                        getList()
                    })
                }
            })
        }
    })
}

/** 删除按钮操作 */
function handleDelete(row) {
    const passwdIds = row.id ? [row.id] : ids.value
    proxy.$modal.confirm('是否确认删除选定的数据项？').then(function () {
        return del(passwdIds)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

getList()
</script>

