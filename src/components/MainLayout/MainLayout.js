import { ref, onMounted } from "vue";
import ChatInterface from "../ChatInterface/ChatInterface.vue";
import LoginForm from "../Auth/LoginForm.vue";
import RegisterForm from "../Auth/RegisterForm.vue";
import { isLoggedIn, logoutUser, getCurrentUser } from "../../api/authApi";
import { setLogoutCallback } from "../../utils/apiInterceptor";

export function useMainLayout() {
  const showToolbox = ref(false);
  const showSettings = ref(false);
  const isAuthenticated = ref(false);
  const currentUser = ref(null);
  const showLogin = ref(true); // true: 显示登录, false: 显示注册

  // 检查用户登录状态
  function checkAuthStatus() {
    // 先设置默认状态，避免组件渲染问题
    isAuthenticated.value = false;
    currentUser.value = null;
    
    if (isLoggedIn()) {
      // 直接使用本地存储的用户信息，不调用API验证
      // API验证会在实际使用时通过拦截器自动处理
      isAuthenticated.value = true;
      currentUser.value = getCurrentUser();
    }
  }

  // 处理登录成功
  function handleLoginSuccess(user) {
    isAuthenticated.value = true;
    currentUser.value = user;
  }

  // 处理注册成功
  function handleRegisterSuccess(user) {
    isAuthenticated.value = true;
    currentUser.value = user;
  }

  // 处理登出
  async function handleLogout() {
    try {
      await logoutUser();
      isAuthenticated.value = false;
      currentUser.value = null;
      showLogin.value = true; // 切换到登录表单
    } catch (error) {
      console.error('登出失败:', error);
    }
  }

  // Token 过期自动登出（由 API 拦截器调用）
  function autoLogout() {
    console.warn('Token 已过期，自动退出登录');
    isAuthenticated.value = false;
    currentUser.value = null;
    showLogin.value = true; // 切换到登录表单
  }

  // 切换登录/注册表单
  function switchToLogin() {
    showLogin.value = true;
  }

  function switchToRegister() {
    showLogin.value = false;
  }

  function toggleToolbox() {
    showToolbox.value = !showToolbox.value;
    showSettings.value = false; // 关闭设置
  }

  function toggleSettings() {
    showSettings.value = !showSettings.value;
    showToolbox.value = false; // 关闭工具箱
  }

  function switchToChat() {
    showToolbox.value = false;
    showSettings.value = false;
  }

  // 组件挂载时检查登录状态并注册登出回调
  onMounted(() => {
    checkAuthStatus();
    // 注册 token 过期自动登出回调
    setLogoutCallback(autoLogout);
  });

  return {
    // Components
    ChatInterface,
    LoginForm,
    RegisterForm,
    // Refs
    showToolbox,
    showSettings,
    isAuthenticated,
    currentUser,
    showLogin,
    // Methods
    toggleToolbox,
    toggleSettings,
    switchToChat,
    handleLoginSuccess,
    handleRegisterSuccess,
    handleLogout,
    switchToLogin,
    switchToRegister,
    checkAuthStatus
  };
}
