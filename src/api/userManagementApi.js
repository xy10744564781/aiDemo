import { API_BASE_URL } from './config';
import { getAuthHeaders } from './authApi';
import { fetchWithAuth } from '../utils/apiInterceptor';

/**
 * 获取所有用户列表（仅超级管理员）
 */
export async function getAllUsers() {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/users`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    // 返回用户列表和角色列表
    return {
      users: data.users,
      roles: data.roles || []
    };
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
}

/**
 * 更新用户角色（仅超级管理员）
 */
export async function updateUserRole(userId, role) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('更新用户角色失败:', error);
    throw error;
  }
}

/**
 * 切换用户激活状态（仅超级管理员）
 */
export async function toggleUserStatus(userId) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('切换用户状态失败:', error);
    throw error;
  }
}
