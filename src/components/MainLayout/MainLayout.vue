<template>
  <div class="app-shell">
    <!-- 已登录状态：显示主应用界面 -->
    <div class="app-frame">
      <!-- 用户信息栏 -->
      <div class="user-header">
        <div class="user-info">
          <a-dropdown>
            <a class="ant-dropdown-link" @click.prevent>
                <span class="welcome-text" style="cursor: pointer;">欢迎，{{ currentUser?.username }}</span>
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="toggleSettings" v-if="currentUser?.role === 'super_admin'">
                  <a >系统设置</a>
                </a-menu-item>
                <a-menu-item @click="handleLogout">
                  <a >退出登录</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <span v-if="currentUser?.role !== 'super_admin'" class="department-text">{{ currentUser?.department }}部门</span>
          <a-tag v-if="currentUser?.role === 'admin'" color="orange">部门管理员</a-tag>
          <a-tag v-else-if="currentUser?.role === 'super_admin'" color="red">超级管理员</a-tag>
        </div>
        <div class="user-actions">
          <a-button 
            type="text" 
            class="export-btn"
            @click="exportCurrentSession"
            :title="'导出聊天记录'"
          >
            <ExportOutlined />
            <span>导出</span>
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
        ref="chatInterfaceRef"
      />
    </div>
  </div>
</template>

<script setup>
// import { LogoutOutlined } from '@ant-design/icons-vue';
import { useMainLayout } from './MainLayout.js';
import './MainLayout.css';
import { ExportOutlined } from "@ant-design/icons-vue";
import { ref } from "vue";
const chatInterfaceRef = ref(null);

function exportCurrentSession(){
  chatInterfaceRef.value.exportCurrentSession();
}

const {
  ChatInterface,
  showToolbox,
  showSettings,
  currentUser,
  toggleToolbox,
  toggleSettings,
  switchToChat,
  handleLogout,
} = useMainLayout();
</script>
