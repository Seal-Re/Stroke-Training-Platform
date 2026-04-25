<template>
  <div class="tool-bar-lf">
      <!-- 使用 isCollapse 变量控制图标显示 -->
      <el-icon class="collapse-icon" @click="changeCollapse">
          <component :is="isCollapse ? 'expand' : 'fold'"></component>
      </el-icon>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 创建响应式变量 isCollapse 来控制侧边栏折叠状态
const isCollapse = ref(false);

// 修改后的切换折叠状态的函数
const changeCollapse = () => {
  isCollapse.value = !isCollapse.value;
};
</script>

<style scoped lang="scss">
.tool-bar-lf {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
}

.collapse-icon {
  margin-right: 20px;
  font-size: 22px;
  color: #303133;
  cursor: pointer;
}
</style>
