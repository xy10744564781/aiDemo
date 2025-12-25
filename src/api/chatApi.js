import { API_BASE_URL, API_ENDPOINTS, DEFAULT_USER_CTX } from './config';

/**
 * 流式查询 API
 * @param {string} question - 用户问题
 * @param {object} userCtx - 用户上下文（可选）
 * @param {function} onContent - 内容回调函数
 * @param {function} onComplete - 完成回调函数
 * @param {function} onError - 错误回调函数
 */
export async function queryStream(question, userCtx = DEFAULT_USER_CTX, callbacks = {}) {
  const { onContent, onComplete, onError } = callbacks;

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.QUERY_STREAM}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        user_ctx: userCtx
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
            
            if (data.type === 'content') {
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
              if (onComplete) {
                onComplete(fullAnswer);
              }
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
