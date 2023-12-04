<template>
    <div class="app-container">
        <!--应用数据-->
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="应用名称" prop="clientName">
                <el-input
                    v-model="queryParams.clientName"
                    placeholder="请输入应用名称"
                    clearable
                    style="width: 240px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="应用状态" clearable style="width: 240px">
                    <el-option
                        v-for="dict in sys_normal_disable"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                    />
                </el-select>
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
                <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:app:add']"
                    >新增</el-button
                >
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="success"
                    plain
                    icon="Edit"
                    :disabled="single"
                    @click="handleUpdate"
                    v-hasPermi="['system:app:edit']"
                    >修改</el-button
                >
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="clients" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="编号" align="left" prop="id" min-width="180" />
            <el-table-column
                label="应用名"
                align="center"
                key="clientName"
                prop="clientName"
                min-width="120"
                :show-overflow-tooltip="true"
            />
            <el-table-column
                label="授权范围"
                align="center"
                key="scopes"
                prop="scopes"
                min-width="180"
                :show-overflow-tooltip="true"
            />
            <el-table-column label="状态" align="center" min-width="100">
                <template #default="scope">
                    <el-switch
                        v-model="scope.row.status"
                        active-value="0"
                        inactive-value="1"
                        @change="handleStatusChange(scope.row)"
                    ></el-switch>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" min-width="160">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="创建人" align="center" key="createBy" prop="createBy" min-width="120" />
            <el-table-column label="更新时间" align="center" prop="updateTime" min-width="160">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.updateTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="更新人" align="center" key="updateBy" prop="updateBy" min-width="120" />
            <el-table-column
                label="备注"
                align="center"
                key="remark"
                prop="remark"
                min-width="160"
                :show-overflow-tooltip="true"
            />
            <el-table-column label="操作" align="center" min-width="260" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button
                        type="primary"
                        link
                        icon="View"
                        @click="handleView(scope.row)"
                        v-hasPermi="['system:app:view']"
                        >详情</el-button
                    >
                    <el-button
                        type="primary"
                        link
                        icon="Edit"
                        @click="handleUpdate(scope.row)"
                        v-hasPermi="['system:app:edit']"
                        >修改</el-button
                    >
                    <el-button
                        type="primary"
                        link
                        icon="Key"
                        @click="handleResetPwd(scope.row)"
                        v-hasPermi="['system:app:resetPwd']"
                        >重置密码</el-button
                    >
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

        <!-- 添加或修改应用配置对话框 -->
        <el-dialog :title="title" v-model="open" width="700px" destroy-on-close>
            <el-form :model="form" :rules="rules" ref="appRef" label-width="100px">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="应用名" prop="clientName">
                            <el-input v-model="form.clientName" placeholder="请输入应用名" maxlength="20" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="授权方式" prop="authorizationGrantTypes">
                            <el-checkbox-group v-model="form.authorizationGrantTypes" :min="1">
                                <el-checkbox label="authorization_code" disabled>授权码</el-checkbox>
                                <el-checkbox label="client_credentials">客户端凭证</el-checkbox>
                                <el-checkbox label="refresh_token">refresh_token</el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="授权范围" prop="scopes">
                            <el-checkbox-group v-model="form.scopes" :min="1">
                                <el-checkbox label="openid" disabled />
                                <el-checkbox label="profile" />
                            </el-checkbox-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="重定向地址" prop="redirectUris">
                            <el-input
                                v-model="form.redirectUris"
                                type="textarea"
                                @blur="
                                    form.redirectUris = form.redirectUris ? form.redirectUris.trim() : form.redirectUris
                                "
                                placeholder="请输入重定向地址"
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="状态" prop="status">
                            <el-switch v-model="form.status" active-value="0" inactive-value="1"></el-switch>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="备注" prop="remark">
                            <el-input
                                v-model="form.remark"
                                type="textarea"
                                @blur="form.remark = form.remark ? form.remark.trim() : form.remark"
                                placeholder="请输入内容"
                            />
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

        <!-- 查看应用详细 -->
        <el-dialog title="应用详情" v-model="openView" width="700px" destroy-on-close>
            <el-form :model="form" label-width="120px">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="编号：">{{ form.id }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="应用名：">{{ form.clientName }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="授权方式：">{{
                            parseGrantTypeLabel(form.authorizationGrantTypes)
                        }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="授权范围：">{{ form.scopes && form.scopes.join() }}</el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="重定向地址：">
                            <span style="white-space: pre-line">{{
                                form.redirectUris && form.redirectUris.replaceAll(',', '\n')
                            }}</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="状态：">{{
                            selectDictLabel(sys_normal_disable, form.status)
                        }}</el-form-item>
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
    </div>
</template>

<script setup name="App">
    import { changeAppStatus, listApps, resetAppPwd, getApp, updateApp, addApp } from '@/api/system/app'

    const router = useRouter()
    const { proxy } = getCurrentInstance()
    const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

    const clients = ref([])
    const open = ref(false)
    const openView = ref(false)
    const loading = ref(true)
    const showSearch = ref(true)
    const ids = ref([])
    const single = ref(true)
    const multiple = ref(true)
    const total = ref(0)
    const title = ref('')
    const dateRange = ref([])

    const data = reactive({
        form: {},
        queryParams: {
            pageNum: 1,
            pageSize: 10,
            clientName: undefined,
            status: undefined
        },
        rules: {
            clientName: [
                { required: true, message: '应用名称不能为空', trigger: 'blur' },
                { min: 6, max: 20, message: '应用名称长度必须介于 6 和 20 之间', trigger: 'blur' }
            ],
            redirectUris: [{ required: true, message: '重定向地址不能为空', trigger: 'blur' }]
        }
    })

    const { queryParams, form, rules } = toRefs(data)

    /** 查询应用列表 */
    function getList() {
        loading.value = true
        listApps(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
            loading.value = false
            clients.value = res.data.data
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
        proxy.resetForm('queryRef')
        handleQuery()
    }

    /** 应用状态修改  */
    function handleStatusChange(row) {
        const text = row.status === '1' ? '停用' : '恢复'
        proxy.$modal
            .confirm('确认要' + text + ' "' + row.clientName + '" 应用吗?')
            .then(function () {
                return changeAppStatus(row.id, row.status)
            })
            .then(() => {
                proxy.$modal.msgSuccess(text + '成功')
            })
            .catch(() => {
                row.status = row.status === '0' ? '1' : '0'
            })
    }

    /** 重置密码按钮操作 */
    function handleResetPwd(row) {
        proxy
            .$prompt('请输入"' + row.clientName + '"的新密码', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                closeOnClickModal: false,
                inputPattern: /^.{5,20}$/,
                inputErrorMessage: '应用密码长度必须介于 5 和 20 之间'
            })
            .then(({ value }) => {
                resetAppPwd(row.id, value).then(response => {
                    proxy.$modal.msgSuccess('修改成功，新密码是：' + value)
                })
            })
            .catch(() => {})
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
            clientName: undefined,
            authorizationGrantTypes: ['authorization_code'],
            redirectUris: undefined,
            scopes: ['openid'],
            status: '0',
            remark: undefined
        }
        proxy.resetForm('appRef')
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
        title.value = '添加应用'
    }

    /** 修改按钮操作 */
    function handleUpdate(row) {
        reset()
        const id = row.id || ids.value
        getApp(id).then(response => {
            const data = response.data
            data.authorizationGrantTypes = data.authorizationGrantTypes.split(',')
            data.scopes = data.scopes.split(',')
            form.value = data
            open.value = true
            title.value = '修改应用'
        })
    }

    /** 修改按钮操作 */
    function handleView(row) {
        reset()
        getApp(row.id).then(response => {
            const data = response.data
            data.authorizationGrantTypes = data.authorizationGrantTypes.split(',')
            data.scopes = data.scopes.split(',')
            form.value = data
            openView.value = true
        })
    }

    function closeView() {
        openView.value = false
        reset()
    }

    function parseGrantTypeLabel(grantTypes) {
        if (!grantTypes) {
            return ''
        }

        const labels = []
        grantTypes.forEach(val => {
            if (val === 'authorization_code') {
                labels.push('授权码')
            } else if (val === 'client_credentials') {
                labels.push('客户端凭证')
            } else if (val === 'refresh_token') {
                labels.push('refresh_token')
            } else if (val === 'password') {
                labels.push('密码')
            } else {
                labels.push(val)
            }
        })
        return labels.join()
    }

    /** 提交按钮 */
    function submitForm() {
        proxy.$refs['appRef'].validate(valid => {
            if (valid) {
                const data = {
                    id: form.value.id,
                    clientName: form.value.clientName,
                    authorizationGrantTypes: form.value.authorizationGrantTypes.join(),
                    redirectUris: form.value.redirectUris,
                    scopes: form.value.scopes.join(),
                    status: form.value.status,
                    remark: form.value.remark
                }
                if (data.id !== undefined) {
                    updateApp(data).then(response => {
                        proxy.$modal.msgSuccess('修改成功')
                        open.value = false
                        getList()
                    })
                } else {
                    addApp(data).then(response => {
                        proxy.$modal.msgSuccess('新增成功')
                        open.value = false
                        getList()
                    })
                }
            }
        })
    }

    getList()
</script>

<style lang="scss" scoped>
    .space-font {
        letter-spacing: 1px;
    }
</style>
