<template>
  <a-modal
    v-model:open="visible"
    title="文档详情"
    :width="800"
    :footer="null"
  >
    <div v-if="document" class="document-detail">
      <!-- 文档基本信息 -->
      <a-descriptions
        title="基本信息"
        :column="2"
        bordered
        size="small"
      >
        <a-descriptions-item label="文档标题" :span="2">
          <a-typography-title :level="4" style="margin: 0;">
            {{ document.title }}
          </a-typography-title>
        </a-descriptions-item>
        
        <a-descriptions-item label="文档分类">
          <a-tag :color="getCategoryColor(document.department)">
            {{ document.department }}
          </a-tag>
        </a-descriptions-item>
        
        <a-descriptions-item label="所属部门">
          <a-tag color="blue">
            {{ document.department }}
          </a-tag>
        </a-descriptions-item>
        
        <a-descriptions-item label="访问权限">
          <a-tag :color="getAccessLevelColor(document.access_level)">
            {{ document.access_level }}
          </a-tag>
        </a-descriptions-item>
        
        <a-descriptions-item label="文件名">
          {{ document.filename || document.source_file }}
        </a-descriptions-item>
        
        <a-descriptions-item label="上传时间">
          {{ formatDate(document.upload_time) }}
        </a-descriptions-item>
        
        <a-descriptions-item label="上传者">
          {{ document.uploader }}
        </a-descriptions-item>
        
        <a-descriptions-item label="文档块数">
          {{ document.chunks_count || document.total_chunks || 0 }}
        </a-descriptions-item>
        
        <a-descriptions-item label="文档ID" :span="2">
          <a-typography-text code copyable>
            {{ document.id || document.document_id }}
          </a-typography-text>
        </a-descriptions-item>
      </a-descriptions>

      <!-- 文档描述 -->
      <div v-if="document.description" class="document-description">
        <a-divider orientation="left">文档描述</a-divider>
        <a-typography-paragraph>
          {{ document.description }}
        </a-typography-paragraph>
      </div>

      <!-- 文档内容预览 -->
      <div v-if="document.first_chunk || document.content" class="document-preview">
        <a-divider orientation="left">内容预览</a-divider>
        <a-typography-paragraph>
          <pre class="content-preview">{{ document.first_chunk || document.content }}</pre>
        </a-typography-paragraph>
      </div>


    </div>

    <div v-else class="no-document">
      <a-empty description="未选择文档" />
    </div>
  </a-modal>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'DocumentDetailModal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    document: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // 控制模态框显示
    const visible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });

    // 获取分类颜色
    const getCategoryColor = (category) => {
      const colors = {
        '政策制度': 'blue',
        '流程指南': 'green',
        '培训资料': 'orange',
        '表单模板': 'purple',
        '通知公告': 'cyan',
        '其他': 'default'
      };
      return colors[category] || 'default';
    };

    // 获取访问权限颜色
    const getAccessLevelColor = (accessLevel) => {
      const colors = {
        '全员': 'green',
        '部门内部': 'blue',
        '管理层': 'orange',
        '机密': 'red'
      };
      return colors[accessLevel] || 'default';
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      try {
        return new Date(dateString).toLocaleString('zh-CN');
      } catch (error) {
        return dateString;
      }
    };

    return {
      visible,
      getCategoryColor,
      getAccessLevelColor,
      formatDate
    };
  }
};
</script>

<style scoped>
.document-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.document-description {
  margin-top: 24px;
}

.document-preview {
  margin-top: 24px;
}

.content-preview {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.document-actions {
  margin-top: 24px;
}

.no-document {
  text-align: center;
  padding: 40px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .document-detail {
    max-height: 60vh;
  }
  
  .content-preview {
    font-size: 11px;
    max-height: 150px;
  }
}
</style>