import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { FileTextOutlined } from '@ant-design/icons-vue';
import { getDocuments, uploadDocument, deleteDocument } from '@/api';

export function useToolboxPanel() {
  const fileList = ref([]);
  const documentList = ref([]);
  const loading = ref(false);

  // 加载文档列表
  async function loadDocuments() {
    loading.value = true;
    try {
      documentList.value = await getDocuments();
    } catch (error) {
      console.error('加载文档列表失败:', error);
      message.error('加载文档列表失败');
    } finally {
      loading.value = false;
    }
  }

  // 处理上传变化
  async function handleUploadChange(info) {
    const { status } = info.file;
    
    if (status === 'uploading') {
      return;
    }
    
    if (status === 'done') {
      message.success(`${info.file.name} 文件上传成功`);
      fileList.value = [];
      loadDocuments();
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败`);
    }
  }

  // 自定义上传请求
  async function customRequest({ file, onSuccess, onError }) {
    try {
      // 确保使用原始文件对象
      const fileToUpload = file.originFileObj || file;
      
      console.log('上传文件信息:', {
        name: fileToUpload.name,
        type: fileToUpload.type,
        size: fileToUpload.size
      });
      
      const result = await uploadDocument(fileToUpload);
      onSuccess(result, file);
    } catch (error) {
      console.error('上传文件时出错:', error);
      onError(error);
    }
  }

  // 删除文档
  async function handleDelete(doc) {
    try {
      await deleteDocument(doc.id);
      message.success('文档删除成功');
      loadDocuments();
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
    customRequest,
    handleDelete,
    formatDate
  };
}
