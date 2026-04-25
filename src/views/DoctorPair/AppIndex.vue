<template>
  <div class="patient-list-wrapper content">
    <div class="summary-top-space">
      <div class="header-flex">
        <h2 class="patieny-summary-title">患者列表</h2>
        <el-input v-model="searchQuery" placeholder="通过姓名搜索用户" clearable @input="filterPatients"></el-input>
      </div>
      <div class="table-data">
        <el-table
          :data="currentPagePatients"
          stripe
          class="table-with-shadow"
          style="text-align: center; width: 100%;"
          @row-click="handleRowClick"
          :row-class-name="getRowClassName"
        >
          <el-table-column prop="username" label="用户名" align="center" min-width="120px"></el-table-column>
          <el-table-column prop="name" label="姓名" align="center" min-width="100px"></el-table-column>
          <el-table-column prop="doctor" label="当前医生" align="center" min-width="120px"></el-table-column>
        </el-table>
      </div>
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10]"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="patientStore.filteredPatients.length"
        >
        </el-pagination>
      </div>
      <div class="selected-patient-info">
        <span>患者</span>
        <el-input class="elinput-name" v-model="selectedPatientName" readonly></el-input>
        <el-button
          @click="handlePairing"
          :disabled="!selectedPatientUsername"
          :class="{ 'active-button': selectedPatientUsername }"
        >
          配对
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import baseurl from '@/http/base';
import { usePatientStore } from '@/store/index';
import { useUserStore } from '@/store/index';

const patientStore = usePatientStore();
const userStore = useUserStore();
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedPatientUsername = ref('');
const selectedPatientName = ref('');
const selectedRowIndex = ref(-1);

const getCurrentPagePatients = () => {
  return patientStore.getCurrentPagePatients(currentPage.value, pageSize.value);
};

const currentPagePatients = ref(getCurrentPagePatients());

const filterPatients = () => {
  patientStore.filterPatients(searchQuery.value);
  currentPage.value = 1;
  currentPagePatients.value = getCurrentPagePatients();
  selectedPatientUsername.value = '';
  selectedPatientName.value = '';
  selectedRowIndex.value = -1;
};

const fetchPatients = async () => {
  try {
    const response = await axios.get('/api/doctor_usersinfo');
    const patientData = response.data.data.map((item: { user: { username: any; }; user_info: { name: any; doctor: any; }; }) => ({
      username: item.user.username,
      name: item.user_info.name || '无姓名信息',
      doctor: item.user_info.doctor || null
    })).filter((patient: { username: any; }) => patient.username);
    patientStore.setPatients(patientData);
    currentPagePatients.value = getCurrentPagePatients();
  } catch (error) {
    console.error('获取患者数据出错:', error);
  }
};

const handleSizeChange = (newSize: number) => {
  pageSize.value = newSize;
  currentPagePatients.value = getCurrentPagePatients();
  selectedPatientUsername.value = '';
  selectedPatientName.value = '';
  selectedRowIndex.value = -1;
};

const handleCurrentChange = (newPage: number) => {
  currentPage.value = newPage;
  currentPagePatients.value = getCurrentPagePatients();
  selectedPatientUsername.value = '';
  selectedPatientName.value = '';
  selectedRowIndex.value = -1;
};

const handleRowClick = (row: { username: string; name: string; }, event: any, column: any) => {
  const index = currentPagePatients.value.indexOf(row);
  selectedRowIndex.value = index;
  selectedPatientUsername.value = row.username;
  selectedPatientName.value = row.name;
};

const getRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  return rowIndex === selectedRowIndex.value? 'highlight-row' : '';
};

const handlePairing = async () => {
  if (selectedPatientUsername.value) {
    const user = userStore.userInfo;
    const userInfoObj = JSON.parse(userStore.userInfo);
    const doctorUsername = userInfoObj.username;
    const selectedPatient = currentPagePatients.value.find((patient: { username: string; }) => patient.username === selectedPatientUsername.value);

    if (!selectedPatient.doctor) {
      try {
        const response = await axios.post('/api/doctorpair', {
          doctorUsername,
          patientUsername: selectedPatientUsername.value,
          userInfo: { doctor: doctorUsername },
        });
        if (response.data.success) {
          selectedPatient.doctor = doctorUsername;
          ElMessage.success('配对成功');
        } else {
          ElMessage.error('配对失败: ' + response.data.message);
        }
      } catch (error) {
        ElMessage.error('配对请求出错: ' + (error as any).message);
      }
    } else if (selectedPatient.doctor!== doctorUsername) {
      ElMessage.warning('该患者已有其他医生，不配对');
    } else {
      ElMessageBox.confirm('是否要取消与该用户的配对？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await axios.post('/api/doctorpair', {
            doctorUsername,
            patientUsername: selectedPatientUsername.value,
            userInfo: { doctor: null }
          });
          if (response.data.success) {
            selectedPatient.doctor = null;
            ElMessage.success('取消配对成功');
          } else {
            ElMessage.error('取消配对失败: ' + response.data.message);
          }
        } catch (error) {
          ElMessage.error('取消配对请求出错: ' + (error as any).message);
        }
      }).catch(() => {
        ElMessage.info('已取消操作');
      });
    }
  }
};

onMounted(() => {
  fetchPatients();
});
</script>

<style scoped>
.patient-list-wrapper {
  padding: 20px;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.patieny-summary-title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 30px;
}

.el-input {
  margin-bottom: 20px;
  width: 300px;
}

.table-data {
  margin-bottom: 20px;
}

.table-with-shadow {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  min-width: 800px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.selected-patient-info {
  display: flex;
  align-items: center;
  margin-top: 20px;
  justify-content: center;
}

.selected-patient-info span {
  margin-right: 10px;
}

.selected-patient-info.el-input {
  width: auto;
  flex: 1;
  margin-bottom: 0;
}

.selected-patient-info.el-button {
  margin-left: 10px;
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

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20pt;
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

.elinput-name {
  margin-top: 20px;
}

.active-button {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
}

.active-button:disabled {
  background-color: #c0c4cc;
  border-color: #c0c4cc;
  cursor: not-allowed;
}
</style>
