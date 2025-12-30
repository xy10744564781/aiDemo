/**
 * 消息内容解析工具
 * 用于解析AI回复中的思考过程和详细解答
 */

/**
 * 解析AI回复内容，提取思考过程和详细解答
 * @param {string} text - AI回复的完整文本
 * @returns {object} 解析结果
 */
export function parseAIResponse(text) {
  if (!text) {
    return {
      hasThinkingProcess: false,
      thinkingProcess: '',
      mainContent: text
    };
  }

  // 检测是否包含【问题理解】和【详细解答】标记
  const hasThinkingStart = text.includes('【问题理解】');
  const hasDetailedAnswer = text.includes('【详细解答】');

  if (!hasThinkingStart || !hasDetailedAnswer) {
    // 如果没有这些标记，直接返回原文
    return {
      hasThinkingProcess: false,
      thinkingProcess: '',
      mainContent: text
    };
  }

  // 提取思考过程（从【问题理解】到【详细解答】之间的内容）
  const thinkingStartIndex = text.indexOf('【问题理解】');
  const detailedAnswerIndex = text.indexOf('【详细解答】');

  const thinkingProcess = text.substring(thinkingStartIndex, detailedAnswerIndex).trim();

  // 提取详细解答内容（【详细解答】之后的内容，但不包括【详细解答】标题本身）
  let mainContent = text.substring(detailedAnswerIndex).trim();
  
  // 移除【详细解答】标题
  mainContent = mainContent.replace(/^【详细解答】\s*/, '').trim();

  return {
    hasThinkingProcess: true,
    thinkingProcess: thinkingProcess,
    mainContent: mainContent
  };
}
