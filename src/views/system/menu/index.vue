<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
            <el-form-item label="菜单名称" prop="name">
                <el-input
                    v-model="queryParams.name"
                    placeholder="请输入菜单名称"
                    style="width: 240px"
                    clearable
                    @keyup.enter="handleQuery"
                />
            </el-form-item>
            <el-form-item label="菜单类型" prop="types">
                <el-select v-model="queryParams.types" placeholder="菜单类型" style="width: 240px" multiple clearable>
                    <el-option
                        v-for="type in Object.keys(menuType)"
                        :key="type"
                        :label="menuType[type]['name']"
                        :value="type"
                    />
                </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="菜单状态" style="width: 240px" clearable>
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
                    v-hasPermi="['system:menu:add']"
                >新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button
                    type="info"
                    plain
                    icon="Sort"
                    @click="toggleExpandAll"
                >展开/折叠</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table
            v-if="refreshTable"
            v-loading="loading"
            :data="menuList"
            row-key="id"
            :default-expand-all="isExpandAll"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        >
            <el-table-column prop="name" label="菜单名称" :show-overflow-tooltip="true" min-width="160" />
            <el-table-column prop="icon" label="图标" align="center" width="80">
                <template #default="scope">
                    <svg-icon :icon-class="scope.row.icon"/>
                </template>
            </el-table-column>
            <el-table-column prop="orderNum" label="排序" align="center" min-width="80" />
            <el-table-column prop="perms" label="权限标识" :show-overflow-tooltip="true" min-width="180" />
            <el-table-column prop="path" label="路由地址" :show-overflow-tooltip="true" min-width="180" />
            <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true" min-width="180" />
            <el-table-column prop="type" label="类型" align="center" min-width="80">
                <template #default="scope">
                    <el-tag :type="menuType[scope.row.type].type">{{ menuType[scope.row.type].name }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="visible" label="可见" align="center" min-width="80">
                <template #default="scope">
                    <dict-tag :options="sys_show_hide" :value="scope.row.visible"/>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" align="center" min-width="80">
                <template #default="scope">
                    <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
                </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark" min-width="160" :show-overflow-tooltip="true"/>
            <el-table-column label="创建时间" align="center" prop="createTime" min-width="160">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="260">
                <template #default="scope">
                    <el-button
                        type="primary"
                        link
                        icon="Edit"
                        @click="handleUpdate(scope.row)"
                        v-hasPermi="['system:menu:edit']"
                    >修改</el-button>
                    <el-button
                        type="primary"
                        link
                        icon="Plus"
                        @click="handleAdd(scope.row)"
                        v-hasPermi="['system:menu:add']"
                    >新增</el-button>
                    <el-button
                        type="primary"
                        link
                        icon="Delete"
                        @click="handleDelete(scope.row)"
                        v-hasPermi="['system:menu:delete']"
                    >删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加或修改菜单对话框 -->
        <el-dialog :title="title" v-model="open" width="680px" append-to-body>
            <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
                <el-row>
                    <el-col :span="24">
                        <el-form-item label="上级菜单" width="100%">
                            <el-tree-select
                                v-model="form.parentId"
                                :data="menuOptions"
                                :props="{ value: 'id', label: 'name', children: 'children' }"
                                value-key="id"
                                placeholder="选择上级菜单"
                                check-strictly
                            />
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="菜单类型" prop="type">
                            <el-radio-group v-model="form.type">
                                <el-radio label="M">目录</el-radio>
                                <el-radio label="C">菜单</el-radio>
                                <el-radio label="F">按钮</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-if="form.type !== 'F'">
                        <el-form-item label="菜单图标" prop="icon">
                            <el-popover
                                ref="popoverRef"
                                placement="bottom-start"
                                :width="540"
                                trigger="click"
                                @show="showSelectIcon"
                            >
                                <template #reference>
                                    <el-input v-model="form.icon" placeholder="点击选择图标" readonly>
                                        <template #prefix>
                                            <svg-icon
                                                v-if="form.icon"
                                                :icon-class="form.icon"
                                                class="el-input__icon"
                                                style="height: 32px;width: 16px;"
                                            />
                                            <el-icon v-else style="height: 32px;width: 16px;">
                                                <Search />
                                            </el-icon>
                                        </template>
                                    </el-input>
                                </template>
                                <icon-select ref="iconSelectRef" @selected="selected" :active-icon="form.icon"/>
                            </el-popover>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="菜单名称" prop="name">
                            <el-input v-model="form.name" placeholder="请输入菜单名称"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="显示排序" prop="orderNum">
                            <el-input-number v-model="form.orderNum" controls-position="right" style="width: auto" :min="0"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="form.type !== 'F'">
                        <el-form-item>
                            <template #label>
                        <span>
                           <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                               <el-icon><QuestionFilled /></el-icon>
                           </el-tooltip>
                            是否外链
                        </span>
                            </template>
                            <el-radio-group v-model="form.isFrame">
                                <el-radio :label="0" style="width: 50px">否</el-radio>
                                <el-radio :label="1">是</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="form.type !== 'F'">
                        <el-form-item prop="path">
                            <template #label>
                        <span>
                           <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头"
                                       placement="top">
                              <el-icon><QuestionFilled /></el-icon>
                           </el-tooltip>
                           路由地址
                        </span>
                            </template>
                            <el-input v-model="form.path" placeholder="请输入路由地址"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="form.type === 'C'">
                        <el-form-item prop="component">
                            <template #label>
                        <span>
                           <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下"
                                       placement="top">
                              <el-icon><QuestionFilled /></el-icon>
                           </el-tooltip>
                           组件路径
                        </span>
                            </template>
                            <el-input v-model="form.component" placeholder="请输入组件路径"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="form.type !== 'M'">
                        <el-form-item>
                            <el-input v-model="form.perms" placeholder="请输入权限标识" maxlength="100"/>
                            <template #label>
                        <span>
                           <el-tooltip
                               content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                               placement="top">
                              <el-icon><QuestionFilled /></el-icon>
                           </el-tooltip>
                           权限字符
                        </span>
                            </template>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="form.type === 'C'">
                        <el-form-item>
                            <el-input v-model="form.query" placeholder="请输入路由参数" maxlength="255"/>
                            <template #label>
                        <span>
                           <el-tooltip content='访问路由的默认传递参数，如：`{"id": 1, "name": "xx"}`' placement="top">
                              <el-icon><QuestionFilled /></el-icon>
                           </el-tooltip>
                           路由参数
                        </span>
                            </template>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="form.type === 'C'">
                        <el-form-item>
                            <template #label>
                        <span>
                           <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致"
                                       placement="top">
                              <el-icon><QuestionFilled /></el-icon>
                           </el-tooltip>
                           是否缓存
                        </span>
                            </template>
                            <el-radio-group v-model="form.isCache">
                                <el-radio :label="1">缓存</el-radio>
                                <el-radio :label="0">不缓存</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="form.type !== 'F'">
                        <el-form-item>
                            <template #label>
                        <span>
                           <el-tooltip content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问" placement="top">
                              <el-icon><QuestionFilled /></el-icon>
                           </el-tooltip>
                           显示状态
                        </span>
                            </template>
                            <el-radio-group v-model="form.visible">
                                <el-radio
                                    v-for="dict in sys_show_hide"
                                    :key="dict.value"
                                    :label="dict.value"
                                >{{ dict.label }}
                                </el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-if="form.type !== 'F'">
                        <el-form-item>
                            <template #label>
                        <span>
                           <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                              <el-icon><QuestionFilled /></el-icon>
                           </el-tooltip>
                           菜单状态
                        </span>
                            </template>
                            <el-radio-group v-model="form.status">
                                <el-radio
                                    v-for="dict in sys_normal_disable"
                                    :key="dict.value"
                                    :label="dict.value"
                                >{{ dict.label }}
                                </el-radio>
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
    </div>
</template>

<script setup name="Menu">
import { addMenu, delMenu, getMenu, listMenu, updateMenu } from "@/api/system/menu"
import SvgIcon from "@/components/SvgIcon"
import IconSelect from "@/components/IconSelect"

const { proxy } = getCurrentInstance()
const { sys_show_hide, sys_normal_disable } = proxy.useDict("sys_show_hide", "sys_normal_disable")

const menuList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref("")
const menuOptions = ref([])
const isExpandAll = ref(false)
const refreshTable = ref(true)
const iconSelectRef = ref(null)
const popoverRef = ref(null)

const data = reactive({
    form: {},
    queryParams: {
        name: undefined,
        status: undefined,
        types: undefined
    },
    rules: {
        name: [{required: true, message: "菜单名称不能为空", trigger: "blur"}],
        orderNum: [{required: true, message: "菜单顺序不能为空", trigger: "blur"}],
        path: [{required: true, message: "路由地址不能为空", trigger: "blur"}]
    }
})

const {queryParams, form, rules} = toRefs(data)

const menuType = {
    'M' : { name: '目录', type: ''},
    'C' : { name: '菜单', type: 'success'},
    'F' : { name: '按钮', type: 'danger'}
}

/** 查询菜单列表 */
function getList() {
    loading.value = true
    listMenu(queryParams.value).then(response => {
        menuList.value = proxy.handleTree(response.data);
        loading.value = false
    })
}

/** 查询菜单下拉树结构 */
function getTreeselect() {
    menuOptions.value = []
    return listMenu().then(response => {
        const menu = {id: 0, name: "主类目", children: []}
        menu.children = proxy.handleTree(response.data, "id")
        menuOptions.value.push(menu)
    })
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
        parentId: 0,
        name: undefined,
        icon: undefined,
        type: "M",
        orderNum: undefined,
        isFrame: 0,
        isCache: 1,
        visible: "0",
        status: "0"
    }
    proxy.resetForm("menuRef")
}

/** 展示下拉图标 */
function showSelectIcon() {
    iconSelectRef.value.reset()
}

/** 选择图标 */
function selected(name) {
    form.value.icon = name
    popoverRef.value.hide()
}

/** 搜索按钮操作 */
function handleQuery() {
    getList()
}

/** 重置按钮操作 */
function resetQuery() {
    proxy.resetForm("queryRef")
    handleQuery()
}

/** 新增按钮操作 */
function handleAdd(row) {
    reset()
    getTreeselect().then(() => {
        if (row != null && row.id) {
            form.value.parentId = row.id
        } else {
            form.value.parentId = 0
        }
        form.value.orderNum = calcOrder(menuOptions.value, form.value.parentId)
    })
    open.value = true
    title.value = "添加菜单"
}

function calcOrder(dataList, pid, trace) {
    const traceId = trace || (new Date().getTime() % 10000) + 1
    const list = dataList
    for (let node of list) {
        if (node.id === pid) {
            return node.children ? node.children.length + 1 : 1
        }
    }
    for (let node of list) {
        const order = calcOrder(node.children, pid, traceId)
        if (order > 0) {
            return order
        }
    }
    return 0
}

/** 展开/折叠操作 */
function toggleExpandAll() {
    refreshTable.value = false;
    isExpandAll.value = !isExpandAll.value;
    nextTick(() => {
        refreshTable.value = true;
    });
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset()
    getTreeselect().then(() => {
        getMenu(row.id).then(response => {
            form.value = response.data
        })
    })
    open.value = true
    title.value = "修改菜单"
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["menuRef"].validate(valid => {
        if (valid) {
            if (form.value.id !== undefined) {
                updateMenu(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addMenu(form.value).then(response => {
                    proxy.$modal.msgSuccess("新增成功");
                    open.value = false;
                    getList();
                });
            }
        }
    });
}

/** 删除按钮操作 */
function handleDelete(row) {
    proxy.$modal.confirm('是否确认删除名称为"' + row.name + '"的数据项?').then(function () {
        return delMenu(row.id);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
    }).catch(e => {
    });
}

getList();
</script>
