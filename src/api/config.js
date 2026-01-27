// API 基础配置
// 从环境变量读取 API 地址，如果没有则使用默认值
export const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://192.168.100.20:8004';

// 默认用户上下文
export const DEFAULT_USER_CTX = {
  department: '人事',
  user_role: 'hr_staff',
  user_id: 'web_user'
};

// API 端点
export const API_ENDPOINTS = {
  QUERY_STREAM: '/api/query-stream',
  UPLOAD_DOCUMENT: '/api/upload-document',
  DOCUMENTS: '/api/documents',
  DELETE_DOCUMENT: (id) => `/api/documents/${id}`
};

// 打印当前 API 配置（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
}
