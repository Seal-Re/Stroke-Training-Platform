<template>
  <div class="page-container">
    <!-- 头部固定区域，显示评估结果标题和用户信息 -->
    <div class="fixed-header">
      <div class="header-content">
        <div class="title">评估结果</div>
        <div class="user-info">
          <span>当前登录用户：</span>{{ user }}
        </div>
      </div>
    </div>

    <!-- 主要内容区域，显示得分和操作按钮 -->
    <div class="main-content-container">
      <div class="result-box">
        <!-- 显示得分 -->
        <h1 class="score-text">{{ score }}分</h1>
        <!-- 查看题目详情按钮 -->
        <el-button type="primary" class="result-button" @click="showQuestionDetails">
          查看题目详情
        </el-button>
        <!-- 返回主页按钮 -->
        <el-button type="primary" class="result-button" @click="goBackHome">
          返回主页
        </el-button>
      </div>
    </div>

    <!-- 尾部固定区域，显示版权信息 -->
    <div class="fixed-footer">
      <div class="footer-text">版权所有 © ???</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import router from '@/router/index';
import axios from 'axios';

const userStore = useUserStore();

// 登录用户，使用计算属性获取用户信息中的用户名，若未登录则显示“未登录用户”
const user = computed(() => userStore.userInfo?.username || '未登录用户');
// 假设得分从其他地方获取，这里先简单定义为一个 ref
const score = ref('');

// 查看题目详情方法，可按需实现具体逻辑
const showQuestionDetails = () => {
  console.log('查看题目详情逻辑');
};

// 返回主页方法
const goBackHome = () => {
  router.push('/home');
};

onMounted(async () => {
  try {
    const username = user.value;
    if (username!== '未登录用户') {
      const response = await axios.get(`http://localhost:5000/api/getLastScore?username=${username}`);
      score.value = response.data.score;
    } else {
      score.value = 0;
    }
  } catch (error) {
    console.error('获取分数失败:', error);
    score.value = 0;
  }
});
</script>

<style scoped lang="less">
// 全局样式重置
html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

// 页面容器样式
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
}

// 头部固定区域样式
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 30px;

    .title {
      font-size: 28px;
      font-weight: 600;
      color: #2c3e50;
    }

    .user-info {
      display: flex;
      align-items: center;
      font-size: 16px;
      color: #666;

      span {
        margin-right: 5px;
      }

      .info-tip {
        cursor: pointer;
        color: #3498db;
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}

// 主要内容容器样式
.main-content-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 100px;
  background-color: #f4f4f4;

  .result-box {
    background-color: #fff;
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    padding: 60px 40px;
    text-align: center;

    .score-text {
      font-size: 60px;
      font-weight: 700;
      color: #3498db;
      margin-bottom: 40px;
    }

    .result-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 240px;
      height: 50px;
      margin: 20px auto;
      font-size: 18px;
      border-radius: 8px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #2980b9;
      }
    }
  }
}

// 尾部固定区域样式
.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #f9f9f9;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #888;

  .footer-text {
    text-align: center;
  }
}
</style>
