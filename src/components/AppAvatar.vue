<template>
  <el-dropdown trigger="click">
      <div class="avatar">
          <img src="@/assets/images/avatar.gif" alt="avatar" />
      </div>
      <template #dropdown>
          <el-dropdown-menu>
              <el-dropdown-item @click="goToUserInfo">
                  <el-icon><User /></el-icon>个人信息
              </el-dropdown-item>
              <el-dropdown-item divided @click="logout">
                  <el-icon><SwitchButton /></el-icon>退出登陆
              </el-dropdown-item>
          </el-dropdown-menu>
      </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import router from '@/router/index';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useUserStore } from '@/store/index';
const userStore = useUserStore();

const goToUserInfo = () => {
  router.push('/userinfo');
};

// 退出登录
const logout = () => {
  ElMessageBox.confirm('您是否确认退出登录?', '温馨提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
  }).then(() => {
      ElMessage.success('退出登录成功！');
      console.log('用户登出');
      userStore.clearUserInfo();
      router.push({ name: 'Login', query: { r: Date.now() } });
  });
};
</script>

<style scoped lang="scss">
.avatar {
  width: 40px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 50%;
  img {
      width: 100%;
      height: 100%;
  }
}
</style>
