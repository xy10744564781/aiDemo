/**
 * API 拦截器 - 处理 token 过期等全局错误
 */

let logoutCallback = null;

/**
 * 设置登出回调函数
 * @param {Function} callback - 登出回调函数
 */
export function setLogoutCallback(callback) {
  logoutCallback = callback;
}

/**
 * 处理 API 响应错误
 * @param {Response} response - fetch 响应对象
 * @returns {Response} 原始响应对象
 */
export async function handleApiResponse(response) {
  // 如果是 401 未授权错误（token 过期或无效）
  if (response.status === 401) {
    console.warn('检测到 401 错误 - Token 可能已过期');
    
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 调用登出回调（跳转到登录页）
    if (logoutCallback) {
      logoutCallback();
    }
    
    // 抛出错误，让调用方知道需要重新登录
    throw new Error('认证已过期，请重新登录');
  }
  
  return response;
}

/**
 * 包装 fetch 请求，自动处理 401 错误
 * @param {string} url - 请求 URL
 * @param {Object} options - fetch 选项
 * @returns {Promise<Response>} fetch 响应
 */
export async function fetchWithAuth(url, options = {}) {
  const response = await fetch(url, options);
  return await handleApiResponse(response);
}
