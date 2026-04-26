<template>
  <div class="login-wrapper">
    <div class="log_in">
      <div class="title">登入</div>

      <div class="log_IO">
        <el-input
          v-model="username"
          style="width: 240px"
          placeholder="请输入您的用户名"
          clearable
        />
        <el-input
          v-model="password"
          style="width: 240px"
          type="password"
          placeholder="请输入您的密码"
          show-password
        />
        <div class="button-group">
          <el-button
            @click="handleLogin"
            type="primary"
            round
            style="margin-left: 10px;"
            :class="
              [
                isLoginFailed === 0 ? 'status-blue' : '',
                isLoginFailed === 1 ? 'status-green' : '',
                isLoginFailed === 2 ? 'status-red' : ''
              ]"
          >
            登录
          </el-button>
          <el-button
            @click="handleRegister"
            type="primary"
            round
            :class="
              [
                isRegisterFailed === 0 ? 'status-blue' : '',
                isRegisterFailed === 1 ? 'status-green' : '',
                isRegisterFailed === 2 ? 'status-red' : ''
              ]"
          >
            注册
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import router from '@/router/index';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const username = ref('');
const password = ref('');
const isRegisterFailed = ref(0);
const isLoginFailed = ref(0);

const handleRegister = async () => {
  router.push("/register");
};

const handleLogin = async () => {
  const userData = {
    username: username.value,
    password: password.value,
  };

  try {
    const response = await axios.post('http://localhost:5000/login', userData);
    if (response.data.success) {
      isLoginFailed.value = 1;
      setTimeout(() => {
        isLoginFailed.value = 0;
      }, 1000);

      userStore.login(userData);
      router.push('/home');
    } else {
      isLoginFailed.value = 2;
      setTimeout(() => {
        isLoginFailed.value = 0;
      }, 1000);
    }
  } catch (error) {
    console.error('登录请求出错:', error);
    isLoginFailed.value = 2;
    setTimeout(() => {
      isLoginFailed.value = 0;
    }, 1000);
  }
};

onMounted(() => {
  document.documentElement.style.height = '100%';
  document.body.style.height = '100%';
  document.body.style.flexDirection = 'column';
  document.body.style.backgroundImage = 'linear-gradient(to bottom right, #e0f4ff, #fce0ff)';
});
</script>

<style scoped>
.login-wrapper {
  width: 100%;
  height: 100vh;
  position: relative;
}

.log_in {
  width: 240px;
  height: 200px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.log_IO .el-input {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.button-group {
  display: flex;
  align-items: center;
}

.log_IO .el-button {
  width: 110px;
  background-color: #007BFF;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-bottom: 20px;
}

.status-blue {
  background-color: #007BFF !important;
}

.status-green {
  background-color: green !important;
}

.status-red {
  background-color: red !important;
}

p {
  font-size: 16px;
  color: #3a3232;
  font-weight: bold;
  margin-top: 10px;
}
</style>
