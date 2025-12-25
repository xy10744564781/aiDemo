import { ref, nextTick } from "vue";
import { PlusOutlined, AppstoreOutlined } from "@ant-design/icons-vue";
import ToolboxPanel from "../ToolboxPanel/ToolboxPanel.vue";

export function useChatInterface(emit) {
  // input
  const inputRef = ref(null);

  const chats = ref([]);
  const activeIdx = ref(0);
  const query = ref("");
  const messages = ref([]);

  // 多会话存储
  const chatStore = ref([]); // [{ title: string, messages: [] }]

  function focusInput() {
    inputRef.value?.focus?.();
  }

  function useExample(text) {
    query.value = text;
    nextTick(() => inputRef.value?.focus?.());
  }

  function selectChat(idx) {
    activeIdx.value = idx;
    const chat = chatStore.value[idx];
    messages.value = chat ? chat.messages : [];
    query.value = "";
    nextTick(() => focusInput());
    
    // 切换到聊天界面
    emit('switch-to-chat');
  }

  function onNewChat() {
    const title = `新聊天 ${chatStore.value.length + 1}`;
    chatStore.value.unshift({ title, messages: [] });
    chats.value = chatStore.value.map((c) => c.title);
    activeIdx.value = 0;
    messages.value = chatStore.value[0].messages;
    query.value = "";
    nextTick(() => focusInput());
    
    // 切换到聊天界面
    emit('switch-to-chat');
  }

  function send() {
    const text = query.value.trim();
    if (!text) return;

    if (chatStore.value.length === 0) onNewChat();

    const chat = chatStore.value[activeIdx.value];

    chat.messages.push({ role: "user", text });
    chat.messages.push({ role: "bot", text: "收到：" + text });

    messages.value = chat.messages;

    query.value = "";
    nextTick(() => focusInput());
  }

  return {
    // Components
    PlusOutlined,
    AppstoreOutlined,
    ToolboxPanel,
    // Refs
    inputRef,
    chats,
    activeIdx,
    query,
    messages,
    chatStore,
    // Methods
    focusInput,
    useExample,
    selectChat,
    onNewChat,
    send
  };
}
