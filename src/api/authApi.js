import { API_BASE_URL } from './config';
import { fetchWithAuth } from '../utils/apiInterceptor';

/**
 * 用户登录
 * @param {Object} loginData - 登录数据
 * @param {string} loginData.username - 用户名
 * @param {string} loginData.password - 密码
 */
export async function loginUser(loginData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('登录请求失败:', error);
    throw error;
  }
}

/**
 * 用户注册
 * @param {Object} registerData - 注册数据
 * @param {string} registerData.username - 用户名
 * @param {string} registerData.email - 邮箱
 * @param {string} registerData.password - 密码
 * @param {number} registerData.department_id - 部门ID
 */
export async function registerUser(registerData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('注册请求失败:', error);
    throw error;
  }
}

/**
 * 获取用户资料
 */
export async function getUserProfile() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未找到认证令牌');
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取用户资料失败:', error);
    throw error;
  }
}

/**
 * 获取部门列表
 */
export async function getDepartments() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/departments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取部门列表失败:', error);
    throw error;
  }
}

/**
 * 用户登出
 */
export async function logoutUser() {
  try {
    const token = localStorage.getItem('token');
    
    // 清除本地存储
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (token) {
      // 调用后端登出接口（可选）
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('登出请求失败:', error);
    // 即使后端请求失败，也要清除本地存储
    return { success: true };
  }
}

/**
 * 检查用户是否已登录
 */
export function isLoggedIn() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  }
  return null;
}

/**
 * 获取认证头
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
}