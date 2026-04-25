<template>
  <div class="content">
    <!-- 按钮选择部分 -->
    <div v-if="showButtonGroup">
      <div class="button-group-container">
        <el-button type="primary" @click="fetchQuestions('MMSE')">MMSE</el-button>
        <el-button type="primary" @click="fetchQuestions('MoCA')">MoCA</el-button>
        <el-button type="primary" @click="fetchQuestions('BABRI')">BABRI</el-button>
        <el-button type="primary" @click="fetchQuestions('Evaluate')">医患评估</el-button>
      </div>
    </div>
    <!-- 答题部分 -->
    <div v-else>
      <div class="summary-top-space">
        <!-- 答题中页面 -->
        <div v-if="Flag === 0">
          <div class="page-container">
            <div class="header-flex">
              <h2 class="patieny-summary-title">认知评估测试：</h2>
            </div>
            <div class="main-content-container">
              <el-row class="main-content" :gutter="20">
                <!-- 题目展示区域 -->
                <el-col :span="18">
                  <el-card v-if="currentPageQuestionList.length > 0" class="question-box">
                    <template #header>
                      <h3 class="question-text">
                        {{ currentQuestion.题目类别 }}
                      </h3>
                      <h3 class="question-text">
                        {{ currentQuestion.题目 }}
                      </h3>
                    </template>
                    <div class="operation-guide">
                      <p>操作指南：{{ currentQuestion.操作指南 }}</p>
                    </div>
                    <div class="score-input-container">
                      <el-input v-model="currentScoreInput" placeholder="请输入分数" />
                    </div>
                  </el-card>
                  <div v-else v-show="!isLoading">加载中...</div>
                </el-col>
                <!-- 侧边栏区域 -->
                <el-col :span="6">
                  <el-card v-if="currentPageQuestionList.length > 0" class="side-bar">
                    <template #header>
                      <div class="header-list">
                        <h3>题目列表</h3>
                      </div>
                    </template>
                    <div class="question-list">
                      <div
                        v-for="(item, index) in currentPageQuestionList"
                        :key="index"
                        class="question-number"
                        :class="{ 'has-score': hasScore(currentPageIndex * 12 + index) }"
                        @click="changeCurrentQuestion(currentPageIndex * 12 + index)"
                      >
                        {{ currentPageIndex * 12 + index + 1 }}
                      </div>
                    </div>
                    <div class="page-navigation">
                      <el-button type="primary" class="button-union" @click="prevPage">上一页</el-button>
                      <el-button type="primary" class="button-union" @click="nextPage">下一页</el-button>
                    </div>
                    <div class="answer-info">
                      <p>答题时间：{{ getFormattedTime() }}</p>
                      <p>当前得分：{{ score }}</p>
                    </div>
                  </el-card>
                  <div v-else v-show="!isLoading">加载中...</div>
                  <el-row v-if="currentPageQuestionList.length > 0" class="button-container" justify="center">
                    <el-col>
                      <el-button
                        type="primary"
                        :disabled="false"
                        @click="currentIndex === currentPageQuestionList.length - 1 && isLastPage()? submitAnswers() : nextQuestion()"
                        class="big-button"
                      >
                        {{ currentIndex === currentPageQuestionList.length - 1 && isLastPage()? '提交' : '下一题' }}
                      </el-button>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
        <!-- 结果展示页面 -->
        <div v-else-if="Flag === 1">
          <div class="page-container result-page">
            <div class="main-content-container result-main-content">
              <div class="result-box">
                <div class="score-chart-container">
                  <div class="score-section">
                    <h1 class="score-text">{{ score_view }}分</h1>
                  </div>
                  <div class="chart-section">
                    <div id="chart-container"></div>
                  </div>
                </div>
                <el-button type="primary" class="result-button" @click="goBackHome">返回主页</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import axios from 'axios';
import { useUserStore, useQuestionStore } from '@/store/index';
import router from '@/router/index';
import baseurl from '@/http/base';
import * as echarts from 'echarts';

const userStore = useUserStore();
const questionStore = useQuestionStore();
// 登录用户信息
const user = computed(() => {
  try {
    const userInfoObj = JSON.parse(userStore.userInfo);
    return userInfoObj.username || '未登录用户';
  } catch (error) {
    return '未登录用户';
  }
});
// 题目列表
const questionList = ref([]);
// 当前题目索引
const currentIndex = ref(0);
// 当前页码索引
const currentPageIndex = ref(0);
// 当前页的题目列表
const currentPageQuestionList = computed(() => {
  const startIndex = currentPageIndex.value * 12;
  const endIndex = startIndex + 12;
  return questionList.value.slice(startIndex, endIndex);
});
// 当前题目
const currentQuestion = computed(() => {
  return currentPageQuestionList.value[currentIndex.value] || {};
});
// 输入的分数
const currentScoreInput = ref('');
// 答题开始时间
const startTime = ref(new Date());
// 得分
const score = ref(0);
const score_view = ref(0);
// 记录每道题的作答情况
const answerRecords = ref([]);
// 加载状态
const isLoading = ref(true);
// 控制是否显示按钮组
const showButtonGroup = ref(true);
// Flag 用于控制页面显示答题中还是结果页
const Flag = ref(0);
// 每种类型题目的总分
const categoryTotalScores = ref({});
// 每种类型题目的得分
const categoryScores = ref({});
// 题目所属的表
const currentTable = ref('');

// 返回主页方法
const goBackHome = () => {
  router.push('/home');
  questionStore.resetState();
  showButtonGroup.value = true;
  questionList.value = [];
  currentIndex.value = 0;
  currentPageIndex.value = 0;
  score.value = 0;
  score_view.value = 0;
  answerRecords.value = [];
  categoryTotalScores.value = {};
  categoryScores.value = {};
  Flag.value = 0;
};

// 获取格式化后的答题时间
const getFormattedTime = () => {
  const now = new Date();
  const diff = now - startTime.value;
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// 判断是否是最后一页
const isLastPage = () => {
  const totalPages = Math.ceil(questionList.value.length / 12);
  return currentPageIndex.value === totalPages - 1;
};

// 下一题方法
const nextQuestion = () => {
  console.log('进入 nextQuestion 方法');
  console.log('当前 currentIndex:', currentIndex.value);
  console.log('当前 currentPageQuestionList.length:', currentPageQuestionList.value.length);
  if (currentPageQuestionList.value.length > 0) {
    const scoreValue = parseInt(currentScoreInput.value, 10);
    if (!isNaN(scoreValue) && scoreValue > 0) {
      score.value += scoreValue;
      answerRecords.value.push({
        category: currentQuestion.value.题目类别,
        question: currentQuestion.value.题目,
        operationGuide: currentQuestion.value.操作指南,
        score: scoreValue
      });
      // 更新每种类型题目的得分
      if (!categoryScores.value[currentQuestion.value.题目类别]) {
        categoryScores.value[currentQuestion.value.题目类别] = 0;
      }
      categoryScores.value[currentQuestion.value.题目类别] += scoreValue;
    }
    // 更新每种类型题目的总分
    if (!categoryTotalScores.value[currentQuestion.value.题目类别]) {
      categoryTotalScores.value[currentQuestion.value.题目类别] = 0;
    }
    categoryTotalScores.value[currentQuestion.value.题目类别] += parseInt(currentQuestion.value.总分 || 1, 10);

    if (currentIndex.value < currentPageQuestionList.value.length - 1) {
      currentIndex.value++;
      console.log('currentIndex 自增后的值:', currentIndex.value);
    } else {
      if (!isLastPage()) {
        currentPageIndex.value++;
        currentIndex.value = 0;
        console.log('切换到下一页，currentPageIndex:', currentPageIndex.value, 'currentIndex:', currentIndex.value);
      }
    }
    currentScoreInput.value = '';
    questionStore.setAnswerRecords(answerRecords.value);
    questionStore.setCurrentIndex(currentIndex.value);
    questionStore.setCurrentPageIndex(currentPageIndex.value);
  }
};

// 提交答案方法
const submitAnswers = async () => {
  console.log('进入 submitAnswers 方法');
  console.log('当前 currentPageQuestionList 内容:', currentPageQuestionList.value);
  const pageLength = currentPageQuestionList.value.length;
  console.log('currentPageQuestionList.length:', pageLength);
  console.log('currentIndex:', currentIndex.value);
  console.log('isLastPage:', isLastPage());

  const condition1 = pageLength > 0;
  const condition2 = currentIndex.value === pageLength - 1;
  const condition3 = isLastPage();

  console.log('条件1（currentPageQuestionList.length > 0）:', condition1);
  console.log('条件2（currentIndex.value === currentPageQuestionList.length - 1）:', condition2);
  console.log('条件3（isLastPage()）:', condition3);

  if (condition1 && condition2 && condition3) {
    const scoreValue = parseInt(currentScoreInput.value, 10);
    console.log('输入的分数:', scoreValue);
    if (!isNaN(scoreValue) && scoreValue > 0) {
      score.value += scoreValue;
      answerRecords.value.push({
        category: currentQuestion.value.题目类别,
        question: currentQuestion.value.题目,
        operationGuide: currentQuestion.value.操作指南,
        score: scoreValue
      });
      // 更新每种类型题目的得分
      if (!categoryScores.value[currentQuestion.value.题目类别]) {
        categoryScores.value[currentQuestion.value.题目类别] = 0;
      }
      categoryScores.value[currentQuestion.value.题目类别] += scoreValue;
    }
    // 更新每种类型题目的总分
    if (!categoryTotalScores.value[currentQuestion.value.题目类别]) {
      categoryTotalScores.value[currentQuestion.value.题目类别] = 0;
    }
    categoryTotalScores.value[currentQuestion.value.题目类别] += parseInt(currentQuestion.value.总分 || 1, 10);

    try {
      const submissionData = {
        user: user.value,
        table: currentTable.value,
        totalScore: score.value,
        categoryScores: categoryScores.value,
        data: [
          {
            answerRecords: answerRecords.value,
            score: score.value,
            date: new Date().toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          }
        ]
      };
      axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
      console.log('准备发送提交请求，数据:', submissionData);
      const response = await axios.post('/api/submit', submissionData);
      console.log('数据提交成功:', response.data);
    } catch (error) {
      console.error('答案提交失败:', error);
    }
    score_view.value = score.value;
    score.value = 0;
    Flag.value = 1;
    console.log('Flag 更新为:', Flag.value);
    questionStore.resetState();
    // 使用 nextTick 确保页面更新后再绘制图表
    await nextTick(() => {
      console.log('进入 nextTick，准备绘制图表');
      drawChart();
    });
  } else {
    console.log('不满足提交条件');
  }
};

// 点击题目列表序号改变当前题目
const changeCurrentQuestion = (index) => {
  currentPageIndex.value = Math.floor(index / 12);
  currentIndex.value = index % 12;
  console.log('点击题目列表，currentPageIndex:', currentPageIndex.value, 'currentIndex:', currentIndex.value);
};

// 上一页方法
const prevPage = () => {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--;
    currentIndex.value = 0;
    questionStore.setCurrentPageIndex(currentPageIndex.value);
    questionStore.setCurrentIndex(currentIndex.value);
    console.log('切换到上一页，currentPageIndex:', currentPageIndex.value, 'currentIndex:', currentIndex.value);
  }
};

// 下一页方法
const nextPage = () => {
  if (!isLastPage()) {
    currentPageIndex.value++;
    currentIndex.value = 0;
    questionStore.setCurrentPageIndex(currentPageIndex.value);
    questionStore.setCurrentIndex(currentIndex.value);
    console.log('切换到下一页，currentPageIndex:', currentPageIndex.value, 'currentIndex:', currentIndex.value);
  }
};

// 获取题目数据方法
const fetchQuestions = async (classValue) => {
  try {
    showButtonGroup.value = false;
    currentTable.value = classValue;
    const response = await axios.get(`/api/questions?class=${classValue}`);
    questionList.value = response.data;
    answerRecords.value = [];
    categoryTotalScores.value = {};
    categoryScores.value = {};
    questionStore.setQuestionList(questionList.value);
    isLoading.value = false;
  } catch (error) {
    console.error('获取题目数据失败:', error);
    isLoading.value = false;
  }
};

// 判断题目是否已经有分数
const hasScore = (index) => {
  const question = currentPageQuestionList.value[index % 12];
  const questionText = question.题目;
  return answerRecords.value.some(record => {
    return record.question === questionText && record.score > 0;
  });
};

// 绘制柱状图
const drawChart = () => {
  console.log('进入 drawChart 方法');
  const categories = Object.keys(categoryScores.value);
  const scores = categories.map(category => categoryScores.value[category]);

  const chartDom = document.getElementById('chart-container');
  if (chartDom) {
    console.log('找到图表容器，准备初始化图表');
    const myChart = echarts.init(chartDom);
    const option = {
      xAxis: {
        type: 'category',
        data: categories
      },
      yAxis: {
        type: 'value',
        name: '得分'
      },
      series: [
        {
          data: scores,
          type: 'bar'
        }
      ]
    };

    myChart.setOption(option);
    console.log('图表绘制完成');
  } else {
    console.error('未找到图表容器 #chart-container');
  }
};

onMounted(async () => {
  const htmlElement = document.documentElement;
  htmlElement.lang = 'zh';
  htmlElement.style.height = '95%';
});
</script>

<style scoped>
/* 样式部分保持不变 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.main-content {
  width: 100%;
  max-width: 100%;
}

.main-content-container {
  flex: 1;
  padding: 30px 20px 80px; /* 减少顶部 padding，增加底部 padding */
  margin-right: 0; /* 修改为 0，避免额外的右边距 */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 顶部对齐 */
  overflow-x: hidden; /* 防止水平溢出 */
}

.question-box {
  height: 100%;
  width: 100%;
  max-width: 100%;
  padding: 20px;
  box-sizing: border-box;
  margin-left: 0;
}

.side-bar {
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.question-list {
  margin-bottom: 20px;
  height: 105px;
}

.question-number {
  cursor: pointer;
  margin: 5px;
  display: inline-block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 50%;
  transition: all 0.3s;
}

.question-number.has-score {
  background-color: green;
  color: white;
}

.question-number:hover {
  background-color: #f0f0f0;
}

.answer-info {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.button-container {
  margin-top: 20px;
}

.big-button {
  font-size: 18px; /* 增大字体大小 */
  padding: 20px 24px; /* 增大上下内边距以放大高度 */
  width: 100%; /* 使按钮宽度填满父容器 */
  height: 60px;
  background-color : #007bff;
}

.custom-radio-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中 */
  align-items: center; /* 水平居中 */
  gap: 20px; /* 选项间距 */
}

.custom-radio {
  width: 80%; /* 控制选项宽度 */
  margin: 0 !important; /* 清除默认边距 */
  padding: 15px 20px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.custom-radio:hover {
  background-color: #f5f7fa;
}

.custom-radio .el-radio__input {
  margin-right: 12px;
}

.custom-radio .el-radio__label {
  font-size: 16px;
  vertical-align: middle;
}

/* 正确答案样式 */
.correct-answer {
  background-color: green;
  color: white;
}

/* 错误答案样式 */
.wrong-answer {
  background-color: red;
  color: white;
}

.footer-text {
  text-align: center;
}
/* 页面二样式 */
.result-page {
  background-color: transparent; /* 修改为透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.result-main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  margin-right: 0; /* 修改为 0，避免额外的右边距 */
}

.result-box {
  background-color: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  padding: 60px 40px;
  text-align: center;
  box-sizing: border-box;
  margin-right:24%;
  width: 50%;
}

.score-chart-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.score-section {
  flex: 2;
}

.chart-section {
  flex: 2;
  height: 400px;
}

.score-text {
  font-size: 60px;
  font-weight: 700;
  color: #007bff;
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
}

.result-button:hover {
  background-color: #007bff;
}

/* 图片选择题布局修复 */
.image-radio-group {
  width: 100%; /* 修改为 100%，确保自适应 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 居中显示 */
  gap: 5px; /* 图片之间的间距 */
}

.image-options-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center; /* 居中显示 */
  gap: 16px; /* 图片之间的间距 */
  max-width: 100%; /* 修改为 100%，确保自适应 */
  margin: 0 auto; /* 居中 */
}

.image-option-col {
  flex: 0 0 calc(50% - 8px); /* 两列布局，减去间距 */
  max-width: calc(50% - 8px); /* 限制最大宽度 */
  box-sizing: border-box;
}

.image-radio-item {
  width: 100%;
  height: 90%;
}

.image-wrapper {
  width: 45%;
  aspect-ratio: 1 / 1; /* 保持1:1宽高比 */
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f9f9f9; /* 添加背景色 */
}

.option-image {
  max-width: 90%; /* 限制最大宽度 */
  max-height: 60%; /* 限制最大高度 */
  object-fit: contain; /* 保持图片比例 */
  transition: transform 0.3s;
}

.image-radio-item.is-checked .image-wrapper {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

/* 修复Element Plus radio样式覆盖 */
:deep(.el-radio__input) {
  position: absolute;
  top: 40%;
  left: 1%;
}

:deep(.el-radio__label) {
  width: 100%;
  padding: 5 !important;
}

/* 患者情况概况和用户评估区域样式 */
.patient-summary {
  margin-top: 2.7%;
  margin-bottom: 6.75%;
  margin-left: 2.3%;
  margin-right: 2%; /* 修改为 2%，避免过大的右边距 */
  position: relative;
  z-index: 1;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20pt;
}

.header-list {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20pt;
}

.patieny-summary-title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 30px;
}

.question-text {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.button-union {
  background-color : #007bff
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content-container {
    flex-direction: column;
  }
  .el-col {
    width: 100%;
  }
  .score-chart-container {
    flex-direction: column;
  }
  .chart-section {
    width: 100%;
  }
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
.button-group-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 50px;
}
.operation-guide {
  margin-bottom: 10px;
}
.score-input-container {
  margin-top: 10px;
}
#chart-container {
  width: 100%;
  height: 100%;
}
</style>
