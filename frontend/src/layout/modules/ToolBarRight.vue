<template>
  <div class="tool-bar-ri">
      <!-- <div class="header-icon">
          <Message />
      </div> -->
      <span class="username">{{ user }}</span>
      <Avatar />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import Avatar from '@/components/AppAvatar.vue';
import { useUserStore } from "@/store/index";

const userStore = useUserStore();

const user = computed(() => {
  try {
    // 尝试将 userInfo 字符串解析为对象
    const userInfoObj = JSON.parse(userStore.userInfo);
    // 从解析后的对象中提取 username
    return userInfoObj.username || '未登录用户';
  } catch (error) {
    // 如果解析失败，说明 userInfo 不是有效的 JSON 字符串，返回默认值
    console.error('解析 userInfo 失败:', error);
    return '未登录用户';
  }
});

// 如果有获取用户信息的接口调用，可以在这里模拟
// 例如：
// setTimeout(() => {
//     userStore.setUserInfo('{"username":"实际用户名"}');
// }, 1000);

</script>

<style scoped lang="scss">
.tool-bar-ri {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 25px;
  .header-icon {
      display: flex;
      align-items: center;
      margin-top: 8px;
  }
  .username {
      margin: 0 20px;
      font-size: 15px;
      color: var(--el-header-text-color);
  }
}
</style>
