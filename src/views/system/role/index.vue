<script setup name="Role">
import { onMounted, reactive, ref } from 'vue'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import RoleForm from './RoleForm.vue'
import PermissionAllocation from './PermissionAllocation.vue'
import UserAllocation from './UserAllocation.vue'
import { deleteRoleApi, getRolePaging } from '@/api/system/role'
import usePagingParams from '@/hooks/usePagingParams'
import { getDictDataListByTypeCodeApi } from '@/api/system/dictData'
import { useAppStore } from '@/stores/modules/app'

defineOptions({
  name: 'Role',
})
const appStore = useAppStore()
const { current, size } = usePagingParams()
const queryFormRef = ref()
const state = reactive({
  showPermissionAllocation: false,
  showUserAllocation: false,
  commonStatusList: [],
  currentRow: {},
  queryLoading: false,
  dialogShow: false,
  tableData: [],
  total: 0,
  form: {
    roleName: '',
    roleCode: '',
    status: '',
  },
})
const methods = {
  async queryData() {
    state.queryLoading = true
    const { ok, data } = await getRolePaging({ ...state.form, page: current.value, size: size.value })
    state.tableData = ok ? data.records : []
    state.total = data.total

    state.queryLoading = false
  },
  refreshQuery(formEl) {
    formEl && formEl.resetFields()
    methods.queryData()
  },
  saveSuccess() {
    state.dialogShow = false
    methods.queryData()
  },
  async del(row) {
    const { ok } = await deleteRoleApi(row.roleId)
    ok && methods.queryData()
  },
  openRoleForm(row) {
    state.currentRow = row
    state.dialogShow = true
  },
  openDialog(row, flag) {
    state.currentRow = row
    switch (flag) {
      case 'showPermissionAllocation':
        state.showPermissionAllocation = true
        break
      case 'showUserAllocation':
        state.showUserAllocation = true
        break
    }
  },
  async getCommonStatusDict() {
    const { ok, data } = await getDictDataListByTypeCodeApi('commonStatus')
    if (ok)
      state.commonStatusList = data

    else
      ElMessage.error('获取通用状态字典数据失败')
  },
}
onMounted(() => {
  methods.getCommonStatusDict()
  methods.queryData()
})
</script>

<template>
  <el-container>
    <el-main>
      <el-card :shadow="appStore.appConfig.elChardShadow">
        <el-form ref="queryFormRef" inline :model="state.form">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="state.form.roleName" placeholder="请输入" clearable @keyup.enter="methods.queryData" />
          </el-form-item>
          <el-form-item label="角色编码" prop="roleCode">
            <el-input v-model="state.form.roleCode" placeholder="请输入" clearable @keyup.enter="methods.queryData" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="state.form.status" placeholder="请选择" clearable style="width: 100px;">
              <el-option
                v-for="item in state.commonStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" :loading="state.queryLoading" @click="methods.queryData">
              查询
            </el-button>
            <el-button type="warning" :icon="Refresh" :loading="state.queryLoading" @click="methods.refreshQuery(queryFormRef)">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="mt-2" :shadow="appStore.appConfig.elChardShadow">
        <div class="w-full pb-3 flex justify-between">
          <div>
            <el-button type="primary" :icon="Plus" @click="methods.openRoleForm({})">
              新增
            </el-button>
          </div>
          <div>
            <el-button :icon="Refresh" circle @click="methods.queryData" />
          </div>
        </div>
        <el-table v-loading="state.queryLoading" :data="state.tableData" border stripe height="calc(100vh - 350px)">
          <el-table-column fixed="left" type="index" align="right" header-align="center" width="60px" />
          <el-table-column
            prop="roleName" label="角色名称" fixed="left" align="left" header-align="center"
            min-width="180px"
          />
          <el-table-column prop="roleCode" label="角色编码" header-align="center" min-width="130px" />
          <el-table-column prop="orderNo" label="排序" align="right" header-align="center" width="80px" />
          <el-table-column label="状态" align="center" header-align="center" width="100px">
            <template #default="{ row }">
              <el-tag :type="state.commonStatusList.find(item => item.value === row.status)?.eleType">
                {{ state.commonStatusList.find(item => item.value === row.status)?.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" header-align="center" min-width="200px" />
          <el-table-column prop="createTime" label="创建时间" align="center" width="180px" />
          <el-table-column label="操作" align="center" fixed="right" width="220px">
            <template #default="{ row }">
              <el-button type="warning" link @click="methods.openRoleForm(row)">
                编辑
              </el-button>
              <el-popconfirm :title="`确认要删除【${row.roleName}】吗？`" @confirm="methods.del(row)">
                <template #reference>
                  <el-button type="danger" link>
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
              <el-button type="success" link @click="methods.openDialog(row, 'showPermissionAllocation')">
                权限
              </el-button>
              <el-button type="primary" link @click="methods.openDialog(row, 'showUserAllocation')">
                用户
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="current" v-model:page-size="size" class="mt-5" :default-page-size="size"
          :page-sizes="[10, 20, 30, 40, 50, 100]" background layout="->,total,prev, pager, next, jumper,sizes"
          :total="state.total" @current-change="methods.queryData" @size-change="methods.queryData"
        />
      </el-card>
    </el-main>
    <RoleForm
      v-if="state.dialogShow" v-model="state.dialogShow" :row="state.currentRow"
      @on-save-success="methods.saveSuccess"
    />
    <PermissionAllocation v-if="state.showPermissionAllocation" v-model="state.showPermissionAllocation" :role-id="state.currentRow.roleId" :role-name="state.currentRow.roleName" />
    <UserAllocation v-if="state.showUserAllocation" v-model="state.showUserAllocation" :role-id="state.currentRow.roleId" :role-name="state.currentRow.roleName" />
  </el-container>
</template>

<style scoped>
.el-form-item {
  margin-bottom: 0;
}
</style>