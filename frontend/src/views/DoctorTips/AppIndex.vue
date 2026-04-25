<template>
  <div class="content">
    <div class="summary-top-space">
      <div class="header-flex">
        <h2 class="ai-tips-title">AI 建议</h2>
      </div>
      <div class="main-container">
        <!-- 左侧用户列表 -->
        <div class="left-container">
          <el-table
            :data="patientList"
            stripe
            class="patient-list-table"
            style="width: 100%;"
            @row-click="handleRowClick"
            :row-class-name="getRowClassName"
          >
            <el-table-column
              prop="patient_username"
              label="用户名"
              align="center"
              min-width="120px"
            ></el-table-column>
            <el-table-column
              prop="name"
              label="姓名"
              align="center"
              min-width="100px"
            ></el-table-column>
          </el-table>
        </div>

        <!-- 右侧数据展示区域 -->
        <div class="right-container">
          <div v-if="selectedPatient" class="ai-tips-info">
            <h3>{{ selectedPatient.name }} 的最新建议</h3>

            <!-- 显示最后一条 AI 建议的文本框 -->
            <div class="ai-tip-textarea">
              <textarea
                v-model="editedAiTip"
                rows="6"
                placeholder="这里显示最新的 AI 建议..."
                class="ai-tips-textarea">
              </textarea>
            </div>


            <!-- 按钮区域 -->
            <div class="button-container">
              <el-button @click="regenerateAiTip" type="primary">重新生成</el-button>
              <el-button @click="submitEdit" type="success">提交编辑</el-button>
            </div>
          </div>

          <div v-else class="placeholder">
            请从左侧选择患者查看 AI 建议
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/store/index';
import baseurl from '@/http/base';
import VueMarkdown from 'vue3-markdown-it';

const userStore = useUserStore();
const user = computed(() => userStore.userInfo);

// 数据
const patientList = ref([]);
const selectedPatient = ref(null);
const selectedRowIndex = ref(-1);
const aiTip = ref('');
const editedAiTip = ref('');

// 加载患者列表
onMounted(async () => {
  try {
    const userInfoObj = JSON.parse(user.value);
    const response = await axios.get(`/api/doctor_patient_info?username=${userInfoObj.username}`);
    patientList.value = response.data.data.map(patient => ({
      patient_username: patient.patient_username,
      name: patient.user_info?.name || '未知'
    }));
  } catch (error) {
    console.error('获取患者列表失败:', error);
  }
});

// 获取 AI 建议
const fetchAiTips = async (patientUsername) => {
  try {
    const response = await axios.get(`/api/aiTips?username=${patientUsername}`);
    const tipsList = response.data?.data;
    if (tipsList && tipsList.length > 0) {
      const latestTip = tipsList[tipsList.length - 1].ai_tips;
      aiTip.value = latestTip;
      editedAiTip.value = latestTip;
    } else {
      aiTip.value = '暂无建议';
      editedAiTip.value = '';
    }
  } catch (error) {
    console.error('获取 AI 建议失败:', error);
    aiTip.value = '加载失败，请稍后再试';
  }
};

// 点击患者
const handleRowClick = async (row) => {
  console.log('点击了患者：', row);
  selectedRowIndex.value = patientList.value.indexOf(row);
  selectedPatient.value = row;
  await fetchAiTips(row.patient_username);
};

// 重新生成建议
const regenerateAiTip = async () => {
  if (selectedPatient.value) {
    try {
      const response = await axios.get(`/api/AI?username=${selectedPatient.value.patient_username}`);
      const tipsList = response.data?.data;
      if (tipsList && tipsList.length > 0) {
        const latestTip = tipsList[tipsList.length - 1].ai_tips;
        aiTip.value = latestTip;
        editedAiTip.value = latestTip;
      } else {
        aiTip.value = '没有新的建议';
        editedAiTip.value = '';
      }
    } catch (error) {
      console.error('重新生成失败:', error);
    }
  }
};

// 提交编辑建议
const submitEdit = async () => {
  if (selectedPatient.value && editedAiTip.value !== aiTip.value) {
    try {
      await axios.post(`/api/ai_doctor_tips`, {
        username: selectedPatient.value.patient_username,
        aiTip: editedAiTip.value
      });
      aiTip.value = editedAiTip.value;
      alert('修改后的建议已提交');
    } catch (error) {
      console.error('提交修改失败:', error);
      alert('提交失败，请稍后再试');
    }
  } else {
    alert('没有修改内容');
  }
};

// 高亮行
const getRowClassName = ({ rowIndex }) => {
  return rowIndex === selectedRowIndex.value ? 'highlight-row' : '';
};
</script>

<style scoped>
.content {
  height: 100%;
  padding: 20px 20px;
  background-color: rgb(233, 233, 233);
}

.main-container {
  flex: 1;
  display: flex;
  gap: 20px;
  height: 80%; /* 关键设置 */
}

.left-container {
  flex: 1;
  background-color: white;
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.patient-list-table {
  width: 100%;
}

.right-container {
  flex: 2;
  background-color: white;
  padding: 0px;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.ai-tips-info {
  padding: 10px;
}

.ai-tips-info h3 {
  margin-top: 0;
}

.ai-tip-textarea {
  margin-bottom: 20px;
}

.ai-tips-textarea {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  height: 400px;
}

.scrollable-content {
  max-height: 300px;
  overflow-y: auto;
  font-size: 16px;
}

.button-container {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.el-button {
  flex: 1;
}

.placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
  padding: 20px;
  font-style: italic;
}

:deep(.el-table tr.highlight-row) {
  &,
  &:hover,
  &:active {
    > td {
      background-color: #409eff !important;
      color: white;
    }
  }
}

.summary-top-space {
  padding-top: 20px;
  background-color: var(--el-bg-color);
  box-sizing: border-box;
  border: 1px;
  border-radius: 6px;
  box-shadow: 0 0 12px rgb(0 0 0 / 5%);
  height: 80%;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20pt;
}

.ai-tips-title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 30px;
}
</style>
