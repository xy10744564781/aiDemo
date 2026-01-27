<template>
  <div class="chat-interface">
    <!-- Left Sidebar -->
    <aside class="left">
      <div class="left-top">
        <div class="left-brand">
          <img class="logo" src="/logo1.gif" />
        </div>

        <a-space direction="vertical" :size="6" align="start" class="left-actions-vertical">
          <a-button type="text" class="top-btn" @click="onNewChat">
            <PlusOutlined />
            <span>新聊天</span>
          </a-button>

          <a-button type="text" class="top-btn" @click="$emit('toggle-toolbox')">
            <AppstoreOutlined />
            <span>知识库</span>
          </a-button>
        </a-space>

        <div class="left-title">聊天</div>
      </div>

      <!-- Chat list -->
      <div class="left-list">
        <a-spin v-if="isLoading" :spinning="isLoading" style="display: flex; justify-content: center; padding: 20px;">
          <span>加载中...</span>
        </a-spin>
        
        <a-menu
          v-else
          mode="inline"
          :selectedKeys="[String(activeIdx)]"
          @click="({ key }) => selectChat(Number(key))"
          class="chat-menu"
        >
          <a-menu-item v-for="(c, idx) in chats" :key="String(idx)" :title="c">
            {{ c }}
          </a-menu-item>
        </a-menu>

        <div v-if="!isLoading && chats.length === 0" class="left-empty">
          <a-typography-text type="secondary">暂无聊天，点击「新聊天」开始</a-typography-text>
        </div>
      </div>

      <!-- 底部设置按钮（仅超级管理员可见） -->
      <div v-if="isSuperAdmin" class="left-bottom">
        <a-button type="text" class="settings-btn" @click="$emit('toggle-settings')">
          <SettingOutlined />
          <span>设置</span>
        </a-button>
      </div>
    </aside>

    <!-- Vertical divider -->
    <a-divider type="vertical" class="v-divider" />

    <!-- Right Content -->
    <main class="right">
      <!-- 聊天内容 -->
      <div v-if="!showToolbox && !showSettings" class="chat-content">
        <!-- 顶部操作栏 -->
        <div v-if="messages.length > 0" class="chat-header">
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

        <div class="right-content">
          <!-- Empty state -->
          <div v-if="messages.length === 0" class="empty">
            <div class="welcome">
              <a-typography-title :level="4" class="welcome-title">
                您好！我是线控知识库AI助手。
              </a-typography-title>
              <a-typography-text type="secondary" class="welcome-tip">
                请输入您的问题，我会为您提供详细解答。
              </a-typography-text>
            </div>

            <div class="ask-area">
              <div class="askbar" @click="focusInput">
                <a-input
                  ref="inputRef"
                  v-model:value="query"
                  :bordered="false"
                  class="askbar-input"
                  placeholder="询问任何问题"
                  @keydown.enter.prevent="send"
                />
              </div>

              <div class="examples">
                <a-typography-text type="secondary" class="examples-title">
                  您可以向我咨询：
                </a-typography-text>

                <a-space wrap :size="[10, 10]" class="examples-row">
                  <a-tag class="chip" @click="useExample('入职流程和要求')">入职流程和要求</a-tag>
                  <a-tag class="chip" @click="useExample('薪资福利政策')">薪资福利政策</a-tag>
                  <a-tag class="chip" @click="useExample('软件出厂要求')">软件出厂要求</a-tag>
                  <a-tag class="chip" @click="useExample('安全操作')">安全操作</a-tag>
                  <a-tag class="chip" @click="useExample('其他相关问题')">其他相关问题</a-tag>
                </a-space>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div v-else class="msg-wrap">
            <a-list :data-source="messages" class="msg-list-antd">
              <template #renderItem="{ item }">
                <a-list-item class="msg-item" :class="item.role">
                  <div class="msg-row" :class="item.role">
                    <!-- 用户消息：保持卡片样式 -->
                    <a-card v-if="item.role === 'user'" size="small" class="bubble-card" :bordered="true">
                      <a-typography-text v-if="!item.loading" style="white-space: pre-wrap;">
                        {{ item.text }}
                      </a-typography-text>
                    </a-card>
                    
                    <!-- AI 消息：无卡片，直接显示内容 -->
                    <div v-else-if="item.role === 'bot'" class="bot-message-content">
                      <!-- 初始加载状态（还没收到任何内容） -->
                      <div v-if="item.loading && !item.text" class="typing-indicator">
                        <a-spin size="small" />
                        <span style="margin-left: 8px;">正在思考...</span>
                      </div>
                      
                      <!-- 流式传输中和传输完成：解析并渲染内容 -->
                      <div v-else-if="item.text">
                        <!-- 如果有思考过程，显示折叠组件 -->
                        <a-collapse 
                          v-if="parseMessage(item.text).hasThinkingProcess" 
                          class="thinking-collapse"
                          :bordered="false"
                        >
                          <a-collapse-panel key="1">
                            <template #header>
                              <span class="thinking-header-text">💭 查看推理过程</span>
                            </template>
                            <div 
                              class="markdown-content thinking-content"
                              v-html="renderMarkdown(parseMessage(item.text).thinkingProcess)"
                            ></div>
                          </a-collapse-panel>
                        </a-collapse>
                        
                        <!-- 主要内容（详细解答） -->
                        <div 
                          class="markdown-content main-answer-content"
                          :class="{ 'streaming-text': item.loading }"
                          v-html="renderMarkdown(parseMessage(item.text).mainContent)"
                        ></div>
                      </div>
                    </div>
                  </div>
                </a-list-item>
              </template>
            </a-list>
          </div>
        </div>

        <!-- Bottom inputbar -->
        <div v-if="messages.length > 0" class="right-inputbar">
          <div class="ask-area bottom-ask-area">
            <div class="askbar" @click="focusInput">
              <a-input
                ref="inputRef"
                v-model:value="query"
                :bordered="false"
                :disabled="isQuerying"
                class="askbar-input"
                placeholder="询问任何问题"
                @keydown.enter.prevent="send"
              />
            </div>
          </div>

          <div class="bottom-hint">
            <a-typography-text type="secondary">
              {{ isQuerying ? '正在查询中...' : '回车发送' }}
            </a-typography-text>
          </div>
        </div>
      </div>

      <!-- 工具箱内容 -->
      <DocumentManager v-else-if="showToolbox" />
      
      <!-- 设置界面（仅超级管理员） -->
      <SettingsManagement v-else-if="showSettings" />
    </main>
  </div>
</template>

<script setup>
import { useChatInterface } from './ChatInterface.js';
import { renderMarkdown } from '@/utils/markdown';
import { parseAIResponse } from '@/utils/messageParser';
import './ChatInterface.css';
import './MarkdownContent.css';

defineProps({
  showToolbox: {
    type: Boolean,
    default: false
  },
  showSettings: {
    type: Boolean,
    default: false
  },
  currentUser: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['toggle-toolbox', 'toggle-settings', 'switch-to-chat']);

const {
  PlusOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ExportOutlined,
  DocumentManager,
  SettingsManagement,
  inputRef,
  chats,
  activeIdx,
  query,
  messages,
  isQuerying,
  isLoading,
  isSuperAdmin,
  focusInput,
  useExample,
  selectChat,
  onNewChat,
  send,
  exportCurrentSession
} = useChatInterface(emit);

// 解析消息内容
function parseMessage(text) {
  return parseAIResponse(text);
}
</script>
