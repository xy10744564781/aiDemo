<template>
  <div class="settings-management">
    <div class="settings-header">
      <h2>系统设置</h2>
      <p class="settings-desc">管理系统用户和部门信息</p>
    </div>

    <a-tabs v-model:activeKey="activeTab" class="settings-tabs">
      <a-tab-pane key="users" tab="用户管理">
        <UserManagement />
      </a-tab-pane>
      
      <a-tab-pane key="departments" tab="部门管理">
        <DepartmentManagement />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import { ref } from 'vue';
import UserManagement from '../UserManagement/UserManagement.vue';
import DepartmentManagement from '../DepartmentManagement/DepartmentManagement.vue';

export default {
  name: 'SettingsManagement',
  components: {
    UserManagement,
    DepartmentManagement
  },
  setup() {
    const activeTab = ref('users');

    return {
      activeTab
    };
  }
};
</script>

<style scoped>
.settings-management {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.settings-header {
  padding: 24px 24px 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
}

.settings-header h2 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 24px;
  font-weight: 600;
}

.settings-desc {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.settings-tabs {
  flex: 1;
  background: #fff;
  padding: 0 24px;
  overflow: hidden;
}

.settings-tabs :deep(.ant-tabs-content) {
  height: 100%;
}

.settings-tabs :deep(.ant-tabs-tabpane) {
  height: 100%;
  overflow-y: auto;
}

.settings-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}
</style>
