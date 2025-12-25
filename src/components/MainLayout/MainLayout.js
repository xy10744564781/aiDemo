import { ref } from "vue";
import ChatInterface from "../ChatInterface/ChatInterface.vue";

export function useMainLayout() {
  const showToolbox = ref(false);

  function toggleToolbox() {
    showToolbox.value = !showToolbox.value;
  }

  function switchToChat() {
    showToolbox.value = false;
  }

  return {
    // Components
    ChatInterface,
    // Refs
    showToolbox,
    // Methods
    toggleToolbox,
    switchToChat
  };
}
