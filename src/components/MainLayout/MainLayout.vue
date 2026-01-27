<template>
  <div class="app-shell">
    <!-- 未登录状态：显示登录/注册表单 -->
    <div v-if="!isAuthenticated" class="auth-container">
      <LoginForm 
        v-if="showLogin"
        @login-success="handleLoginSuccess"
        @switch-to-register="switchToRegister"
      />
      <RegisterForm 
        v-else
        @register-success="handleRegisterSuccess"
        @switch-to-login="switchToLogin"
      />
    </div>
    
    <!-- 已登录状态：显示主应用界面 -->
    <div v-else class="app-frame">
      <!-- 用户信息栏 -->
      <div class="user-header">
        <div class="user-info">
          <span class="welcome-text">欢迎，{{ currentUser?.username }}</span>
          <span v-if="currentUser?.role !== 'super_admin'" class="department-text">{{ currentUser?.department }}部门</span>
          <a-tag v-if="currentUser?.role === 'admin'" color="orange">部门管理员</a-tag>
          <a-tag v-else-if="currentUser?.role === 'super_admin'" color="red">超级管理员</a-tag>
        </div>
        <div class="user-actions">
          <a-button type="text" @click="handleLogout">
            <template #icon>
              <LogoutOutlined />
            </template>
            退出登录
          </a-button>
        </div>
      </div>
      
      <!-- 聊天界面组件 -->
      <ChatInterface 
        :show-toolbox="showToolbox"
        :show-settings="showSettings"
        :current-user="currentUser"
        @toggle-toolbox="toggleToolbox"
        @toggle-settings="toggleSettings"
        @switch-to-chat="switchToChat"
      />
    </div>
  </div>
</template>

<script setup>
import { LogoutOutlined } from '@ant-design/icons-vue';
import { useMainLayout } from './MainLayout.js';
import './MainLayout.css';

const {
  ChatInterface,
  LoginForm,
  RegisterForm,
  showToolbox,
  showSettings,
  isAuthenticated,
  currentUser,
  showLogin,
  toggleToolbox,
  toggleSettings,
  switchToChat,
  handleLoginSuccess,
  handleRegisterSuccess,
  handleLogout,
  switchToLogin,
  switchToRegister
} = useMainLayout();
</script>
