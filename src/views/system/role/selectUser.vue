<template>
    <!-- 授权用户 -->
    <el-dialog title="选择用户" v-model="visible" width="900px" top="5vh" append-to-body>
        <el-form :model="queryParams" ref="queryRef" :inline="true" @submit.prevent>
            <el-form-item label="用户名称" prop="name">
                <el-input
                    v-model="queryParams.name"
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
        <el-row>
            <el-table @row-click="clickRow" ref="refTable" :data="userList" v-loading="loading" @selection-change="handleSelectionChange" height="260px">
                <el-table-column type="selection" width="55" align="center"/>
                <el-table-column label="用户编号" align="center" key="id" prop="id" width="80" fixed="left"/>
                <el-table-column label="用户名称" align="center" key="username" prop="username" min-width="100" fixed="left" :show-overflow-tooltip="true"/>
                <el-table-column label="用户昵称" align="center" key="nickname" prop="nickname" min-width="100" :show-overflow-tooltip="true"/>
                <el-table-column label="手机号码" align="center" key="mobile" prop="mobile" min-width="120"/>
                <el-table-column label="性别" align="center" key="gender" prop="gender" min-width="80">
                    <template #default="scope">
                        <span>{{ scope.row.gender === '0' ? '女' : '男' }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" align="center" prop="createTime" min-width="160">
                    <template #default="scope">
                        <span>{{ parseTime(scope.row.createTime) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="备注" align="center" key="remark" prop="remark" min-width="160" :show-overflow-tooltip="true"/>
            </el-table>
            <pagination
                v-show="total > 0"
                :total="total"
                v-model:page="queryParams.pageNum"
                v-model:limit="queryParams.pageSize"
                @pagination="getList"
            />
        </el-row>
        <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="handleSelectUser">确 定</el-button>
                <el-button @click="visible = false">取 消</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup name="SelectUser">
import { authUserSelect, unallocatedUserList } from "@/api/system/role"

const props = defineProps({
    roleId: {
        type: [Number, String]
    }
})

const {proxy} = getCurrentInstance()
const {sys_normal_disable} = proxy.useDict("sys_normal_disable")

const loading = ref(true)
const userList = ref([])
const visible = ref(false)
const total = ref(0)
const userIds = ref([])
const roleId = ref('')

const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    name: undefined
})

// 显示弹框
function show() {
    roleId.value = props.roleId
    getList()
    visible.value = true
}

/**选择行 */
function clickRow(row) {
    proxy.$refs["refTable"].toggleRowSelection(row)
}

// 多选框选中数据
function handleSelectionChange(selection) {
    userIds.value = selection.map(item => item.id)
    console.log(userIds.value)
}

// 查询表数据
function getList() {
    loading.value = true
    unallocatedUserList(roleId.value, queryParams).then(res => {
        userList.value = res.data.data;
        total.value = res.data.total;
        loading.value = false
    })
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.pageNum = 1
    getList()
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef")
    handleQuery()
}

const emit = defineEmits(["ok"])

/** 选择授权用户操作 */
function handleSelectUser() {
    const ids = userIds.value
    if (!ids || ids.length === 0) {
        proxy.$modal.msgWarning("请选择要分配的用户")
        return
    }

    authUserSelect(roleId.value, ids).then(() => {
        proxy.$modal.msgSuccess("分配用户角色成功")
        visible.value = false
        emit("ok")
    })
}

defineExpose({
    show,
})
</script>
