<template>
  <div class="content">
    <div class="summary-top-space">
      <div class="header-flex ">
        <h2 class="patieny-summary-title">患者详细情况</h2>
      </div>
      <div class="main-container">
        <!-- 左侧患者列表 -->
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
          <div v-if="selectedPatient" class="training-info">
            <h3>{{ selectedPatient.name }} 的训练数据</h3>

            <!-- 图表容器 -->
            <div class="chart-container">
              <div id="scoreChart" style="width: 100%; height: 380px;"></div>
            </div>

            <!-- 数据表格 -->
            <el-table
              :data="displayData"
              stripe
              style="width: 100%; margin-top: 20px;"
              border
            >
              <el-table-column prop="date" label="日期" align="center" width="180"></el-table-column>
              <el-table-column prop="trainingType" label="训练类型" align="center"></el-table-column>
              <el-table-column prop="scoreRate" label="得分率(%)" align="center">
                <template #default="{ row }">
                  {{ row.scoreRate!== undefined? row.scoreRate.toFixed(2) : '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="value" label="数值" align="center"></el-table-column>
              <el-table-column prop="认知功能" label="认知评估" align="center"></el-table-column>
            </el-table>

            <!-- 分页组件 -->
            <div class="pagination-container">
              <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-sizes="[5]"
                :page-size="pageSize"
                layout="prev, pager, next"
                :total="processedData.length"
              >
              </el-pagination>
            </div>
          </div>
          <div v-else class="placeholder">
            请从左侧选择患者查看训练数据
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/store/index';
import router from '@/router/index';
import axios from 'axios';
import baseurl from '@/http/base';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

const userStore = useUserStore();
const user = computed(() => userStore.userInfo);

// 患者数据相关
const patientList = ref([]);
const selectedPatient = ref(null);
const selectedRowIndex = ref(-1);
const processedData = ref([]);
const chartData = ref([]);
const currentPage = ref(1);
const pageSize = ref(4);

const displayData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return processedData.value.slice(start, end);
});

let chartInstance = null;

// 新增调试日志
console.log('组件挂载，当前用户:', user.value);

watch(user, (newValue) => {
  console.log('用户状态变化:', newValue);
  if (!newValue) {
    router.push('/login');
  }
});

onMounted(async () => {
  console.log('开始获取患者列表...');
  if (user.value) {
    try {
      const userInfoObj = JSON.parse(user.value);
      console.log('请求参数:', userInfoObj.username);
      const response = await axios.get(
        `/api/doctor_patient_info?username=${userInfoObj.username}`
      );
      console.log('患者列表响应:', response.data);
      patientList.value = response.data.data.map((patient) => ({
        patient_username: patient.patient_username,
        name: patient.user_info?.name || '未知'
      }));
      console.log('处理后的患者列表:', patientList.value);
    } catch (error) {
      console.error('获取患者列表失败:', error);
    }
  } else {
    router.push('/login');
  }
});

const handleRowClick = async (row) => {
  console.log('点击患者行:', row);
  selectedRowIndex.value = patientList.value.indexOf(row);
  selectedPatient.value = row;
  await fetchPatientData(row.patient_username);
};

const fetchPatientData = async (username) => {
  try {
    const response = await axios.get(
      `/api/deliverScoreData_train?username=${username}`
    );
    const rawData = response.data?.data;

    // 表格数据处理（保持原始数据）
    const formattedTableData = [];
    Object.entries(rawData || {}).forEach(([trainingType, records]) => {
      records.forEach(record => {
        formattedTableData.push({
          date: dayjs(record.date).format('YYYY-MM-DD HH:mm'),
          timestamp: dayjs(record.date).valueOf(),
          trainingType: trainingType,
          scoreRate: record.scoreRate,
          value: parseFloat(record.value), // 确保 value 为数值类型
          认知功能: record.认知功能
        });
      });
    });
    processedData.value = formattedTableData.sort((a, b) => b.timestamp - a.timestamp);

    // 图表数据处理（按天分组计算单项得分平均值）
    const chartDataMap = new Map();

    formattedTableData.forEach(item => {
      const dateKey = dayjs(item.timestamp).startOf('day').valueOf();
      const compositeKey = `${dateKey}_${item.trainingType}`;

      if (!chartDataMap.has(compositeKey)) {
        chartDataMap.set(compositeKey, {
          date: dateKey,
          trainingType: item.trainingType,
          totalScore: 0,
          count: 0
        });
      }

      const group = chartDataMap.get(compositeKey);
      group.totalScore += item.value; // 累加数值类型的得分
      group.count++;
    });

    // 转换为图表数据并计算平均值
    chartData.value = Array.from(chartDataMap.values()).map(item => ({
      date: item.date,
      trainingType: item.trainingType,
      scoreRate: item.totalScore / item.count,
      timestamp: item.date // 使用当天开始时间戳
    })).sort((a, b) => b.timestamp - a.timestamp);

    initChart(chartData.value);
  } catch (error) {
    console.error('获取训练数据失败:', error);
  }
};

const initChart = (data) => {
  if (chartInstance) chartInstance.dispose();
  const chartDom = document.getElementById('scoreChart');
  if (!chartDom) return;

  chartInstance = echarts.init(chartDom);

  // 按训练类型分组数据
  const seriesData = data.reduce((acc, item) => {
    const key = item.trainingType;
    if (!acc[key]) {
      acc[key] = {
        name: key,
        type: 'line',
        data: [],
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        yAxisIndex: 0
      };
    }
    acc[key].data.push([item.timestamp, item.scoreRate]);
    return acc;
  }, {});

  const option = {
    title: { text: '每日单项得分平均值趋势', left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: params => params.map(p => `
        ${p.marker} ${p.seriesName}<br/>
        日期: ${dayjs(p.value[0]).format('YYYY-MM-DD')}<br/>
        单项得分平均值: ${p.value[1].toFixed(2)}
      `).join('<br/>')
    },
    legend: { data: Object.keys(seriesData), top: 30 },
    xAxis: {
      type: 'time',
      axisLabel: { formatter: value => dayjs(value).format('MM-DD') }
    },
    yAxis: [{
      type: 'value',
      name: '单项得分平均值',
      min: 0,
      axisLabel: { formatter: '{value}' }
    }],
    series: Object.values(seriesData),
    grid: { top: 100, containLabel: true },
    // 添加数据缩放功能
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        height: 20,
        bottom: 10
      }
    ]
  };

  // 空数据状态处理
  if (data.length === 0) {
    option.title.text = '暂无训练数据';
    option.graphic = {
      type: 'text',
      left: 'center',
      top: 'middle',
      silent: true,
      style: { fill: '#999', text: '暂无数据', fontSize: 16 }
    };
  }

  chartInstance.setOption(option);
  window.addEventListener('resize', () => chartInstance.resize());
};

// 清理图表实例
onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
});

// 行高亮样式
const getRowClassName = ({ rowIndex }) => {
  return rowIndex === selectedRowIndex.value? 'highlight-row' : '';
};

// 处理分页大小变化
const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
};

// 处理页码变化
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
};
</script>

<style scoped>
.content {
  height: 100%;
  padding: 20px 20px;
  background-color: rgb(233, 233, 233);
}


.main-container {
  display: flex;
  gap: 20px;
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

.training-info {
  padding: 10px;
}

.training-info h3 {
  margin-top: 0;
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

  &.el-table__row--striped {
    > td {
      background-color: #409eff !important;
    }
  }
}

.chart-container {
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
}

/* 调整表格行高 */
.el-table :deep(.el-table__row) {
  height: 50px;
}

/* 图表tooltip样式优化 */
#scoreChart {
  font-family: Arial, sans-serif;
}

.no-data {
  text-align: center;
  color: #999;
  font-size: 16px;
  margin-top: 10px;
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
  height: 20pt;
}

.patieny-summary-title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 30px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
