<template>
  <div class="department-management">
    <div class="header">
      <h2>部门管理</h2>
      <button 
        v-if="isSuperAdmin" 
        class="btn-primary" 
        @click="showCreateModal = true"
      >
        <i class="icon-plus"></i> 新建部门
      </button>
    </div>

    <!-- 统计信息 -->
    <div v-if="isSuperAdmin && stats" class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">总部门数</div>
        <div class="stat-value">{{ stats.total_departments }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">总用户数</div>
        <div class="stat-value">{{ stats.total_users }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">未分配用户</div>
        <div class="stat-value">{{ stats.users_without_department }}</div>
      </div>
    </div>

    <!-- 部门列表 -->
    <div class="department-list">
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-else-if="departments.length === 0" class="empty-state">
        <p>暂无部门</p>
      </div>

      <div v-else class="table-container">
        <table class="department-table">
          <thead>
            <tr>
              <th>部门名称</th>
              <th>描述</th>
              <th>用户数量</th>
              <th>创建时间</th>
              <th v-if="isSuperAdmin">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dept in departments" :key="dept.id">
              <td class="dept-name">{{ dept.name }}</td>
              <td class="dept-desc">{{ dept.description || '-' }}</td>
              <td class="dept-count">{{ dept.user_count }}</td>
              <td class="dept-time">{{ formatDate(dept.created_at) }}</td>
              <td v-if="isSuperAdmin" class="dept-actions">
                <button 
                  class="btn-icon btn-edit" 
                  @click="editDepartment(dept)"
                  :title="dept.name === '公共' ? '公共部门不可编辑' : '编辑'"
                  :disabled="dept.name === '公共'"
                >
                  ✏️
                </button>
                <button 
                  class="btn-icon btn-delete" 
                  @click="confirmDelete(dept)"
                  :title="dept.name === '公共' ? '公共部门不可删除' : '删除'"
                  :disabled="dept.name === '公共'"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 创建/编辑部门模态框 -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ showEditModal ? '编辑部门' : '新建部门' }}</h3>
          <button class="btn-close" @click="closeModals">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>部门名称 <span class="required">*</span></label>
            <input 
              v-model="formData.name" 
              type="text" 
              placeholder="请输入部门名称"
              maxlength="50"
            />
          </div>
          
          <div class="form-group">
            <label>部门描述</label>
            <textarea 
              v-model="formData.description" 
              placeholder="请输入部门描述（可选）"
              rows="3"
              maxlength="200"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModals">取消</button>
          <button 
            class="btn-primary" 
            @click="showEditModal ? updateDept() : createDept()"
            :disabled="!formData.name.trim()"
          >
            {{ showEditModal ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-content modal-small">
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="btn-close" @click="showDeleteModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <p>确定要删除部门 <strong>{{ departmentToDelete?.name }}</strong> 吗？</p>
          <p v-if="departmentToDelete?.user_count > 0" class="warning-text">
            ⚠️ 该部门还有 {{ departmentToDelete.user_count }} 个用户，无法删除。请先将用户转移到其他部门。
          </p>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteModal = false">取消</button>
          <button 
            class="btn-danger" 
            @click="deleteDept()"
            :disabled="departmentToDelete?.user_count > 0"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message.show" :class="['message-toast', message.type]">
      {{ message.text }}
    </div>
  </div>
</template>

<script>
import { 
  getDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  getDepartmentStats 
} from '../../api/departmentApi';

export default {
  name: 'DepartmentManagement',
  
  data() {
    return {
      departments: [],
      stats: null,
      loading: false,
      showCreateModal: false,
      showEditModal: false,
      showDeleteModal: false,
      departmentToDelete: null,
      currentDepartment: null,
      formData: {
        name: '',
        description: ''
      },
      message: {
        show: false,
        type: 'success',
        text: ''
      }
    };
  },
  
  computed: {
    isSuperAdmin() {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role === 'super_admin' || user.permissions?.includes('system.admin');
    }
  },
  
  mounted() {
    this.loadDepartments();
    if (this.isSuperAdmin) {
      this.loadStats();
    }
  },
  
  methods: {
    async loadDepartments() {
      this.loading = true;
      try {
        this.departments = await getDepartments();
      } catch (error) {
        this.showMessage('加载部门列表失败', 'error');
        console.error('加载部门列表失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async loadStats() {
      try {
        this.stats = await getDepartmentStats();
      } catch (error) {
        console.error('加载统计信息失败:', error);
      }
    },
    
    async createDept() {
      if (!this.formData.name.trim()) {
        this.showMessage('请输入部门名称', 'error');
        return;
      }
      
      try {
        await createDepartment({
          name: this.formData.name.trim(),
          description: this.formData.description.trim() || null
        });
        
        this.showMessage('部门创建成功', 'success');
        this.closeModals();
        this.loadDepartments();
        this.loadStats();
      } catch (error) {
        const errorMsg = error.response?.data?.detail || '创建部门失败';
        this.showMessage(errorMsg, 'error');
      }
    },
    
    editDepartment(dept) {
      this.currentDepartment = dept;
      this.formData = {
        name: dept.name,
        description: dept.description || ''
      };
      this.showEditModal = true;
    },
    
    async updateDept() {
      if (!this.formData.name.trim()) {
        this.showMessage('请输入部门名称', 'error');
        return;
      }
      
      try {
        await updateDepartment(this.currentDepartment.id, {
          name: this.formData.name.trim(),
          description: this.formData.description.trim() || null
        });
        
        this.showMessage('部门更新成功', 'success');
        this.closeModals();
        this.loadDepartments();
      } catch (error) {
        const errorMsg = error.response?.data?.detail || '更新部门失败';
        this.showMessage(errorMsg, 'error');
      }
    },
    
    confirmDelete(dept) {
      this.departmentToDelete = dept;
      this.showDeleteModal = true;
    },
    
    async deleteDept() {
      try {
        await deleteDepartment(this.departmentToDelete.id);
        this.showMessage('部门删除成功', 'success');
        this.showDeleteModal = false;
        this.departmentToDelete = null;
        this.loadDepartments();
        this.loadStats();
      } catch (error) {
        const errorMsg = error.response?.data?.detail || '删除部门失败';
        this.showMessage(errorMsg, 'error');
      }
    },
    
    closeModals() {
      this.showCreateModal = false;
      this.showEditModal = false;
      this.currentDepartment = null;
      this.formData = {
        name: '',
        description: ''
      };
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    
    showMessage(text, type = 'success') {
      this.message = { show: true, text, type };
      setTimeout(() => {
        this.message.show = false;
      }, 3000);
    }
  }
};
</script>

<style scoped>
.department-management {
  padding: 0;
  max-width: 100%;
  margin: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.header h2 {
  margin: 0;
  font-size: 20px;
  color: #1890ff;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
}

/* 按钮样式 */
.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-danger {
  background: #f56565;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-danger:hover {
  background: #e53e3e;
}

.btn-danger:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 表格样式 */
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.department-table {
  width: 100%;
  border-collapse: collapse;
}

.department-table thead {
  background: #f7fafc;
}

.department-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
  border-bottom: 2px solid #e2e8f0;
}

.department-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
  color: #2d3748;
}

.department-table tbody tr:hover {
  background: #f7fafc;
}

.dept-name {
  font-weight: 500;
  color: #2d3748;
}

.dept-desc {
  color: #718096;
}

.dept-count {
  text-align: center;
  font-weight: 500;
}

.dept-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-icon:disabled:hover {
  background: none;
}

/* 加载和空状态 */
.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: #718096;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2d3748;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #718096;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.btn-close:hover {
  background: #f0f0f0;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2d3748;
  font-size: 14px;
}

.required {
  color: #f56565;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.warning-text {
  color: #f56565;
  font-size: 14px;
  margin-top: 12px;
}

/* 消息提示 */
.message-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  animation: slideIn 0.3s ease-out;
}

.message-toast.success {
  background: #48bb78;
  color: white;
}

.message-toast.error {
  background: #f56565;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .department-management {
    padding: 12px;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .department-table {
    min-width: 600px;
  }
}
</style>
