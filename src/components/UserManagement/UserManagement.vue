<template>
  <div class="user-management">
    <div class="management-header">
      <div>
        <h2>用户管理</h2>
        <p style="color: #666; margin: 8px 0 0 0; font-size: 14px;">
          管理所有用户的角色和状态。新注册用户默认为普通员工，您可以提升其权限。
        </p>
      </div>
      <a-button @click="refreshUsers">
        <ReloadOutlined />
        刷新
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="users"
      :loading="loading"
      row-key="id"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'username'">
          <a-space>
            <span>{{ record.username }}</span>
            <a-tag v-if="record.id === currentUserId" color="blue">当前用户</a-tag>
          </a-space>
        </template>

        <template v-if="column.key === 'role'">
          <a-select
            v-model:value="record.role"
            style="width: 120px"
            :disabled="record.id === currentUserId"
            @change="(value) => handleRoleChange(record, value)"
          >
            <a-select-option 
              v-for="role in roles" 
              :key="role.code" 
              :value="role.code"
            >
              {{ role.name }}
            </a-select-option>
          </a-select>
        </template>

        <template v-if="column.key === 'is_active'">
          <a-tag :color="record.is_active ? 'green' : 'red'">
            {{ record.is_active ? '激活' : '禁用' }}
          </a-tag>
        </template>

        <template v-if="column.key === 'can_upload'">
          <a-tag :color="record.can_upload ? 'blue' : 'default'">
            {{ record.can_upload ? '是' : '否' }}
          </a-tag>
        </template>

        <template v-if="column.key === 'actions'">
          <a-space>
            <a-popconfirm
              :title="`确定要${record.is_active ? '禁用' : '激活'}该用户吗？`"
              @confirm="toggleStatus(record)"
              :disabled="record.id === currentUserId"
            >
              <a-button 
                type="link" 
                size="small"
                :disabled="record.id === currentUserId"
              >
                {{ record.is_active ? '禁用' : '激活' }}
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { getAllUsers, updateUserRole, toggleUserStatus } from '@/api/userManagementApi';
import { getCurrentUser } from '@/api/authApi';

export default {
  name: 'UserManagement',
  components: {
    ReloadOutlined
  },
  setup() {
    const loading = ref(false);
    const users = ref([]);
    const roles = ref([]); // 添加角色列表
    const currentUserId = ref(getCurrentUser()?.id);

    const columns = [
      {
        title: '用户名',
        dataIndex: 'username',
        key: 'username',
        width: 150
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
        width: 200
      },
      {
        title: '部门',
        dataIndex: 'department',
        key: 'department',
        width: 100
      },
      {
        title: '角色',
        dataIndex: 'role',
        key: 'role',
        width: 150
      },
      {
        title: '状态',
        dataIndex: 'is_active',
        key: 'is_active',
        width: 80
      },
      {
        title: '上传权限',
        dataIndex: 'can_upload',
        key: 'can_upload',
        width: 100
      },
      {
        title: '注册时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 150,
        customRender: ({ text }) => {
          if (!text) return '-';
          return new Date(text).toLocaleString('zh-CN');
        }
      },
      {
        title: '操作',
        key: 'actions',
        width: 100,
        fixed: 'right'
      }
    ];

    // 加载用户列表
    const refreshUsers = async () => {
      loading.value = true;
      try {
        const data = await getAllUsers();
        users.value = data.users;
        roles.value = data.roles; // 保存角色列表
        message.success('用户列表刷新成功');
      } catch (error) {
        console.error('获取用户列表失败:', error);
        message.error('获取用户列表失败');
      } finally {
        loading.value = false;
      }
    };

    // 更改用户角色
    const handleRoleChange = async (user, newRole) => {
      try {
        await updateUserRole(user.id, newRole);
        message.success(`用户 ${user.username} 的角色已更新为 ${getRoleText(newRole)}`);
        refreshUsers();
      } catch (error) {
        console.error('更新角色失败:', error);
        message.error(error.message || '更新角色失败');
        // 恢复原值
        refreshUsers();
      }
    };

    // 切换用户状态
    const toggleStatus = async (user) => {
      try {
        await toggleUserStatus(user.id);
        const statusText = user.is_active ? '禁用' : '激活';
        message.success(`用户 ${user.username} 已${statusText}`);
        refreshUsers();
      } catch (error) {
        console.error('切换状态失败:', error);
        message.error(error.message || '切换状态失败');
      }
    };

    // 获取角色文本
    const getRoleText = (role) => {
      const roleMap = {
        'employee': '普通员工',
        'admin': '部门管理员',
        'super_admin': '超级管理员'
      };
      return roleMap[role] || role;
    };

    // 初始化
    onMounted(() => {
      refreshUsers();
    });

    return {
      loading,
      users,
      roles, // 导出角色列表
      currentUserId,
      columns,
      refreshUsers,
      handleRoleChange,
      toggleStatus
    };
  }
};
</script>

<style scoped>
.user-management {
  padding: 0;
  background: transparent;
  height: 100%;
  overflow-y: auto;
}

.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.management-header h2 {
  margin: 0;
  color: #1890ff;
  font-size: 20px;
}
</style>
