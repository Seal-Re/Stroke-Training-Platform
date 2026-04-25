<template>
  <div class="content">
    <div class="summary-top-space">
      <div class="header-flex ">
        <h2 class="patieny-summary-title">患者认知评估</h2>
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
            <h3>{{ selectedPatient.name }} 的认知评估</h3>

            <!-- 数据表格 -->
            <el-table
              :data="displayData"
              stripe
              style="width: 100%; margin-top: 20px;"
              border
            >
              <el-table-column prop="BABRI" label="BABRI" align="center"></el-table-column>
              <el-table-column prop="MMSE" label="MMSE" align="center"></el-table-column>
              <el-table-column prop="MoCA" label="MoCA" align="center"></el-table-column>
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
import dayjs from 'dayjs';

const userStore = useUserStore();
const user = computed(() => userStore.userInfo);

// 患者数据相关
const patientList = ref([]);
const selectedPatient = ref(null);
const selectedRowIndex = ref(-1);
const processedData = ref([]);
const currentPage = ref(1);
const pageSize = ref(4);

const displayData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return processedData.value.slice(start, end);
});

onMounted(async () => {
  console.log('开始获取患者列表...');
  if (user.value) {
    try {
      const userInfoObj = JSON.parse(user.value);
      console.log('请求参数:', userInfoObj.username);
      const response = await axios.get(
        baseurl + `/api/doctor_patient_info?username=${userInfoObj.username}`
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
      baseurl + `/api/deliverScoreData?username=${username}`
    );
    const rawData = response.data;

    // 表格数据处理
    const formattedTableData = [];
    formattedTableData.push(rawData);
    processedData.value = formattedTableData;
  } catch (error) {
    console.error('获取训练数据失败:', error);
  }
};

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
