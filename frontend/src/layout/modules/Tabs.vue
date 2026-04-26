<template>
  <div class="tabs-box">
      <div class="tabs-menu">
          <el-tabs v-model="tabsMenuValue" type="card" @tab-click="tabClick" @tab-remove="tabRemove">
              <el-tab-pane v-for="item in tabsMenuList" :key="item.path" :label="item.title" :name="item.path" :closable="item.close">
                  <template #label>
                      <el-icon v-show="item.icon" class="tabs-icon">
                          <component :is="item.icon"></component>
                      </el-icon>
                      {{ item.title }}
                  </template>
              </el-tab-pane>
          </el-tabs>
      </div>
  </div>
</template>

<script setup lang="ts">
import Sortable from 'sortablejs';
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { TabsPaneContext, TabPaneName } from 'element-plus';

const route = useRoute();
const router = useRouter();

// 手动管理 tabsMenuList
const tabsMenuList = ref([
  {
      icon: 'HomeFilled',
      title: '首页',
      path: '/',
      name: 'home',
      close: true
  }
]);

const tabsMenuValue = ref(route.fullPath);

onMounted(() => {
  tabsDrop();
});

// 监听路由的变化
watch(
  () => route.fullPath,
  () => {
      if (route.meta.isFull) return;
      tabsMenuValue.value = route.fullPath;
      const tabsParams = {
          icon: route.meta.icon as string,
          title: route.meta.title as string,
          path: route.fullPath,
          name: route.name as string,
          close: !route.meta.isAffix
      };
      // 检查是否已存在该 tab
      const existingTabIndex = tabsMenuList.value.findIndex(item => item.path === tabsParams.path);
      if (existingTabIndex === -1) {
          tabsMenuList.value.push(tabsParams);
      }
  },
  { immediate: true }
);

// tabs 拖拽排序
const tabsDrop = () => {
  Sortable.create(document.querySelector('.el-tabs__nav') as HTMLElement, {
      draggable: '.el-tabs__item',
      animation: 300,
      onEnd({ newIndex, oldIndex }) {
          const tabsList = [...tabsMenuList.value];
          const currRow = tabsList.splice(oldIndex as number, 1)[0];
          tabsList.splice(newIndex as number, 0, currRow);
          tabsMenuList.value = tabsList;
      }
  });
};

// Tab Click
const tabClick = (tabItem: TabsPaneContext) => {
  const fullPath = tabItem.props.name as string;
  router.push(fullPath);
};

// Remove Tab
const tabRemove = (fullPath: TabPaneName) => {
  const index = tabsMenuList.value.findIndex(item => item.path === fullPath);
  if (index!== -1) {
      tabsMenuList.value.splice(index, 1);
      if (fullPath === route.fullPath) {
          if (tabsMenuList.value.length > 0) {
              const lastTab = tabsMenuList.value[tabsMenuList.value.length - 1];
              router.push(lastTab.path);
          } else {
              router.push('/');
          }
      }
  }
};
</script>

<style scoped lang="scss">
.tabs-box {
  background-color: var(--el-bg-color);
  .tabs-menu {
      position: relative;
      width: 100%;
      .el-dropdown {
          position: absolute;
          top: 8px;
          right: 13px;
      }
      :deep(.el-tabs) {
          .el-tabs__header {
              box-sizing: border-box;
              height: 40px;
              padding: 0 10px;
              margin: 0;
              .el-tabs__nav-wrap {
                  position: absolute;
                  width: calc(100% - 110px);
                  .el-tabs__nav {
                      display: flex;
                      border: none;
                      .el-tabs__item {
                          // 设置固定宽度
                          width: 150px;
                          // 或者设置最小宽度
                          // min-width: 150px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: #afafaf;
                          border: none;
                          .tabs-icon {
                              margin: 1.5px 4px 0 0;
                              font-size: 15px;
                          }
                          .is-icon-close {
                              margin-top: 1px;
                          }
                          &.is-active {
                              color: var(--el-color-primary);
                              &::before {
                                  position: absolute;
                                  bottom: 0;
                                  width: 100%;
                                  height: 0;
                                  content: '';
                                  border-bottom: 2px solid var(--el-color-primary) !important;
                              }
                          }
                      }
                  }
              }
          }
      }
  }
}
</style>
