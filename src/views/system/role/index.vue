<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" v-show="showSearch" :inline="true">
            <el-form-item label="角色名称" prop="name">
                <el-input
                    v-model="queryParams.name"
                    placeholder="请输入角色名称"
                    clearable
                    style="width: 240px"
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select
                    v-model="queryParams.status"
                    placeholder="角色状态"
                    clearable
                    style="width: 240px"
                >
                    <el-option
                        v-for="dict in sys_normal_disable"
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
                    v-hasPermi="['system:role:add']"
                >新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="success"
                    plain
                    icon="Edit"
                    :disabled="single"
                    @click="handleUpdate"
                    v-hasPermi="['system:role:edit']"
                >修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="danger"
                    plain
                    icon="Delete"
                    :disabled="multiple"
                    @click="handleDelete"
                    v-hasPermi="['system:role:delete']"
                >删除</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 表格数据 -->
        <el-table v-loading="loading" :data="roleList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" :selectable="checkRole"/>
            <el-table-column label="角色编号" prop="id" min-width="80"/>
            <el-table-column label="角色名称" prop="name" :show-overflow-tooltip="true" min-width="120"/>
            <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" min-width="180"/>
            <el-table-column label="显示顺序" prop="roleSort" min-width="80"/>
            <el-table-column label="状态" align="center" min-width="100" v-hasPermi="['system:role:status']">
                <template #default="scope">
                    <el-switch
                        v-model="scope.row.status"
                        active-value="0"
                        inactive-value="1"
                        @change="handleStatusChange(scope.row)"
                        v-hasPermi="['system:role:status']"
                    ></el-switch>
                </template>
            </el-table-column>
            <el-table-column label="创建时间" align="center" prop="createTime" min-width="220">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="left" class-name="small-padding fixed-width" min-width="480">
                <template #default="scope">
                    <el-button
                        type="primary"
                        link
                        icon="Edit"
                        @click="handleUpdate(scope.row)"
                        v-hasPermi="['system:role:edit']"
                    >修改</el-button>
                    <el-button
                        type="primary"
                        link
                        icon="Delete"
                        @click="handleDelete(scope.row)"
                        v-hasPermi="['system:role:delete']"
                    >删除</el-button>
                    <el-button
                        type="primary"
                        link
                        icon="User"
                        @click="handleAuthUser(scope.row)"
                        v-hasPermi="['system:role:assign']"
                    >分配用户</el-button>
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

        <!-- 添加或修改角色配置对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入角色名称"/>
                </el-form-item>
                <el-form-item prop="roleKey">
                    <template #label>
                  <span>
                     <el-tooltip content="控制器中定义的权限字符，如：'admin'"
                                 placement="top">
                        <el-icon><question-filled/></el-icon>
                     </el-tooltip>
                     权限字符
                  </span>
                    </template>
                    <el-input v-model="form.roleKey" placeholder="请输入权限字符"/>
                </el-form-item>
                <el-form-item label="角色顺序" prop="roleSort">
                    <el-input-number v-model="form.roleSort" controls-position="right" :min="0"/>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="form.status">
                        <el-radio
                            v-for="dict in sys_normal_disable"
                            :key="dict.value"
                            :label="dict.value"
                        >{{ dict.label }}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="菜单权限">
                    <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠
                    </el-checkbox>
                    <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选
                    </el-checkbox>
                    <el-tree
                        class="tree-border"
                        :data="menuOptions"
                        show-checkbox
                        ref="menuRef"
                        node-key="id"
                        empty-text="加载中，请稍候"
                        @check-change="handMenuTreeCheckChange"
                        :check-strictly="true"
                        :props="{ label: 'label', children: 'children' }"
                    ></el-tree>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
                </el-form-item>
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

<script setup name="Role">
import RightToolbar from '@/components/RightToolbar'
import { addRole, changeRoleStatus, dataScope, delRole, getRole, listRole, updateRole, deptTreeSelect } from "@/api/system/role";
import { roleMenuTreeselect, treeselect as menuTreeselect } from "@/api/system/menu";
import { reactive, toRefs } from 'vue';
import useUserStore from '@/store/modules/user'

const router = useRouter()
const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict("sys_normal_disable")
const roleList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref("")
const dateRange = ref([])
const menuOptions = ref([])
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const menuRef = ref(null)


const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        status: undefined
    },
    rules: {
        name: [{required: true, message: "角色名称不能为空", trigger: "blur"}],
        roleKey: [{required: true, message: "权限字符不能为空", trigger: "blur"}],
        roleSort: [{required: true, message: "角色顺序不能为空", trigger: "blur"}]
    },
})

const { queryParams, form, rules } = toRefs(data)

/** 查询角色列表 */
function getList() {
    loading.value = true
    listRole(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
        roleList.value = response.data['data']
        total.value = response.data['total']
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
    proxy.resetForm("queryRef")
    handleQuery()
}

/** 删除按钮操作 */
function handleDelete(row) {
    const roleIds = row.id ? [row.id] : ids.value
    proxy.$modal.confirm('是否确认删除角色编号为"' + roleIds + '"的数据项?').then(function () {
        return delRole(roleIds)
    }).then(() => {
        getList()
        proxy.$modal.msgSuccess("删除成功")
    }).catch(() => {
    })
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id)
    single.value = selection.length !== 1
    multiple.value = !selection.length
}

/** 角色状态修改 */
function handleStatusChange(row) {
    let text = row.status === "0" ? "启用" : "停用"
    proxy.$modal.confirm('确认要"' + text + '""' + row.name + '"角色吗?').then(function () {
        return changeRoleStatus(row.id, row.status)
    }).then(() => {
        proxy.$modal.msgSuccess(text + "成功")
    }).catch(function () {
        row.status = row.status === "0" ? "1" : "0"
    })
}

/** 分配用户 */
function handleAuthUser(row) {
    router.push('/system/auth/role/' + row.id)
}

/** 查询菜单树结构 */
function getMenuTreeselect() {
    menuTreeselect().then(response => {
        menuOptions.value = response.data
    })
}

/** 重置新增的表单以及其他数据  */
function reset() {
    if (menuRef.value !== null && menuRef.value !== undefined) {
        menuRef.value.setCheckedKeys([])
    }
    menuExpand.value = false
    menuNodeAll.value = false
    form.value = {
        id: undefined,
        name: undefined,
        roleKey: undefined,
        roleSort: 1,
        status: "0",
        menuIds: [],
        deptIds: [],
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        remark: undefined
    }
    proxy.resetForm("roleRef")
}

/** 添加角色 */
function handleAdd() {
    reset()
    getMenuTreeselect()
    if (roleList.value != null && roleList.value.length > 0) {
        form.value.roleSort = roleList.value[roleList.value.length - 1]['roleSort'] + 1
    }
    open.value = true
    title.value = "添加角色"
}

/** 修改角色 */
function handleUpdate(row) {
    reset()
    const roleId = row.id || ids.value
    const roleMenu = getRoleMenuTreeselect(roleId)
    getRole(roleId).then(response => {
        form.value = response.data
        form.value.roleSort = Number(form.value.roleSort)
        open.value = true
        nextTick(() => {
            roleMenu.then((res) => {
                let checkedKeys = res.checkedKeys
                checkedKeys.forEach((v) => {
                    nextTick(() => {
                        menuRef.value.setChecked(v, true, false)
                    })
                })
            })
        })
        title.value = "修改角色"
    })
}

/** 根据角色ID查询菜单树结构 */
function getRoleMenuTreeselect(roleId) {
    return roleMenuTreeselect(roleId).then(response => {
        menuOptions.value = response.data.menus
        return response.data
    })
}

/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand(value, type) {
    if (type === "menu") {
        let treeList = menuOptions.value
        treeExpand(menuRef, treeList, value)
    }
}

function treeExpand(treeRef, nodes, value) {
    for (let i = 0; i < nodes.length; i++) {
        treeRef.value.store.nodesMap[nodes[i].id].expanded = value
        if (nodes[i].children && nodes[i].children.length) {
            treeExpand(treeRef, nodes[i].children, value)
        }
    }
}

function handMenuTreeCheckChange(data, check) {
    if (check) {
        checkNode(menuRef, data.id)
    } else {
        uncheckNode(menuRef, data.id)
    }
}

function checkNode(treeRef, key) {
    const node = treeRef.value.getNode(key)
    if (!node.checked) {
        treeRef.value.setChecked(node.data.id, true, false)
    }
    if (node.parent && node.parent.level > 0) {
        checkNode(treeRef, node.parent.data.id)
    }
}

function uncheckNode(treeRef, key) {
    const node = treeRef.value.getNode(key)
    if (node.checked) {
        treeRef.value.setChecked(node.data.id, false, false)
    }
    if (node.data.children && node.data.children.length > 0) {
        for (let i = 0; i < node.data.children.length; i++) {
            uncheckNode(treeRef, node.data.children[i].id)
        }
    }
}

/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value, type) {
    if (type === "menu") {
        treeSelectAll(menuRef, menuOptions.value, value)
    }
}

function treeSelectAll(treeRef, dataArr, check) {
    if (check) {
        for (let i = 0; i < dataArr.length; i++) {
            const node = treeRef.value.getNode(dataArr[i].id)
            if (!node.checked) {
                treeRef.value.setChecked(dataArr[i].id, true, false)
            }
            if (dataArr[i].children && dataArr[i].children.length > 0) {
                treeSelectAll(treeRef, dataArr[i].children, true)
            }
        }
    } else {
        for (let i = 0; i < dataArr.length; i++) {
            const node = treeRef.value.getNode(dataArr[i].id)
            if (node.checked) {
                treeRef.value.setChecked(dataArr[i].id, false, false)
            }
            if (dataArr[i].children && dataArr[i].children.length > 0) {
                treeSelectAll(treeRef, dataArr[i].children, false)
            }
        }
    }
}


/** 所有菜单节点数据 */
function getMenuAllCheckedKeys() {
    // 目前被选中的菜单节点
    let checkedKeys = menuRef.value.getCheckedKeys()
    // 半选中的菜单节点
    let halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
    checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
    return checkedKeys
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["roleRef"].validate(valid => {
        if (valid) {
            if (form.value.id !== null && form.value.id !== undefined) {
                form.value.menuIds = getMenuAllCheckedKeys()
                updateRole(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功")
                    open.value = false
                    getList()
                })
            } else {
                form.value.menuIds = getMenuAllCheckedKeys()
                addRole(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功")
                    open.value = false
                    getList()
                })
            }
        }
    })
}

/** 取消按钮 */
function cancel() {
    open.value = false
    reset()
}

function checkRole(row) {
    return true
}

getList()
</script>
