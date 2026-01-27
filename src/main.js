import { createApp } from 'vue'
import App from './App.vue'
import router from './router'



import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'



// 处理 ResizeObserver 错误
if (typeof window !== 'undefined') {
  // 处理全局错误
  window.addEventListener('error', e => {
    if (e.message && e.message.includes('ResizeObserver loop')) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return false;
    }
  });

  // 处理未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', e => {
    if (e.reason && e.reason.message && e.reason.message.includes('ResizeObserver loop')) {
      e.preventDefault();
      return false;
    }
  });

  // 隐藏 webpack-dev-server 的错误覆盖层
  const hideWebpackOverlay = () => {
    const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
    const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
    if (resizeObserverErr) {
      resizeObserverErr.style.display = 'none';
    }
    if (resizeObserverErrDiv) {
      resizeObserverErrDiv.style.display = 'none';
    }
  };

  // 监听 DOM 变化，隐藏错误覆盖层
  const observer = new MutationObserver(() => {
    hideWebpackOverlay();
  });
  
  // 页面加载完成后开始监听
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
    hideWebpackOverlay();
  });
}

createApp(App).use(Antd).use(router).mount('#app')
