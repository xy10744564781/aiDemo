/**
 * 部门管理 API
 */
import { API_BASE_URL } from './config';
import { getAuthHeaders } from './authApi';
import { fetchWithAuth } from '../utils/apiInterceptor';

/**
 * 获取所有部门列表
 */
export const getDepartments = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/departments/list`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取部门列表失败:', error);
    throw error;
  }
};

/**
 * 获取部门详情
 */
export const getDepartmentById = async (departmentId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/departments/${departmentId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取部门详情失败:', error);
    throw error;
  }
};

/**
 * 创建新部门
 */
export const createDepartment = async (departmentData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/departments/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(departmentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('创建部门失败:', error);
    throw error;
  }
};

/**
 * 更新部门信息
 */
export const updateDepartment = async (departmentId, departmentData) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/departments/${departmentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(departmentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('更新部门失败:', error);
    throw error;
  }
};

/**
 * 删除部门
 */
export const deleteDepartment = async (departmentId) => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/departments/${departmentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('删除部门失败:', error);
    throw error;
  }
};

/**
 * 获取部门统计信息
 */
export const getDepartmentStats = async () => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/departments/stats/summary`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取部门统计失败:', error);
    throw error;
  }
};
