/**
 * Markdown 渲染工具
 * 使用 markdown-it 将 Markdown 文本转换为 HTML
 */
import MarkdownIt from 'markdown-it';

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: false,        // 禁用 HTML 标签（安全性）
  linkify: true,      // 自动将 URL 转换为链接
  typographer: true,  // 启用智能引号和其他排版优化
  breaks: true,       // 将换行符转换为 <br>
});

/**
 * 将 Markdown 文本渲染为 HTML
 * @param {string} markdown - Markdown 文本
 * @returns {string} 渲染后的 HTML
 */
export function renderMarkdown(markdown) {
  if (!markdown) return '';
  
  try {
    return md.render(markdown);
  } catch (error) {
    console.error('Markdown 渲染失败:', error);
    return markdown; // 降级：返回原始文本
  }
}

/**
 * 将 Markdown 文本渲染为纯文本（去除所有格式）
 * @param {string} markdown - Markdown 文本
 * @returns {string} 纯文本
 */
export function markdownToPlainText(markdown) {
  if (!markdown) return '';
  
  try {
    const html = md.render(markdown);
    // 移除 HTML 标签
    return html.replace(/<[^>]*>/g, '');
  } catch (error) {
    console.error('Markdown 转换失败:', error);
    return markdown;
  }
}

export default md;
