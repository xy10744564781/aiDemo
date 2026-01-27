import { API_BASE_URL, API_ENDPOINTS } from './config';
import { getAuthHeaders } from './authApi';
import { fetchWithAuth } from '../utils/apiInterceptor';

/**
 * 流式查询 API
 * @param {string} question - 用户问题
 * @param {string} sessionId - 会话ID（dev-mix：支持对话历史）
 * @param {object} callbacks - 回调函数对象
 * @param {function} callbacks.onContent - 内容回调函数
 * @param {function} callbacks.onComplete - 完成回调函数
 * @param {function} callbacks.onError - 错误回调函数
 */
export async function queryStream(question, sessionId, callbacks = {}) {
  const { onContent, onComplete, onError, onUserContext } = callbacks;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.QUERY_STREAM}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question,
        session_id: sessionId
        // 注意：不需要传递user_ctx，后端会从JWT token中获取用户信息
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let fullAnswer = '';

    let doneReading = false
    while (!doneReading) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            
            console.log('[Stream] Received event:', data.type, data);
            
            if (data.type === 'start') {
              // 开始处理
              console.log('[Stream] Query started:', data.message);
            } else if (data.type === 'user_context') {
              // 用户上下文信息
              if (onUserContext) {
                onUserContext(data.data);
              }
            } else if (data.type === 'status') {
              // 处理状态更新
              console.log('[Stream] Status update:', data.stage, data.message, `${data.progress}%`);
            } else if (data.type === 'content') {
              // 移除思考过程标签
              let content = data.content;
              if (content.includes('<thinking>')) {
                content = content.replace(/<thinking>.*?<\/thinking>/s, '').trim();
              }
              fullAnswer += content;
              
              // 调试日志
              console.log('[Stream] Received chunk:', content.substring(0, 50), '... length:', content.length);
              console.log('[Stream] Full answer length:', fullAnswer.length);
              
              // 调用内容回调
              if (onContent) {
                onContent(fullAnswer);
              }
            } else if (data.type === 'complete') {
              // 调用完成回调
              console.log('[Stream] Query completed:', data);
              if (onComplete) {
                onComplete(fullAnswer, data);
              }
            } else if (data.type === 'end') {
              // 查询结束
              console.log('[Stream] Query ended:', data.message);
            } else if (data.type === 'error') {
              throw new Error(data.message || '查询处理失败');
            }
          } catch (parseError) {
            console.warn('Failed to parse SSE data:', line, parseError);
          }
        }
      }
    }
  } catch (error) {
    console.error('查询失败:', error);
    if (onError) {
      onError(error);
    }
    throw error;
  }
}
