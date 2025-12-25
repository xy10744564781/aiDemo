import { API_BASE_URL, API_ENDPOINTS, DEFAULT_USER_CTX } from './config';

/**
 * 获取文档列表
 * @returns {Promise<Array>} 文档列表
 */
export async function getDocuments() {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DOCUMENTS}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取文档列表失败:', error);
    throw error;
  }
}

/**
 * 上传文档
 * @param {File} file - 文件对象
 * @param {object} metadata - 文档元数据
 * @param {object} userCtx - 用户上下文
 * @returns {Promise<object>} 上传结果
 */
export async function uploadDocument(file, metadata = {}, userCtx = DEFAULT_USER_CTX) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', metadata.title || file.name);
  formData.append('category', metadata.category || '人事文档');
  formData.append('access_level', metadata.access_level || '全员');
  formData.append('user_ctx', JSON.stringify(userCtx));

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPLOAD_DOCUMENT}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('上传文档失败:', error);
    throw error;
  }
}

/**
 * 删除文档
 * @param {string} documentId - 文档ID
 * @returns {Promise<object>} 删除结果
 */
export async function deleteDocument(documentId) {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DELETE_DOCUMENT(documentId)}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('删除文档失败:', error);
    throw error;
  }
}
