<template>
  <div class="toolbox-panel">
    <div class="toolbox-content">
      <!-- 上传区域 -->
      <div class="upload-section">
        <a-typography-title :level="5" style="margin-bottom: 16px;">
          上传文档
        </a-typography-title>
        <a-upload-dragger class="uploader"
          v-model:fileList="fileList"
          name="file"
          :multiple="true"
          action="/api/upload-document"
          @change="handleUploadChange"
          accept=".pdf,.docx,.doc,.txt,.md"
        >
          <p class="upload-icon">📁</p>
          <p class="upload-text">选择文件或拖拽到此处</p>
          <p class="upload-hint">支持 PDF、Word、文本文件</p>
        </a-upload-dragger>
      </div>

      <!-- 文档列表 -->
      <div class="file-list-section">
        <a-typography-title :level="5" style="margin-bottom: 16px;">
          文档列表
        </a-typography-title>

        <a-list
          :data-source="documentList"
          :loading="loading"
          size="small"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <template #actions>
                <a-button type="text" size="small" danger @click="handleDelete(item)">
                  删除
                </a-button>
              </template>
              <a-list-item-meta>
                <template #avatar>
                  <FileTextOutlined style="font-size: 20px;" />
                </template>
                <template #title>
                  {{ item.title }}
                </template>
                <template #description>
                  <a-space>
                    <a-tag>{{ item.category }}</a-tag>
                    <span style="color: #999; font-size: 12px;">
                      {{ formatDate(item.upload_time) }}
                    </span>
                  </a-space>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToolboxPanel } from './ToolboxPanel.js';
import './ToolboxPanel.css';

const {
  FileTextOutlined,
  fileList,
  documentList,
  loading,
  handleUploadChange,
  handleDelete,
  formatDate
} = useToolboxPanel();
</script>
