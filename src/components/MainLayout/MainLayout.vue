<template>
  <div class="app-shell">
    <div class="app-frame">
      <!-- 聊天界面组件 -->
      <ChatInterface 
        :show-toolbox="showToolbox"
        @toggle-toolbox="toggleToolbox"
        @switch-to-chat="switchToChat"
      />
    </div>
  </div>
</template>

<script setup>
import { useMainLayout } from './MainLayout.js';
import './MainLayout.css';

const {
  ChatInterface,
  showToolbox,
  toggleToolbox,
  switchToChat
} = useMainLayout();
</script>
