             <template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2>注册账户</h2>
        <p>创建您的企业知识库账户（普通员工）</p>
        <a-alert
          message="注册后将创建普通员工账户，管理员权限需由超级管理员授予"
          type="info"
          show-icon
          style="margin-top: 16px; text-align: left;"
        />
      </div>
      
      <a-form
        :model="registerForm"
        :rules="registerRules"
        @finish="handleRegister"
        layout="vertical"
        class="register-form"
      >
        <a-form-item name="username" label="用户名">
          <a-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            size="large"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>
        
        <a-form-item name="email" label="邮箱">
          <a-input
            v-model="registerForm.email"
            placeholder="请输入邮箱地址"
            size="large"
          >
            <template #prefix>
              <MailOutlined />
            </template>
          </a-input>
        </a-form-item>
        
        <a-form-item name="department_id" label="部门">
          <a-select
            v-model="registerForm.department_id"
            placeholder="请选择您的部门"
            size="large"
            :loading="departmentsLoading"
          >
            <a-select-option
              v-for="dept in departments"
              :key="dept.id"
              :value="dept.id"
            >
              {{ dept.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        
        <a-form-item name="password" label="密码">
          <a-input-password
            v-model="registerForm.password"
            placeholder="请输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>
        
        <a-form-item name="confirmPassword" label="确认密码">
          <a-input-password
            v-model="registerForm.confirmPassword"
            placeholder="请再次输入密码"
            size="large"
          >
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>
        
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            注册
          </a-button>
        </a-form-item>
      </a-form>
      
      <div class="register-footer">
        <span>已有账户？</span>
        <a @click="$emit('switch-to-login')">立即登录</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons-vue'
import { registerUser, getDepartments } from '../../api/authApi'

const emit = defineEmits(['register-success', 'switch-to-login'])

const loading = ref(false)
const departmentsLoading = ref(false)
const departments = ref([])

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  department_id: undefined
})

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度应在2-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  department_id: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== registerForm.value.password) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

const loadDepartments = async () => {
  departmentsLoading.value = true
  try {
    const response = await getDepartments()
    // 过滤掉"公共"部门，因为它不是真实的部门，只用于存放公共文档
    departments.value = response.filter(dept => dept.name !== '公共')
  } catch (error) {
    console.error('加载部门列表失败:', error)
    message.error('加载部门列表失败')
  } finally {
    departmentsLoading.value = false
  }
}

const handleRegister = async (values) => {
  loading.value = true
  try {
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...registerData } = values
    const response = await registerUser(registerData)
    
    // 存储token和用户信息
    localStorage.setItem('token', response.access_token)
    localStorage.setItem('user', JSON.stringify(response.user))
    
    message.success('注册成功')
    emit('register-success', response.user)
    
  } catch (error) {
    console.error('注册失败:', error)
    message.error(error.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDepartments()
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-header h2 {
  color: #1f2937;
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
}

.register-header p {
  color: #6b7280;
  margin: 0;
}

.register-form {
  margin-bottom: 24px;
}

.register-footer {
  text-align: center;
  color: #6b7280;
}

.register-footer a {
  color: #1890ff;
  text-decoration: none;
  margin-left: 4px;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>