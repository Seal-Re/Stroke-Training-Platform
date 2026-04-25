<template>
  <div class="content">
    <div class="summary-top-space">
      <div class="ai-tips-page">
        <div class="page-container">
          <!-- 标题区域 -->
          <div class="header-flex">
            <h2 class="ai-tips-title">AI 建议：</h2>
          </div>
          <!-- 主要内容 -->
          <div class="main-content-container">
            <el-row class="main-content" :gutter="20">
              <!-- 建议容器 -->
              <el-col :span="18">
                <el-card v-if="aiTips.length > 0" class="tips-box common-box">
                  <template #header>
                    <h3 class="tips-text">AI 给出的建议如下</h3>
                  </template>
                  <div class="tips-content scrollable-content">
                    <vue-markdown v-if="aiTips.length > 0" :source="aiTips[aiTips.length - 1].ai_tips"></vue-markdown>
                  </div>
                </el-card>
                <!-- 如果没有建议内容，显示提示 -->
                <el-card v-else-if="!isLoading && !aiTipsFound" class="tips-box common-box">
                  <template #header>
                    <h3 class="tips-text">AI 给出的建议如下</h3>
                  </template>
                  <div class="tips-content">
                    暂无建议内容。
                  </div>
                </el-card>
                <!-- 加载中显示 -->
                <div v-else v-show="isLoading">加载中...</div>
              </el-col>
              <!-- 侧边栏 -->
              <el-col :span="6">
                <el-card class="side-bar common-box">
                  <!-- 侧边栏标题 -->
                  <template #header>
                    <div class="header-list">
                      <h3>信息</h3>
                    </div>
                  </template>
                  <!-- 答题信息 -->
                  <div class="answer-info">
                    <p>用户: {{ user }}</p>
                    <p v-if="userName">姓名: {{ userName }}</p> <!-- 添加姓名展示 -->
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <!-- 尾部固定区域 -->

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/store/index';
import router from '@/router/index';
import baseurl from '@/http/base';
import VueMarkdown from 'vue3-markdown-it';

const userStore = useUserStore();
const user = computed(() => {
  try {
    const userInfoObj = JSON.parse(userStore.userInfo);
    return userInfoObj.username || '未登录用户';
  } catch (error) {
    return '未登录用户';
  }
});
const aiTips = ref([]);      // 存储 AI 建议
const isLoading = ref(true); // 控制 loading
const aiTipsFound = ref(true); // 控制是否找到建议
const userName = ref('');    // 用户姓名

onMounted(async () => {
  try {
    // 获取 AI 建议
    const response = await axios.get(`/api/aiTips?username=${user.value}`);
    if (response.data.found) {
      // 如果 found 为 true，表示找到数据
      aiTips.value = response.data.data;
      aiTipsFound.value = true; // 标记为找到数据
    } else {
      // 如果 found 为 false，表示没有找到数据
      aiTips.value = [];
      aiTipsFound.value = false; // 标记为没有找到数据
    }
  } catch (error) {
    console.error('获取 AI 建议失败:', error);
    aiTipsFound.value = false; // 网络错误或其他问题时标记为没有找到数据
  }

  // 获取用户信息
  try {
    const userInfoResponse = await axios.get(`/api/userinfo_get?user=${user.value}`);
    if (userInfoResponse.data.user_info) {
      userName.value = userInfoResponse.data.user_info.name || '';
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }

  // 结束加载
  isLoading.value = false;
});


</script>

<style scoped>

.ai-tips-page {
  background-color: #ffffff;
}

.ai-tips-title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 30px;
}

.tips-text {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.common-box {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tips-box {
  height: 90%;
  width: 100%;
  max-width: 100%;
  padding: 20px;
  box-sizing: border-box;
  margin-top: 20px;
  margin-left: 30px;
}

.tips-content {
  font-size: 16px;
  line-height: 1.6;
}

.scrollable-content {
  max-height: 500px;
  overflow-y: auto;
}

.side-bar {
  height:40%;
  width:85%;
  padding: 20px;
  margin-bottom: 20px;
  margin-left:10%;
  box-sizing: border-box;
}

.answer-info {
  border-top: 1px solid #ffffff;
  padding-top: 20px;
}

.button-container {
  margin-top: 20px;
}

.big-button {
  font-size: 18px;
  padding: 20px 24px;
  width: 100%;
  height: 60px;
}


.footer-text {
  text-align: center;
}

.header-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height:20px;
}

.content {
  height: 100%;
  padding: 20px 20px;
  background-color: rgb(233, 233, 233);
}

.summary-top-space {
  padding-top: 20px;
  background-color: var(--el-bg-color);
  box-sizing: border-box;
  border: 1px;
  border-radius: 6px;
  box-shadow: 0 0 12px rgb(0 0 0 / 5%);
  /* 修改顶部外边距 */
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height:20pt;
}

</style>
