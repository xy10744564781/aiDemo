import { API_BASE_URL } from './config';

/**
 * 创建新的聊天会话
 * @param {string} title - 会话标题
 * @param {string} userId - 用户ID（可选）
 * @returns {Promise<object>} 会话信息
 */
export async function createChatSession(title, userId = null) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat-sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        user_id: userId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('创建会话失败:', error);
    throw error;
  }
}

/**
 * 获取聊天会话列表
 * @param {string} userId - 用户ID（可选）
 * @param {number} limit - 返回数量限制
 * @returns {Promise<Array>} 会话列表
 */
export async function getChatSessions(userId = null, limit = 50) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    params.append('limit', limit);

    const response = await fetch(`${API_BASE_URL}/api/chat-sessions?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.sessions;
  } catch (error) {
    console.error('获取会话列表失败:', error);
    throw error;
  }
}

/**
 * 获取单个聊天会话
 * @param {string} sessionId - 会话ID
 * @returns {Promise<object>} 会话信息
 */
export async function getChatSession(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat-sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('获取会话失败:', error);
    throw error;
  }
}

/**
 * 添加聊天消息
 * @param {string} sessionId - 会话ID
 * @param {string} role - 角色（user/bot）
 * @param {string} content - 消息内容
 * @returns {Promise<object>} 消息信息
 */
export async function addChatMessage(sessionId, role, content) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat-sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        content
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('添加消息失败:', error);
    throw error;
  }
}

/**
 * 更新聊天会话标题
 * @param {string} sessionId - 会话ID
 * @param {string} title - 新标题
 * @returns {Promise<object>} 响应信息
 */
export async function updateChatSessionTitle(sessionId, title) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat-sessions/${sessionId}/title`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('更新标题失败:', error);
    throw error;
  }
}

/**
 * 删除聊天会话
 * @param {string} sessionId - 会话ID
 * @returns {Promise<object>} 响应信息
 */
export async function deleteChatSession(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat-sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('删除会话失败:', error);
    throw error;
  }
}

/**
 * 自动生成聊天会话标题
 * @param {string} sessionId - 会话ID
 * @returns {Promise<string>} 生成的标题
 */
export async function generateChatSessionTitle(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat-sessions/${sessionId}/generate-title`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.title;
  } catch (error) {
    console.error('生成标题失败:', error);
    throw error;
  }
}

/**
 * 导出聊天会话为 Markdown 文件
 * @param {string} sessionId - 会话ID
 */
export async function exportChatSession(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat-sessions/${sessionId}/export`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition');
    console.log('Content-Disposition header:', contentDisposition);
    let filename = 'chat_export.md';
    if (contentDisposition) {
      // 尝试解析 RFC 5987 格式: filename*=UTF-8''encoded_filename
      const rfc5987Match = /filename\*=UTF-8''(.+)/.exec(contentDisposition);
      console.log('RFC 5987 match:', rfc5987Match);
      if (rfc5987Match && rfc5987Match[1]) {
        filename = decodeURIComponent(rfc5987Match[1]);
        console.log('Decoded filename:', filename);
      } else {
        // 尝试解析标准格式: filename="filename"
        const standardMatch = /filename="([^"]+)"/.exec(contentDisposition);
        console.log('Standard match:', standardMatch);
        if (standardMatch && standardMatch[1]) {
          filename = standardMatch[1];
        }
      }
    }
    console.log('Final filename:', filename);

    // 获取文件内容
    const blob = await response.blob();
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('导出失败:', error);
    throw error;
  }
}
