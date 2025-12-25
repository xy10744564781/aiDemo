import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { FileTextOutlined } from '@ant-design/icons-vue';

export function useToolboxPanel() {
  const fileList = ref([]);
  const documentList = ref([]);
  const loading = ref(false);

  // 加载文档列表
  async function loadDocuments() {
    loading.value = true;
    try {
      const response = await fetch('/api/documents');
      if (response.ok) {
        documentList.value = await response.json();
      }
    } catch (error) {
      console.error('加载文档列表失败:', error);
      message.error('加载文档列表失败');
    } finally {
      loading.value = false;
    }
  }

  // 处理上传变化
  function handleUploadChange(info) {
    const { status } = info.file;
    if (status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
      loadDocuments();
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  }

  // 删除文档
  async function handleDelete(doc) {
    try {
      const response = await fetch(`/api/documents/${doc.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        message.success('文档删除成功');
        loadDocuments();
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('删除文档失败:', error);
      message.error('删除文档失败');
    }
  }

  // 格式化日期
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  onMounted(() => {
    loadDocuments();
  });

  return {
    // Components
    FileTextOutlined,
    // Refs
    fileList,
    documentList,
    loading,
    // Methods
    loadDocuments,
    handleUploadChange,
    handleDelete,
    formatDate
  };
}
