<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true" @submit.prevent>
            <el-form-item label="用户名称" prop="name">
                <el-input
                    v-model="queryParams.name"
                    placeholder="请输入用户名称"
                    clearable
                    style="width: 240px"
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
                    @click="openSelectUser"
                    v-hasPermi="['system:role:assign']"
                >添加用户</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="danger"
                    plain
                    icon="CircleClose"
                    :disabled="multiple"
                    @click="cancelAuthUserAll"
                    v-hasPermi="['system:role:assign']"
                >批量取消授权</el-button>
            </el-col>
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

        <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
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
            <el-table-column label="用户有效期" align="center" key="deadline" prop="deadline" min-width="160">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.deadline) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="密码已过期" align="center" key="archived" min-width="100">
                <template #default="scope">
                    <span>{{ scope.row.credentialsExpired ? '是' : '否' }}</span>
                </template>
            </el-table-column>
            <el-table-column label="备注" align="center" key="remark" prop="remark" min-width="160"
                             :show-overflow-tooltip="true"/>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
                <template #default="scope">
                    <el-button
                        type="primary"
                        link
                        icon="CircleClose"
                        @click="cancelAuthUser(scope.row)"
                        v-hasPermi="['system:role:assign']"
                    >取消授权</el-button>
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
        <select-user ref="selectRef" :roleId="roleId" @ok="handleQuery"/>
    </div>
</template>

<script setup name="AuthUser">
import selectUser from "./selectUser";
import { allocatedUserList, authUserCancel } from "@/api/system/role";

const route = useRoute();
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

const userList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const multiple = ref(true);
const total = ref(0);
const userIds = ref([]);

const roleId = route.params.roleId
const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    name: undefined
});

/** 查询授权用户列表 */
function getList() {
    loading.value = true;
    allocatedUserList(roleId, queryParams).then(response => {
        userList.value = response.data.data;
        total.value = response.data.total;
        loading.value = false;
    });
}

// 返回按钮
function handleClose() {
    const obj = {path: "/system/role"};
    proxy.$tab.closeOpenPage(obj);
}

/** 搜索按钮操作 */
function handleQuery() {
    queryParams.pageNum = 1;
    getList();
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
    userIds.value = selection.map(item => item.id);
    multiple.value = !selection.length;
}

/** 打开授权用户表弹窗 */
function openSelectUser() {
    proxy.$refs["selectRef"].show();
}

/** 取消授权按钮操作 */
function cancelAuthUser(row) {
    proxy.$modal.confirm('确认要取消该用户"' + row.username + '"角色吗？').then(function () {
        return authUserCancel(roleId, [row.id]);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("取消授权成功");
    }).catch(() => {
    });
}

/** 批量取消授权按钮操作 */
function cancelAuthUserAll() {
    proxy.$modal.confirm("是否取消选中用户授权数据项?").then(function () {
        return authUserCancel(roleId, userIds.value);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("取消授权成功");
    }).catch(() => {
    });
}

getList();
</script>
