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
            <span>工具箱</span>
          </a-button>
        </a-space>

        <div class="left-title">聊天</div>
      </div>

      <!-- Chat list -->
      <div class="left-list">
        <a-menu
          mode="inline"
          :selectedKeys="[String(activeIdx)]"
          @click="({ key }) => selectChat(Number(key))"
          class="chat-menu"
        >
          <a-menu-item v-for="(c, idx) in chats" :key="String(idx)" :title="c">
            {{ c }}
          </a-menu-item>
        </a-menu>

        <div v-if="chats.length === 0" class="left-empty">
          <a-typography-text type="secondary">暂无聊天，点击「新聊天」开始</a-typography-text>
        </div>
      </div>
    </aside>

    <!-- Vertical divider -->
    <a-divider type="vertical" class="v-divider" />

    <!-- Right Content -->
    <main class="right">
      <!-- 聊天内容 -->
      <div v-if="!showToolbox" class="chat-content">
        <div class="right-content">
          <!-- Empty state -->
          <div v-if="messages.length === 0" class="empty">
            <div class="welcome">
              <a-typography-title :level="4" class="welcome-title">
                您好！我是人事知识库AI助手。
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
                  <a-tag class="chip" @click="useExample('考勤和请假制度')">考勤和请假制度</a-tag>
                  <a-tag class="chip" @click="useExample('培训发展机会')">培训发展机会</a-tag>
                  <a-tag class="chip" @click="useExample('其他人事相关问题')">其他人事相关问题</a-tag>
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
                    <a-card size="small" class="bubble-card" :bordered="true">
                      <a-typography-text style="white-space: pre-wrap;">
                        {{ item.text }}
                      </a-typography-text>
                    </a-card>
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
                class="askbar-input"
                placeholder="询问任何问题"
                @keydown.enter.prevent="send"
              />
            </div>
          </div>

          <div class="bottom-hint">
            <a-typography-text type="secondary">回车发送</a-typography-text>
          </div>
        </div>
      </div>

      <!-- 工具箱内容 -->
      <ToolboxPanel v-else />
    </main>
  </div>
</template>

<script setup>
import { useChatInterface } from './ChatInterface.js';
import './ChatInterface.css';

defineProps({
  showToolbox: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-toolbox', 'switch-to-chat']);

const {
  PlusOutlined,
  AppstoreOutlined,
  ToolboxPanel,
  inputRef,
  chats,
  activeIdx,
  query,
  messages,
  focusInput,
  useExample,
  selectChat,
  onNewChat,
  send
} = useChatInterface(emit);
</script>
