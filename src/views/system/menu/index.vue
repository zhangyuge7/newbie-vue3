<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Minus, Plus, Refresh, Search, Sort } from '@element-plus/icons-vue'
import useCutTree from 'cut-tree'
import { ElMessageBox } from 'element-plus'
import MenuForm from './MenuForm.vue'
import { deleteBatchApi, getMenuTreeApi } from '@/api/system/menu'
import SvgIcon from '@/components/svg-icon/index.vue'
import { useAppStore } from '@/stores/modules/app'

defineOptions({
  name: 'SysMenu',
})
const tableRef = ref()
const appStore = useAppStore()
const queryFormRef = ref()
const { forEach } = useCutTree({ id: 'id', parentId: 'parentId', children: 'children' })
const state = reactive({
  currentRow: {},
  showDrawer: false,
  queryLoading: false,
  tableIsExpansionAll: false,
  tableData: [],
  queryForm: {
    title: '',
    routePath: '',
    component: '',
  },
})
const methods = {
  async queryData() {
    state.queryLoading = true
    const { ok, data } = await getMenuTreeApi(state.queryForm)
    state.tableData = ok ? data : []
    state.queryLoading = false
  },
  refreshQuery(formEl) {
    formEl && formEl.resetFields()
    methods.queryData()
  },
  expansionTable() {
    forEach(state.tableData, row => tableRef.value.toggleRowExpansion(row, !state.tableIsExpansionAll))
    state.tableIsExpansionAll = !state.tableIsExpansionAll
  },
  async delBatch(id) {
    if (id) {
      const { ok } = await deleteBatchApi([id])
      ok && methods.queryData()
    }
    else {
      const ids = tableRef.value.getSelectionRows().map(item => item.id)
      ElMessageBox.confirm('确认删除选中数据吗?',
        '注意',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        })
        .then(async () => {
          const { ok } = await deleteBatchApi(ids)
          ok && methods.queryData()
        })
    }
  },
  openMenuForm(row) {
    state.currentRow = row
    state.showDrawer = true
  },
  saveSuccess() {
    state.showDrawer = false
    methods.queryData()
  },

}
onMounted(() => {
  methods.queryData()
})
</script>

<template>
  <el-container>
    <el-main>
      <el-card :shadow="appStore.appConfig.elChardShadow">
        <el-form ref="queryFormRef" inline :model="state.queryForm">
          <el-form-item label="标题" prop="title">
            <el-input v-model="state.queryForm.title" placeholder="请输入" clearable @keyup.enter="methods.queryData" />
          </el-form-item>
          <el-form-item label="路由地址" prop="routePath">
            <el-input v-model="state.queryForm.routePath" placeholder="请输入" clearable @keyup.enter="methods.queryData" />
          </el-form-item>
          <el-form-item label="组件路径" prop="component">
            <el-input v-model="state.queryForm.component" placeholder="请输入" clearable @keyup.enter="methods.queryData" />
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

      <el-card :shadow="appStore.appConfig.elChardShadow" class="mt-2">
        <div class="w-full pb-3 flex justify-between">
          <div>
            <el-button v-hasPerm="'sys.menu.add'" type="primary" :icon="Plus" @click="methods.openMenuForm({})">
              新增
            </el-button>
            <el-button v-hasPerm="'sys.menu.del'" type="danger" :icon="Minus" @click="methods.delBatch(null)">
              删除
            </el-button>
            <el-button :icon="Sort" @click="methods.expansionTable">
              {{ state.tableIsExpansionAll ? '合并所有' : '展开所有' }}
            </el-button>
          </div>
          <div>
            <el-button :icon="Refresh" circle @click="methods.queryData" />
          </div>
        </div>
        <el-table
          ref="tableRef" v-loading="state.queryLoading" :data="state.tableData" border stripe row-key="id"
          height="calc(100vh - 320px)"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="title" label="标题" width="180" fixed="left" align="left" header-align="center" />
          <el-table-column prop="icon" label="图标" width="70" align="center" header-align="center">
            <template #default="{ row }">
              <el-icon style="width: 100%;">
                <SvgIcon v-if="row.icon" :name="row.icon" />
              </el-icon>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="70" align="right" header-align="center" />
          <el-table-column label="类型" width="90" align="center">
            <template #default="{ row }">
              <el-tag :type="row.type === '0' ? 'success' : 'primary'">
                {{ row.type === '1' ? '菜单' : '按钮' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="routePath" label="路由地址" show-overflow-tooltip align="left" header-align="center" min-width="200px" />
          <el-table-column prop="component" label="组件路径" show-overflow-tooltip align="left" header-align="center" min-width="200px" />
          <el-table-column prop="perm" label="权限标识" align="left" header-align="center" min-width="200px" />

          <el-table-column label="状态" width="90" align="center" header-align="center">
            <template #default="{ row }">
              <DictTag v-model="row.status" type-code="commonStatus" />
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" align="center" header-align="center" />
          <el-table-column
            v-hasPerm="['sys.menu.add', 'sys.menu.update', 'sys.menu.del']"
            label="操作" min-width="170" align="center" fixed="right"
          >
            <template #default="{ row }">
              <el-button
                v-hasPerm="'sys.menu.add'" :disabled="row.type === '0'" type="primary" link
                @click="methods.openMenuForm({ parentId: row.id })"
              >
                新增
              </el-button>
              <el-button v-hasPerm="'sys.menu.update'" type="warning" link @click="methods.openMenuForm(row)">
                编辑
              </el-button>
              <el-popconfirm :hide-after="0" :title="`确认要删除【${row.title}】吗？`" @confirm="methods.delBatch(row.id)">
                <template #reference>
                  <el-button v-hasPerm="'sys.menu.del'" type="danger" link>
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>
    <MenuForm
      v-if="state.showDrawer"
      v-model="state.showDrawer" :row="state.currentRow"
      @on-save-success="methods.saveSuccess"
    />
  </el-container>
</template>

<style scoped>
:deep(.el-drawer__body) {
  padding: 0;
}
</style>
