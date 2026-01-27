<template>
  <a-modal
    v-model:open="visible"
    title="上传文档"
    :width="600"
    :confirm-loading="uploading"
    @ok="handleUpload"
    @cancel="handleCancel"
  >
    <a-form
      :model="formData"
      layout="vertical"
    >
      <a-form-item label="选择文件">
        <a-upload
          :file-list="fileList"
          :before-upload="beforeUpload"
          :remove="handleRemove"
          accept=".pdf,.doc,.docx,.txt,.md,.xlsx,.xls"
          :max-count="1"
        >
          <a-button>
            <UploadOutlined />
            选择文件
          </a-button>
        </a-upload>
        <div class="upload-tips">
          支持格式：PDF、Word、Excel、文本文件，最大 50MB
        </div>
      </a-form-item>

      <a-form-item label="所属部门">
        <a-select
          v-model:value="formData.department"
          placeholder="请选择部门"
          :options="departmentOptions"
        />
      </a-form-item>

      <a-form-item label="文档描述">
        <a-textarea
          v-model="formData.description"
          placeholder="请输入文档描述（可选）"
          :rows="3"
          :max-length="500"
          show-count
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button
        type="primary"
        :loading="uploading"
        @click="handleUpload"
        :disabled="!selectedFile"
      >
        {{ uploading ? '上传中...' : '上传' }}
      </a-button>
    </template>
  </a-modal>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { uploadDocument } from '@/api/documentApi';
import { getCurrentUser } from '@/api/authApi';

export default {
  name: 'DocumentUploadModal',
  components: {
    UploadOutlined
  },
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    accessibleFolders: {
      type: Array,
      default: () => ['公共']
    }
  },
  emits: ['update:modelValue', 'upload-success'],
  setup(props, { emit }) {
    const uploading = ref(false);
    const fileList = ref([]);
    const selectedFile = ref(null);

    // 表单数据
    const formData = ref({
      department: '',
      description: ''
    });

    // 部门选项
    const departmentOptions = computed(() => 
      props.accessibleFolders.map(folder => ({
        label: folder,
        value: folder
      }))
    );

    // 控制模态框显示
    const visible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });

    // 监听模态框打开，初始化表单
    watch(visible, (newVisible) => {
      if (newVisible) {
        resetForm();
        // 不设置默认值，强制用户手动选择部门
      }
    });

    // 文件上传前的处理
    const beforeUpload = (file) => {
      // 检查文件扩展名（更可靠）
      const fileName = file.name.toLowerCase();
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.md', '.xlsx', '.xls'];
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      if (!hasValidExtension) {
        message.error('不支持的文件格式！请上传PDF、Word、Excel或文本文件。');
        return false;
      }

      // 检查文件大小（50MB）
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        message.error('文件大小不能超过50MB！');
        return false;
      }

      // 保存文件
      selectedFile.value = file;
      
      // 更新文件列表显示
      fileList.value = [{
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: ''
      }];

      return false; // 阻止自动上传
    };

    // 移除文件
    const handleRemove = () => {
      selectedFile.value = null;
      fileList.value = [];
      return true;
    };

    // 重置表单
    const resetForm = () => {
      formData.value = {
        department: '',
        description: ''
      };
      fileList.value = [];
      selectedFile.value = null;
    };

    // 处理上传
    const handleUpload = async () => {
      if (!selectedFile.value) {
        message.error('请先选择要上传的文件');
        return;
      }

      if (!formData.value.department) {
        message.error('请选择所属部门');
        return;
      }

      try {
        uploading.value = true;

        // 获取当前用户信息
        const currentUser = getCurrentUser();
        const userCtx = {
          user_id: currentUser?.id || 'anonymous',
          department: formData.value.department,
          user_role: currentUser?.role || 'employee'
        };

        // 使用文件名作为标题（去掉扩展名）
        const fileNameWithoutExt = selectedFile.value.name.replace(/\.[^/.]+$/, '');

        // 准备上传数据（简化版）
        const metadata = {
          title: fileNameWithoutExt,
          category: formData.value.department,  // 使用选择的部门作为分类
          access_level: '部门内部',  // 默认权限
          description: formData.value.description
        };

        console.log('上传数据 - department:', formData.value.department);
        console.log('上传数据 - metadata:', metadata);

        // 调用上传API
        const result = await uploadDocument(selectedFile.value, metadata, userCtx);
        
        message.success('文档上传成功！');
        emit('upload-success', result);
        visible.value = false;
        
      } catch (error) {
        console.error('上传失败:', error);
        if (error.message.includes('已存在')) {
          message.error('文档标题已存在，请使用不同的标题');
        } else {
          message.error(`上传失败: ${error.message}`);
        }
      } finally {
        uploading.value = false;
      }
    };

    // 处理取消
    const handleCancel = () => {
      visible.value = false;
    };

    return {
      uploading,
      fileList,
      selectedFile,
      formData,
      departmentOptions,
      visible,
      beforeUpload,
      handleRemove,
      handleUpload,
      handleCancel
    };
  }
};
</script>

<style scoped>
.upload-tips {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}
</style>