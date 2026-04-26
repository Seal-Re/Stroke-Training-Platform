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
      <!-- 表格部分 -->
      <div class="table-data">
        <el-table
          :data="currentPageData"
          stripe
          class="table-with-shadow"
          style="text-align: center; width: 100%;"
          @sort-change="handleSortChange"
        >
          <el-table-column
            prop="patient_username"
            label="患者用户名"
            align="center"
            min-width="120px"
            sortable
          ></el-table-column>
          <el-table-column
            prop="date"
            label="时间"
            align="center"
            min-width="120px"
            sortable
          ></el-table-column>
          <el-table-column
            prop="认知功能"
            label="认知功能情况"
            align="center"
            min-width="100px"
          ></el-table-column>
          <el-table-column
            prop="失算症训练"
            label="失算症训练"
            align="center"
            min-width="100px"
            sortable
          ></el-table-column>
          <el-table-column
            prop="思维障碍训练"
            label="思维障碍训练"
            align="center"
            min-width="100px"
            sortable
          ></el-table-column>
          <el-table-column
            prop="注意障碍训练"
            label="注意障碍训练"
            align="center"
            min-width="100px"
            sortable
          ></el-table-column>
          <el-table-column
            prop="知觉障碍训练"
            label="知觉障碍训练"
            align="center"
            min-width="100px"
            sortable
          ></el-table-column>
          <el-table-column
            prop="记忆障碍训练"
            label="记忆障碍训练"
            align="center"
            min-width="100px"
            sortable
          ></el-table-column>
          <el-table-column
            prop="totalScore"
            label="总分"
            align="center"
            min-width="80px"
            sortable
          ></el-table-column>
        </el-table>
      </div>
      <!-- 新增分页组件的父容器 -->
      <div class="pagination-container">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="sortedFilteredData.length"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '@/store/index';
import router from '@/router/index';
import axios from 'axios';
import { format } from 'date-fns';
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

// 分页相关变量
const currentPage = ref(1);
const pageSize = ref(12);

// 排序相关变量
const sortProp = ref(null);
const sortOrder = ref(null);

// 定义一个函数将日期格式从 2025/3/1 转换为 2025 - 03 - 01
const convertDate = (dateStr) => {
  if (!dateStr) {
    return '';
  }
  // 分离日期和时间部分（处理两种格式：有时间和无时间）
  const [datePart] = dateStr.split(' '); // 分割日期和时间部分
  const [year, month, day] = datePart.split(/[/-]/); // 处理不同分隔符
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const filteredTableData = computed(() => {
  if (!selectedDate.value) return tableData.value
  const formattedDate = format(selectedDate.value, 'yyyy-MM-dd')
  return tableData.value.filter(item => {
    return convertDate(item.date) === formattedDate
  })
})

const sortedFilteredData = computed(() => {
  if (!sortProp.value ||!sortOrder.value) {
    return filteredTableData.value;
  }
  return [...filteredTableData.value].sort((a, b) => {
    const valueA = a[sortProp.value];
    const valueB = b[sortProp.value];
    if (sortProp.value === 'date') {
      const dateA = new Date(convertDate(valueA));
      const dateB = new Date(convertDate(valueB));
      return sortOrder.value === 'ascending'? dateA - dateB : dateB - dateA;
    }
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortOrder.value === 'ascending'
       ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    return sortOrder.value === 'ascending'? valueA - valueB : valueB - valueA;
  });
});

// 计算当前页的数据
const currentPageData = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return sortedFilteredData.value.slice(startIndex, endIndex);
});

const logout = () => {
  console.log('用户登出');
  userStore.clearUserInfo(); // 使用 store 中的方法清除用户信息
  router.push('/login');
};

const filterTableData = () => {
  currentPage.value = 1; // 切换日期后重置到第一页
};

const handleSortChange = ({ prop, order }) => {
  sortProp.value = prop;
  sortOrder.value = order;
  currentPage.value = 1; // 排序后重置到第一页
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
      // 修改接口地址为 /api/doctor_patient_score
      const response = await axios.get(
        `/api/doctor_patient_score?username=${username}`
      );
      const data = response.data.data; // 先获取 "data" 键对应的值

      const recordsMap = new Map()
      data.forEach(patientData => {
        const scoreRecord = patientData.score_record
        if (scoreRecord.data) {
          Object.entries(scoreRecord.data).forEach(([trainingType, records]) => {
            records.forEach(record => {
              const key = `${record.date}-${patientData.patient_username}`
              if (!recordsMap.has(key)) {
                recordsMap.set(key, {
                  patient_username: patientData.patient_username,
                  date: record.date,
                  认知功能: record.认知功能 || '',
                  失算症训练: 0,
                  思维障碍训练: 0,
                  注意障碍训练: 0,
                  知觉障碍训练: 0,
                  记忆障碍训练: 0,
                  totalScore: 0
                })
              }
              const row = recordsMap.get(key)
              const value = Number(record.value) || 0
              row[trainingType] = value
              row.totalScore += value
            })
          })
        }
      });

      // 按时间倒序排序
      const allRows = Array.from(recordsMap.values()).sort((a, b) => {
        return new Date(convertDate(b.date)) - new Date(convertDate(a.date))
      })

      tableData.value = allRows
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  } else {
    router.push('/login');
  }
});

watch(selectedDate, () => {
  filterTableData();
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
  height: 20pt;
}

/* 为日期选择框容器添加右侧外边距 */
.date-picker-wrapper {
  margin-right: 10%; /* 可根据需要调整间隔大小 */
}

.table-with-shadow {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  min-width: 800px; /* 设置表格最小宽度 */
  margin-top: 20px;
}

.patieny-summary-title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 30px;
}

.pagination-container {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 12px 0;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  justify-content: center;
  display: flex;
}

.content {
  height: 100%;
  padding: 20px 20px;
  background-color: rgb(233, 233, 233);
}
</style>
