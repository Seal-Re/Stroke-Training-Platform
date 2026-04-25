<template>
  <Tabs />
  <el-main>
      <router-view v-slot="{ Component, route }">
          <transition appear name="fade-transform" mode="out-in">
              <!-- <keep-alive> -->
              <component :is="Component" v-if="isRouterShow" :key="route.fullPath" />
              <!-- </keep-alive> -->
          </transition>
      </router-view>
  </el-main>
</template>

<script lang="ts" setup>
import { ref, onBeforeUnmount, provide } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import Tabs from './Tabs.vue';

// 注入刷新页面方法
const isRouterShow = ref(true);
const refreshCurrentPage = (val: boolean) => (isRouterShow.value = val);
provide('refresh', refreshCurrentPage);

// 手动管理侧边栏折叠状态
const isCollapse = ref(false);

// 切换侧边栏折叠状态的函数
const changeCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 监听窗口大小变化，折叠侧边栏
const screenWidth = ref(0);
const listeningWindow = useDebounceFn(() => {
  screenWidth.value = document.body.clientWidth;
  if (!isCollapse.value && screenWidth.value < 1200) changeCollapse();
  if (isCollapse.value && screenWidth.value > 1200) changeCollapse();
}, 100);

window.addEventListener('resize', listeningWindow, false);
onBeforeUnmount(() => {
  window.removeEventListener('resize', listeningWindow);
});
</script>

<style scoped lang="scss">
.el-main {
  box-sizing: border-box;
  padding: 10px 12px;
  overflow-x: hidden;
  background-color: var(--el-bg-color-page);
}

.el-footer {
  height: auto;
  padding: 0;
}
</style>
