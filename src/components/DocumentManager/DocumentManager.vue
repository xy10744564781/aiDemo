<template>
  <div class="document-manager">
    <div class="document-header">
      <h2>文档管理</h2>
      <div class="header-actions">
        <a-button 
          type="primary" 
          @click="showUploadModal = true"
          :disabled="!canUpload"
        >
          <UploadOutlined />
          上传文档
        </a-button>
        <a-button @click="refreshDocuments">
          <ReloadOutlined />
          刷新
        </a-button>
      </div>
    </div>

    <!-- 部门文件夹视图 -->
    <div class="folder-view">
      <a-row :gutter="16">
        <a-col 
          v-for="folder in accessibleFolders" 
          :key="folder"
          :xs="24" :sm="12" :md="8" :lg="6"
        >
          <a-card 
            class="folder-card"
            :class="{ active: selectedFolder === folder }"
            @click="selectFolder(folder)"
            hoverable
          >
            <template #cover>
              <div class="folder-icon">
                <FolderOutlined />
              </div>
            </template>
            <a-card-meta 
              :title="folder"
              :description="`${getFolderDocCount(folder)} 个文档`"
            />
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 文档列表 -->
    <div class="document-list" v-if="selectedFolder">
      <div class="list-header">
        <h3>{{ selectedFolder }} - 文档列表</h3>
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索文档..."
          style="width: 300px"
          @search="searchDocuments"
        />
      </div>

      <a-table
        :columns="documentColumns"
        :data-source="filteredDocuments"
        :loading="loading"
        row-key="id"
        :pagination="{ pageSize: 10 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'title'">
            <a-tooltip :title="record.title">
              <span class="document-title">{{ record.title }}</span>
            </a-tooltip>
          </template>
          
          <template v-if="column.key === 'category'">
            <a-tag :color="getCategoryColor(record.category)">
              {{ record.category }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'upload_time'">
            {{ formatDate(record.upload_time) }}
          </template>
          
          <template v-if="column.key === 'actions'">
            <a-space>
              <a-button 
                type="link" 
                size="small"
                @click="viewDocument(record)"
              >
                查看
              </a-button>
              <!-- <a-button 
                type="link" 
                size="small"
                @click="editDocument(record)"
                v-if="canEdit(record)"
              >
                编辑
              </a-button> -->
              <a-popconfirm
                title="确定要删除这个文档吗？"
                @confirm="deleteDocument(record)"
                v-if="canDelete(record)"
              >
                <a-button type="link" size="small" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 上传文档模态框 -->
    <DocumentUploadModal
      v-model="showUploadModal"
      :accessible-folders="accessibleFolders"
      @upload-success="handleUploadSuccess"
    />

    <!-- 文档详情模态框 -->
    <DocumentDetailModal
      v-model="showDetailModal"
      :document="selectedDocument"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { 
  UploadOutlined, 
  ReloadOutlined, 
  FolderOutlined 
} from '@ant-design/icons-vue';
import { getDocuments, deleteDocument as apiDeleteDocument } from '@/api/documentApi';
import { getCurrentUser } from '@/api/authApi';
import DocumentUploadModal from './DocumentUploadModal.vue';
import DocumentDetailModal from './DocumentDetailModal.vue';

export default {
  name: 'DocumentManager',
  components: {
    UploadOutlined,
    ReloadOutlined,
    FolderOutlined,
    DocumentUploadModal,
    DocumentDetailModal
  },
  setup() {
    const loading = ref(false);
    const documents = ref([]);
    const selectedFolder = ref('');
    const searchKeyword = ref('');
    const showUploadModal = ref(false);
    const showDetailModal = ref(false);
    const selectedDocument = ref(null);

    // 用户信息
    const currentUser = ref(getCurrentUser());
    const accessibleFolders = computed(() => 
      currentUser.value?.accessible_folders || ['公共']
    );
    const canUpload = computed(() => 
      currentUser.value?.can_upload || false
    );

    // 表格列定义
    const documentColumns = [
      {
        title: '文档标题',
        dataIndex: 'title',
        key: 'title',
        ellipsis: true,
      },
      {
        title: '分类',
        dataIndex: 'department',
        key: 'department',
        width: 120,
      },
      {
        title: '部门',
        dataIndex: 'department',
        key: 'department',
        width: 100,
      },
      {
        title: '上传时间',
        dataIndex: 'upload_time',
        key: 'upload_time',
        width: 150,
      },
      {
        title: '操作',
        key: 'actions',
        width: 150,
      },
    ];

    // 过滤后的文档列表
    const filteredDocuments = computed(() => {
      let filtered = documents.value;
      
      // 按选中的文件夹过滤
      if (selectedFolder.value) {
        filtered = filtered.filter(doc => 
          doc.department === selectedFolder.value
        );
      }
      
      // 按搜索关键词过滤（标题、分类、文件名）
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        filtered = filtered.filter(doc => {
          const title = (doc.title || '').toLowerCase();
          const category = (doc.category || '').toLowerCase();
          const filename = (doc.filename || doc.source_file || '').toLowerCase();
          
          return title.includes(keyword) || 
                 category.includes(keyword) || 
                 filename.includes(keyword);
        });
      }
      
      return filtered;
    });

    // 获取文件夹文档数量
    const getFolderDocCount = (folder) => {
      return documents.value.filter(doc => doc.department === folder).length;
    };

    // 获取分类颜色
    const getCategoryColor = (category) => {
      const colors = {
        '政策制度': 'blue',
        '流程指南': 'green',
        '培训资料': 'orange',
        '表单模板': 'purple',
        '其他': 'default'
      };
      return colors[category] || 'default';
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleString('zh-CN');
    };

    // 权限检查
    const canEdit = (document) => {
      return canUpload.value && (
        document.uploader === currentUser.value?.username ||
        currentUser.value?.role === 'super_admin'
      );
    };

    const canDelete = (document) => {
      return canUpload.value && (
        document.uploader === currentUser.value?.username ||
        currentUser.value?.role === 'super_admin'
      );
    };

    // 选择文件夹
    const selectFolder = (folder) => {
      selectedFolder.value = folder;
      searchKeyword.value = '';
    };

    // 刷新文档列表
    const refreshDocuments = async () => {
      loading.value = true;
      try {
        const docs = await getDocuments();
        documents.value = docs || [];
        // message.success('文档列表刷新成功');
      } catch (error) {
        console.error('获取文档列表失败:', error);
        message.error('获取文档列表失败');
      } finally {
        loading.value = false;
      }
    };

    // 搜索文档
    const searchDocuments = () => {
      // 搜索逻辑已在 computed 中实现
    };

    // 查看文档详情
    const viewDocument = (document) => {
      selectedDocument.value = document;
      showDetailModal.value = true;
    };

    // 编辑文档
    const editDocument = (doc) => {
      // TODO: 实现编辑功能
      console.log('编辑文档:', doc);
      message.info('编辑功能开发中...');
    };

    // 删除文档
    const deleteDocument = async (doc) => {
      try {
        await apiDeleteDocument(doc.id);
        message.success('文档删除成功');
        refreshDocuments();
      } catch (error) {
        console.error('删除文档失败:', error);
        message.error('删除文档失败');
      }
    };

    // 处理上传成功
    const handleUploadSuccess = () => {
      showUploadModal.value = false;
      refreshDocuments();
    };

    // 初始化
    onMounted(() => {
      refreshDocuments();
      // 默认选择第一个可访问的文件夹
      if (accessibleFolders.value.length > 0) {
        selectedFolder.value = accessibleFolders.value[0];
      }
    });

    return {
      loading,
      documents,
      selectedFolder,
      searchKeyword,
      showUploadModal,
      showDetailModal,
      selectedDocument,
      currentUser,
      accessibleFolders,
      canUpload,
      documentColumns,
      filteredDocuments,
      getFolderDocCount,
      getCategoryColor,
      formatDate,
      canEdit,
      canDelete,
      selectFolder,
      refreshDocuments,
      searchDocuments,
      viewDocument,
      editDocument,
      deleteDocument,
      handleUploadSuccess
    };
  }
};
</script>

<style scoped>
.document-manager {
  padding: 24px;
  background: #fff;
  height: 100%;
  overflow-y: auto;
}

.document-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.document-header h2 {
  margin: 0;
  color: #1890ff;
  font-size: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.folder-view {
  margin-bottom: 24px;
}

.folder-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.folder-card.active {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

.folder-icon {
  padding: 24px;
  font-size: 48px;
  color: #1890ff;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.document-list {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e8e8e8;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h3 {
  margin: 0;
  color: #262626;
  font-size: 16px;
}

.document-title {
  font-weight: 500;
  color: #1890ff;
  cursor: pointer;
}

.document-title:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .document-manager {
    padding: 16px;
  }
  
  .document-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .list-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
}
</style>