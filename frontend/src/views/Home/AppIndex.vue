<template>
  <!-- 移除顶部白条区域 -->
  <!-- 新增的背景空白区域 -->
  <div class="content">
    <div class="summary-top-space">
      <div class="header-flex">
          <h2 class="patieny-summary-title">患者情况概况：</h2>
          <!-- 新增一个容器包裹日期选择框 -->
          <div class="date-picker-wrapper">
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="选择日期"
              @change="filterTableData"
            ></el-date-picker>
          </div>
        </div>
      <!-- 折线图和饼状图容器 -->
      <div class="chart-container">
        <div ref="lineChartRef" class="line-chart"></div>
        <div ref="pieChartRef" class="pie-chart"></div>
      </div>
      <!-- 表格部分 -->
      <div class="table-data">
        <el-table :data="currentPageData" stripe class="table-with-shadow" style="text-align: center; width: 100%;">
          <el-table-column prop="date" label="时间" align="center" min-width="120px"></el-table-column>
          <!-- 修改为显示认知功能情况 -->
          <el-table-column prop="认知功能" label="认知功能情况" align="center" min-width="100px"></el-table-column>
          <el-table-column prop="失算症训练" label="失算症训练" align="center" min-width="100px"></el-table-column>
          <el-table-column prop="思维障碍训练" label="思维障碍训练" align="center" min-width="100px"></el-table-column>
          <el-table-column prop="注意障碍训练" label="注意障碍训练" align="center" min-width="100px"></el-table-column>
          <el-table-column prop="知觉障碍训练" label="知觉障碍训练" align="center" min-width="100px"></el-table-column>
          <el-table-column prop="记忆障碍训练" label="记忆障碍训练" align="center" min-width="100px"></el-table-column>
          <el-table-column prop="totalScore" label="总分" align="center" min-width="80px"></el-table-column>
        </el-table>
      </div>

      <!-- 新增分页组件的父容器 -->
      <div class="pagination-container">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="filteredTableData.length"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useUserStore } from '@/store/index';
import router from '@/router/index';
import axios from 'axios';
import { format } from 'date-fns';
import * as echarts from 'echarts';
import baseurl from '@/http/base';

const userStore = useUserStore();
// 登录用户
const user = computed(() => userStore.userInfo); // 修改为直接获取 userInfo

// 检查用户是否登录，如果未登录则重定向到登录页面
watch(user, (newValue) => {
  if (!newValue) {
    router.push('/login');
  }
});

const tableData = ref([]);
const selectedDate = ref(null);
const lineChartRef = ref(null);
const pieChartRef = ref(null);

// 分页相关变量
const currentPage = ref(1);
const pageSize = ref(8);//每一页最大放的数据量

// 定义一个函数将日期格式从 2025/3/1 转换为 2025 - 03 - 01
const convertDate = (dateStr) => {
  // 分离日期和时间部分（处理两种格式：有时间和无时间）
  const [datePart] = dateStr.split(' '); // 分割日期和时间部分
  const [year, month, day] = datePart.split(/[/-]/); // 处理不同分隔符
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const filteredTableData = computed(() => {
  if (!selectedDate.value) {
    return tableData.value;
  }
  const formattedDate = format(selectedDate.value, 'yyyy-MM-dd');

  return tableData.value.filter(item => {
    // 统一转换item.date格式
    const itemDate = convertDate(item.date);
    return itemDate === formattedDate;
  });
});

// 计算当前页的数据
const currentPageData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredTableData.value.slice(startIndex, endIndex);
});

const logout = () => {
  console.log('用户登出');
  userStore.clearUserInfo(); // 使用 store 中的方法清除用户信息
  router.push('/login');
};

const filterTableData = () => {
  // 日期选择改变时，会自动触发 filteredTableData 的计算属性更新
  drawPieChart();
  currentPage.value = 1; // 切换日期后重置到第一页
};

const drawLineChart = () => {
  const dataToUse = tableData.value; // 始终使用全部数据绘制折线图
  const dateMap = new Map();
  const moduleScores = {
    '失算症训练': [],
    '思维障碍训练': [],
    '注意障碍训练': [],
    '知觉障碍训练': [],
    '记忆障碍训练': [],
    'totalScore': []
  };

  dataToUse.forEach(item => {
    const date = convertDate(item.date);
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        '失算症训练': [],
        '思维障碍训练': [],
        '注意障碍训练': [],
        '知觉障碍训练': [],
        '记忆障碍训练': [],
        'totalScore': []
      });
    }
    Object.keys(moduleScores).forEach(module => {
      dateMap.get(date)[module].push(item[module]);
    });
  });

  const dates = Array.from(dateMap.keys()).sort();
  dates.forEach(date => {
    Object.keys(moduleScores).forEach(module => {
      const scores = dateMap.get(date)[module];
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      moduleScores[module].push(average);
    });
  });

  // 绘制折线图
  const lineChart = echarts.init(lineChartRef.value);
  const selectedDateStr = selectedDate.value? format(selectedDate.value, 'yyyy-MM-dd') : null;
  const lineOption = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: Object.keys(moduleScores).map(module => ({
      name: module,
      type: 'line',
      data: moduleScores[module],
      markPoint: {
        data: selectedDateStr && dates.includes(selectedDateStr)? [
          {
            coord: [selectedDateStr, moduleScores[module][dates.indexOf(selectedDateStr)]],
            itemStyle: {
              color: 'red'
            }
          }
        ] : []
      }
    }))
  };
  lineChart.setOption(lineOption);
};

const drawPieChart = () => {
  const dataToUse = selectedDate.value? filteredTableData.value : tableData.value; // 根据是否选择日期决定使用的数据
  const moduleTotalScores = {
    '失算症训练': 0,
    '思维障碍训练': 0,
    '注意障碍训练': 0,
    '知觉障碍训练': 0,
    '记忆障碍训练': 0,
    'totalScore': 0
  };

  dataToUse.forEach(item => {
    Object.keys(moduleTotalScores).forEach(module => {
      moduleTotalScores[module] += item[module];
    });
  });

  // 绘制饼状图
  const pieChart = echarts.init(pieChartRef.value);
  const pieData = Object.keys(moduleTotalScores).filter(module => module!== 'totalScore').map(module => ({
    value: moduleTotalScores[module],
    name: module
  }));
  const pieOption = {
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: '模块得分占比',
        type: 'pie',
        radius: '50%',
        data: pieData
      }
    ]
  };
  pieChart.setOption(pieOption);
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
};

onMounted(async () => {
  if (user.value) {
    try {
      // 将 userInfo 字符串转换为对象
      const userInfoObj = JSON.parse(user.value);
      const username = userInfoObj.username;
      const response = await axios.get(`/api/deliverScoreData_train?username=${username}`);
      const data = response.data.data; // 先获取 "data" 键对应的值

      // 创建对象来按日期和id分组存储数据
      const recordsMap = new Map();

      // 遍历所有训练类型
      for (const trainingType in data) {
        // 遍历每个训练类型的数据项
        for (const item of data[trainingType]) {
          const key = `${item.date}-${item.id}`;

          // 如果不存在则初始化记录
          if (!recordsMap.has(key)) {
            recordsMap.set(key, {
              date: item.date,
              // 移除 id
              失算症训练: 0,
              思维障碍训练: 0,
              注意障碍训练: 0,
              知觉障碍训练: 0,
              记忆障碍训练: 0,
              totalScore: 0,
              认知功能: item['认知功能']
            });
          }

          // 获取当前记录
          const record = recordsMap.get(key);

          // 将当前训练类型的值转换为数字（处理无效值为0）
          const numericValue = Number(item.value) || 0;

          // 更新对应训练类型的值和总分
          record[trainingType] = numericValue;
          record.totalScore += numericValue;
        }
      }

      // 将Map转换为数组并排序
      const allRows = Array.from(recordsMap.values()).sort((a, b) => {
        const dateA = new Date(convertDate(a.date));
        const dateB = new Date(convertDate(b.date));
        if (dateA.getTime() === dateB.getTime()) {
          const timeA = new Date(a.date);
          const timeB = new Date(b.date);
          const hourDiff = timeB.getHours() - timeA.getHours();
          if (hourDiff!== 0) {
            return hourDiff;
          }
          const minuteDiff = timeB.getMinutes() - timeA.getMinutes();
          if (minuteDiff!== 0) {
            return minuteDiff;
          }
          return timeB.getSeconds() - timeA.getSeconds();
        }
        return dateB - dateA || (a['认知功能'] > b['认知功能']? 1 : -1);
      });

      tableData.value = allRows;

      drawLineChart(); // 初始加载时绘制折线图
      drawPieChart(); // 初始加载时绘制饼状图
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  } else {
    router.push('/login');
  }
});

watch(selectedDate, () => {
  drawPieChart();
});
</script>
<style scoped>
/* 样式代码修改 */
.home-page {
  padding: 0 20px;
  position: relative;
  overflow-x: hidden;
}

/* 移除顶部白条区域样式 */
.summary-top-space {
  padding-top: 20px;
  background-color: var(--el-bg-color);
  box-sizing: border-box;
  border: 1px;
  border-radius: 6px;
  box-shadow: 0 0 12px rgb(0 0 0 / 5%);
  /* 修改顶部外边距 */
}

.patient-summary {
  margin-top: 0.35%;
  margin-bottom: 2%;
  margin-left: 2.25%;
  margin-right: 2%;
  position: relative;
  z-index: 1;
}

.info-box {
  border: 1px solid #e4e7ed;
  padding: 10px;
  height: 300px;
  box-sizing: border-box;
  overflow-y: auto;
}

.data-item {
  border: 1px solid #ccc;
  padding: 8px;
  margin-bottom: 8px;
}

.training-name {
  text-align: center;
  margin-bottom: 5px;
  font-size: 18px;
  font-weight: bold;
}

.training-container {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.training-item {
  flex: 1;
  min-width: calc(20% - 12px);
  box-sizing: border-box;
}

.separate-space {
  height: 20px;
  background-color: transparent;
}

/* 响应式调整 */
@media (max-width: 1200px) {
 .training-item {
    min-width: calc(25% - 12px);
  }
}

@media (max-width: 992px) {
 .training-item {
    min-width: calc(33.33% - 12px);
  }
}

@media (max-width: 768px) {
 .training-item {
    min-width: calc(50% - 12px);
  }
}

@media (max-width: 480px) {
 .training-item {
    min-width: 100%;
  }
  /* 在小屏幕下，让表格可以横向滚动 */
 .table-data {
    overflow-x: auto;
  }
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height:20pt;
}

/* 新增图表容器样式 */
.chart-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.line-chart {
  width: 60%;
  height: 300px;
}

.pie-chart {
  width: 35%;
  height: 300px;
}

/* 为日期选择框容器添加右侧外边距 */
.date-picker-wrapper {
  margin-right: 10%; /* 可根据需要调整间隔大小 */
}

.table-with-shadow {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  min-width: 800px; /* 设置表格最小宽度 */
}

.patieny-summary-title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 30px;
}

/* 新增分页组件父容器的样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.content {
  height: 100%;
  padding: 20px 20px;
  background-color: rgb(233, 233, 233);
}

</style>
