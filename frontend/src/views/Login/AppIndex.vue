<template>
  <div class="login-wrapper">
    <div ref="vantaRef" style="width: 100%; height: 100vh;"></div>
    <div class="banner"></div>
    <div class="log_in">
      <div class="title">
        <img class="logo_icon" src="@/assets/rzkh.svg" />
        <div class="text">认知障碍康复系统</div>
      </div>
      <!-- 使用 v-if 和 v-else 进行条件渲染 -->
      <div v-if="RegisterFlag === 0" class="log_IO">
        <el-form :model="login" label-width="auto" style="max-width: 600px">
          <el-form-item>
            <div class="el_input_wrapper">
              <el-input
                v-model="login.username"
                placeholder="请输入您的用户名"
                clearable
                size="large"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="el_input_wrapper">
              <el-input
                v-model="login.password"
                type="password"
                placeholder="请输入您的密码"
                show-password
                size="large"
              />
            </div>
          </el-form-item>
        </el-form>
        <div class="el_button_wrapper">
          <el-button class="login_button" type="danger" @click="handleLogin">登录</el-button>
        </div>

        <div class="button-group">
          <el-button @click="handleRegister" type="" link> 注册&nbsp;|</el-button>
          <el-button type="" link>忘记密码 </el-button>
        </div>
      </div>
      <div v-else class="log_IO">
        <el-form :model="login" label-width="auto" style="max-width: 600px">
          <el-form-item>
            <div class="el_input_wrapper">
              <el-input
                v-model="login.username"
                placeholder="请输入您的用户名"
                clearable
                size="large"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="el_input_wrapper">
              <el-input
                v-model="login.password"
                type="password"
                placeholder="请输入您的密码"
                show-password
                size="large"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="el_input_wrapper">
              <el-input
                v-model="login.invitationCode"
                placeholder="请输入邀请码（选填）"
                clearable
                size="large"
              />
            </div>
          </el-form-item>
        </el-form>
        <div class="el_button_wrapper">
          <el-button class="login_button" type="danger" @click="handleRegister_ex">注册</el-button>
        </div>

        <div class="button-group">
          <el-button @click="handleLogin_ex" type="" link> 登录&nbsp;|</el-button>
          <el-button type="" link>忘记密码 </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import router from "@/router/index";
import axios from "axios";
import { useUserStore } from "@/store/index";
import { reactive } from "vue";
import { ElMessage } from 'element-plus';
import baseurl from '@/http/base';
import * as THREE from "three";
import BIRDS from "vanta/src/vanta.birds";

const vantaRef = ref(null);
let vantaEffect: { destroy: () => void; } | null = null;

const login = reactive({
  username: "",
  password: "",
  invitationCode: ""
});

const userStore = useUserStore();
const isLoginFailed = ref(0);
const isRegisterFailed = ref(0);
const RegisterFlag = ref(0);

const handleRegister = async () => {
  RegisterFlag.value = 1;
};
const handleLogin_ex = async () => {
  RegisterFlag.value = 0;
};

const handleRegister_ex = async () => {
  const userData = {
    username: login.username,
    password: login.password,
    invitationCode: login.invitationCode
  };

  try {
    const response = await axios.post('/api/register', userData);
    if (response.data.success) {
      isRegisterFailed.value = 1;
      setTimeout(() => {
        isRegisterFailed.value = 0;
      }, 1000);
      let message = '注册成功，请登录';
      if (login.invitationCode) {
        message += `，使用的邀请码为：${login.invitationCode}`;
      }
      ElMessage.success(message);
      RegisterFlag.value = 0;
    } else {
      isRegisterFailed.value = 2;
      setTimeout(() => {
        isRegisterFailed.value = 0;
      }, 1000);
    }
  } catch (error) {
    console.error('注册请求出错:', error);
    isRegisterFailed.value = 2;
    setTimeout(() => {
      isRegisterFailed.value = 0;
    }, 1000);
  }
};
const handleLogin = async () => {
  const userData = {
    username: login.username,
    password: login.password,
  };

  try {
    const response = await axios.post("/api/login", userData);
    if (response.data.success) {
      isLoginFailed.value = 1;
      setTimeout(() => {
        isLoginFailed.value = 0;
      }, 1000);

      // 假设服务器返回的响应中包含 token 和 userInfo
      const { token, userInfo } = response.data;
      const userClass = userInfo.class; // 获取用户的 class 属性

      // 使用 userStore 的方法设置 token 和 userInfo
      userStore.setToken(token);
      userStore.setUserInfo(userInfo);

      // 根据 class 属性决定跳转页面
      if (userClass === 0) {
        router.push("/home");
      } else if (userClass === 1) {
        router.push("/home_doctor");
      }
    } else {
      isLoginFailed.value = 2;
      setTimeout(() => {
        isLoginFailed.value = 0;
      }, 1000);
      ElMessage.error('用户名或密码错误'); // 新增的错误提示
    }
  } catch (error) {
    console.error("登录请求出错:", error);
    isLoginFailed.value = 2;
    setTimeout(() => {
      isLoginFailed.value = 0;
    }, 1000);
    ElMessage.error('用户名或密码错误'); // 新增的错误提示
  }
};

onMounted(() => {
  document.documentElement.style.height = "100%";
  document.body.style.height = "100%";
  document.body.style.flexDirection = "column";
  document.body.style.backgroundColor = "#FFFFFF";

  vantaEffect = BIRDS({
    el: vantaRef.value,
    THREE: THREE,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    color1: 0x00FFFF, // 这里使用十六进制颜色值
    color2: 0xFFFF00, // 这里使用十六进制颜色值
  });
});

onBeforeUnmount(() => {
  if (vantaEffect) {
    vantaEffect.destroy();
  }
});
</script>

<style scoped>
.login-wrapper {
  width: 100%;
  height: 100vh;
  position: relative;
}

.log_in {
  width: 400px;
  height: 400px;
  padding: 32px 44px;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
}

.title {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 45px;
 .logo_icon {
    width: 60px;
    height: 60px;
    padding-right: 20px;
  }
 .text {
    font-size: 24px;
    color: #333;
    padding: 20px 0;
  }
}

.el_input_wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px; /* 根据实际需求调整高度 */
  width: 100%; /* 根据实际需求调整宽度 */
  border-radius: 4px;
}
.el-input {
  width: 100%;
  height: 100%;
}
.el_button_wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px; /* 根据实际需求调整高度 */
  width: 100%; /* 根据实际需求调整宽度 */
  border-radius: 4px;
}
.login_button {
  width: 100%;
  height: 100%;
  font-size: 20px;
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-group .el-button {
  color: gray;
  border: none;
  padding-top: 30px;
  margin-left: 0;
}

.status-blue {
  background-color: #007bff !important;
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
