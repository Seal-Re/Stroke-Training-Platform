<template>
  <div class="content">
    <div class="summary-top-space">
      <form @submit.prevent="handleSubmit" class="user-info-form">
        <h2>用户信息收集</h2>
        <label for="name">姓名:</label>
        <input type="text" id="name" v-model="userInfo.name">
        <label for="email">邮箱:</label>
        <input type="email" id="email" v-model="userInfo.email">
        <label for="contact">联系方式:</label>
        <input type="text" id="contact" v-model="userInfo.contact">
        <label for="age">年龄:</label>
        <input type="number" id="age" v-model="userInfo.age">
        <label for="medicalHistory">既往病史:</label>
        <textarea id="medicalHistory" v-model="userInfo.medicalHistory"></textarea>
        <button type="submit">保存</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/store/index';
import router from '@/router/index';
import { ElMessage } from 'element-plus';

const userStore = useUserStore();

const user = computed(() => userStore.userInfo);


watch(user, (newValue) => {
  if (!newValue) {
    router.push('/login');
  }
});

// 用户信息表单数据
const userInfo = ref({
  user: '',
  name: '',
  email: '',
  contact: '',
  age: '',
  medicalHistory: '',
  notes: ''
});

// 获取用户信息
onMounted(async () => {
  try {
    const response = await axios.get('/api/userinfo_get', {
      params: {
        user: JSON.parse(user.value).username
      }
    });
    const userData = response.data.user_info;
    userInfo.value = {
      user: userData.user,
      name: userData.name,
      email: userData.email,
      contact: userData.contact,
      age: userData.age,
      medicalHistory: userData.medicalHistory
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
});

const handleSubmit = async () => {
  try {
    const dataToSubmit = {
     ...userInfo.value,
      name: userInfo.value.name || '',
      email: userInfo.value.email || '',
      contact: userInfo.value.contact || '',
      age: userInfo.value.age || '',
      medicalHistory: userInfo.value.medicalHistory || ''
    };

    const response = await axios.post('/api/userinfo_submit', dataToSubmit);
    console.log(response.data);
    ElMessage.success('保存成功');
  } catch (error) {
    console.error('保存用户信息失败:', error);
    ElMessage.error('保存失败');
  }
};
</script>

<style scoped>
.user-info-form {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  margin: auto;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 600;
}

input,
textarea {
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #007BFF;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

button {
  background-color: #007BFF;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}

button:hover {
  background-color: #0056b3;
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
</style>
