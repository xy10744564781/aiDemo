import { ref, nextTick, onMounted, computed } from "vue";
import { PlusOutlined, AppstoreOutlined, SettingOutlined, ExportOutlined } from "@ant-design/icons-vue";
import { message } from 'ant-design-vue';
import DocumentManager from "../DocumentManager/DocumentManager.vue";
import SettingsManagement from "../SettingsManagement/SettingsManagement.vue";
import { queryStream, getChatSessions, createChatSession, addChatMessage, generateChatSessionTitle, exportChatSession } from '@/api';
import { getCurrentUser } from '@/api/authApi';

export function useChatInterface(emit) {
  // input
  const inputRef = ref(null);

  const chats = ref([]);
  const activeIdx = ref(0);
  const query = ref("");
  const messages = ref([]);
  const isQuerying = ref(false);
  const isLoading = ref(false);

  // 多会话存储
  const chatStore = ref([]); // [{ id: string, title: string, messages: [] }]

  // 检查是否为超级管理员
  const isSuperAdmin = computed(() => {
    const user = getCurrentUser();
    return user?.role === 'super_admin';
  });

  function focusInput() {
    inputRef.value?.focus?.();
  }

  function useExample(text) {
    query.value = text;
    nextTick(() => inputRef.value?.focus?.());
  }

  // 滚动到底部（留出输入框的空间）
  function scrollToBottom() {
    nextTick(() => {
      const rightContent = document.querySelector('.right-content');
      if (rightContent) {
        // 滚动到底部，但留出一些空间（不要完全贴到底）
        rightContent.scrollTo({
          top: rightContent.scrollHeight - 80,  // 留出80px的空间
          behavior: 'smooth'
        });
      }
    });
  }

  // 加载聊天会话列表
  async function loadChatSessions() {
    try {
      isLoading.value = true;
      const sessions = await getChatSessions();
      
      // 转换为前端格式
      chatStore.value = sessions.map(session => ({
        id: session.id,
        title: session.title,
        messages: session.messages || []
      }));
      
      chats.value = chatStore.value.map(c => c.title);
      
      // 如果有会话，选择第一个
      if (chatStore.value.length > 0) {
        activeIdx.value = 0;
        messages.value = chatStore.value[0].messages;
      }
    } catch (error) {
      console.error('加载会话列表失败:', error);
      message.error('加载聊天记录失败');
    } finally {
      isLoading.value = false;
    }
  }

  function selectChat(idx) {
    activeIdx.value = idx;
    const chat = chatStore.value[idx];
    messages.value = chat ? chat.messages : [];
    query.value = "";
    nextTick(() => {
      focusInput();
      scrollToBottom();
    });
    
    // 切换到聊天界面
    emit('switch-to-chat');
  }

  function onNewChat() {
    // 只在前端创建临时会话，不入库
    const title = `新聊天 ${chatStore.value.length + 1}`;
    
    // 添加到本地存储（id 为 null 表示未入库）
    chatStore.value.unshift({ 
      id: null,  // 临时会话，未入库
      title: title, 
      messages: [] 
    });
    
    chats.value = chatStore.value.map((c) => c.title);
    activeIdx.value = 0;
    messages.value = chatStore.value[0].messages;
    query.value = "";
    nextTick(() => focusInput());
    
    // 切换到聊天界面
    emit('switch-to-chat');
  }

  async function send() {
    const text = query.value.trim();
    if (!text || isQuerying.value) return;

    // 如果没有会话，先创建一个临时会话
    if (chatStore.value.length === 0) {
      onNewChat();
      await nextTick();
    }

    const chat = chatStore.value[activeIdx.value];
    if (!chat) {
      console.error('会话未正确创建');
      message.error('会话创建失败，请重试');
      return;
    }

    // 如果是临时会话（id 为 null），先在数据库中创建
    if (!chat.id) {
      try {
        console.log('首次发送消息，创建数据库会话...');
        const session = await createChatSession(chat.title);
        chat.id = session.id;
        console.log('数据库会话创建成功:', session.id);
      } catch (error) {
        console.error('创建数据库会话失败:', error);
        message.error('创建会话失败，请重试');
        return;
      }
    }

    const sessionId = chat.id;

    // 添加用户消息到界面
    chat.messages.push({ role: "user", text });
    messages.value = chat.messages;
    query.value = "";

    // 滚动到底部显示用户消息
    nextTick(() => scrollToBottom());

    // 保存用户消息到数据库
    try {
      await addChatMessage(sessionId, 'user', text);
    } catch (error) {
      console.error('保存用户消息失败:', error);
    }

    // 添加AI消息占位符（带加载状态）
    const aiMessage = { role: "bot", text: "", loading: true };
    chat.messages.push(aiMessage);
    messages.value = chat.messages;

    // 滚动到底部显示AI消息占位符
    nextTick(() => scrollToBottom());

    isQuerying.value = true;

    try {
      // 调用流式API（dev-mix：传递 sessionId 以支持对话历史）
      await queryStream(text, sessionId, {
        onContent: (content) => {
          aiMessage.text = content;
          // 强制触发响应式更新
          messages.value = [...chat.messages];
          // 使用 nextTick 确保 DOM 立即更新后滚动到底部
          nextTick(() => {
            scrollToBottom();
          });
        },
        onComplete: async () => {
          aiMessage.loading = false;
          messages.value = [...chat.messages];
          
          // 保存AI回复到数据库
          try {
            await addChatMessage(sessionId, 'bot', aiMessage.text);
          } catch (error) {
            console.error('保存AI消息失败:', error);
          }
          
          // 如果是第一次对话（只有1条用户消息和1条AI回复），自动生成标题
          if (chat.messages.length === 2) {
            try {
              console.log('检测到首次对话，开始生成标题...');
              const newTitle = await generateChatSessionTitle(sessionId);
              console.log('标题生成成功:', newTitle);
              
              // 更新本地会话标题
              chat.title = newTitle;
              chats.value = chatStore.value.map(c => c.title);
            } catch (error) {
              console.error('生成标题失败:', error);
              // 生成标题失败不影响正常使用，只记录错误
            }
          }
        },
        onError: (error) => {
          aiMessage.text = '抱歉，查询过程中出现错误，请稍后再试。';
          aiMessage.loading = false;
          messages.value = [...chat.messages];
          message.error('查询失败，请稍后再试', error);
        }
      });
    } catch (error) {
      // 错误已在 onError 回调中处理
      console.log(error);
      
    } finally {
      isQuerying.value = false;
      nextTick(() => focusInput());
    }
  }

  // 组件挂载时加载会话列表
  onMounted(() => {
    loadChatSessions();
  });

  // 导出当前会话
  async function exportCurrentSession() {
    if (chatStore.value.length === 0 || activeIdx.value < 0) {
      message.warning('没有可导出的聊天记录');
      return;
    }

    const chat = chatStore.value[activeIdx.value];
    if (!chat || !chat.id) {
      message.error('会话信息错误');
      return;
    }

    try {
      await exportChatSession(chat.id);
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请稍后再试');
    }
  }

  return {
    // Components
    PlusOutlined,
    AppstoreOutlined,
    SettingOutlined,
    ExportOutlined,
    DocumentManager,
    SettingsManagement,
    // Refs
    inputRef,
    chats,
    activeIdx,
    query,
    messages,
    chatStore,
    isQuerying,
    isLoading,
    isSuperAdmin,
    // Methods
    focusInput,
    useExample,
    selectChat,
    onNewChat,
    send,
    loadChatSessions,
    exportCurrentSession
  };
}
