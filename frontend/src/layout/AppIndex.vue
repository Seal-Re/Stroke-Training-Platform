<template>
  <el-container class="layout">
    <el-aside>
      <!-- 直接使用一个响应式变量来控制侧边栏宽度 -->
      <div class="aside-box" :style="{ width: isCollapse? '65px' : '300px' }">
        <div class="logo flx-center">
          <img class="logo-img" src="@/assets/icons/logo.svg" alt="logo" />
          <span v-show="!isCollapse" class="logo-text">{{ title }}</span>
        </div>
        <el-scrollbar>
          <el-menu :default-active="activeMenu" :router="true" :unique-opened="true" :collapse-transition="false" :collapse="isCollapse">
            <div class="menu-style">
              <!-- 动态生成菜单 -->
              <el-menu-item v-for="item in currentMenuList" :key="item.path" :index="item.path">
                <template #title>
                  <img
                    v-if="!isCollapse"
                    class="menu-icon"
                    :src="getIconSrc(item.path)"
                    alt="icon"
                  />
                  <el-icon v-else>
                    <component :is="getIconComponent(item.path)" />
                  </el-icon>
                  <span v-if="!isCollapse">{{ item.name }}</span>
                </template>
              </el-menu-item>
            </div>
          </el-menu>
        </el-scrollbar>
      </div>
    </el-aside>
    <el-container>
      <el-header>
        <div class="breadcrumb">
          <span v-for="(item, index) in breadcrumbList" :key="index">
            <router-link :to="item.path">{{ item.name }}</router-link>
            <span v-if="index < breadcrumbList.length - 1">/</span>
          </span>
        </div>
        <ToolBarRight />
      </el-header>
      <!-- 使用路由视图显示不同页面 -->
      <router-view></router-view>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ToolBarRight from '@/layout/modules/ToolBarRight.vue';
import { useBreadCrumb } from "@/store/index";
import { useUserStore } from "@/store/index";

// 定义不同 class 对应的菜单数据
const menuData: Record<0 | 1, { path: string; name: string }[]> = {
  0: [
    { path: '/home', name: '首页' },
    { path: '/evaluate', name: '认知评估' },
    { path: '/train', name: '认知训练' },
    { path: '/aiTips', name: 'AI建议' }
  ],
  1: [
    { path: '/home_doctor', name: '首页' },
    { path: '/doctor_pair', name: '医患配对' },
    { path: '/doctor_detail', name: '患者详情' },
    { path: '/doctor_evaluate', name: '评估情况' },
    { path: '/doctor_tips', name: '医生建议' }
  ]
};

const route = useRoute();
const breadcrumbStore = useBreadCrumb();
const userStore = useUserStore();

// 直接创建一个响应式变量来控制侧边栏是否折叠
const isCollapse = ref(false);

const title = '脑卒中认知康复系统';
const activeMenu = computed(() => route.path);

// 根据 userStore 中的 class 选择对应的菜单数据
const currentMenuList = computed(() => {
  const userClass = userStore.getUserInfoObject()?.class || 0;
  return menuData[userClass as 0 | 1] || [];
});

const icons = import.meta.glob('@/assets/icons/*.svg', { eager: true });

// 辅助函数：根据路径获取图标路径
const getIconSrc = (path: string) => {
  const iconMap: Record<string, string> = {
    '/home': '/src/assets/icons/home.svg',
    '/evaluate': '/src/assets/icons/evaluate.svg',
    '/train': '/src/assets/icons/train.svg',
    '/aiTips': '/src/assets/icons/AITips.svg',
    '/home_doctor': '/src/assets/icons/home.svg',
    '/doctor_pair': '/src/assets/icons/pair.svg',
    '/doctor_detail': '/src/assets/icons/detail.svg',
    '/doctor_evaluate': '/src/assets/icons/doctor_evaluate.svg',
    '/doctor_tips': '/src/assets/icons/doctorTips.svg'

  };

  // 转换为实际编译后的路径
  const rawPath = iconMap[path];
  if (!rawPath) return '';

  // 通过import.meta.glob获取编译后的路径
  return (icons[rawPath] as { default: string })?.default || '';
};
// 新增图标组件映射
const getIconComponent = (path: string) => {
  const iconMap: Record<string, any> = {
    '/home': 'House',
    '/home_doctor': 'House',
    '/evaluate': 'EditPen',
    '/train': 'Notebook',
    '/aiTips': 'MagicStick',
    '/doctorpair': 'pair',
    '/doctor_detail': 'detail',
    '/doctor_evaluate': 'evaluate'
  }
  return iconMap[path] || ''
}

// 初始化菜单数据
onMounted(() => {
  breadcrumbStore.getMenuList(currentMenuList.value);
});

// 获取当前路径的面包屑列表
const breadcrumbList = computed(() => {
  return breadcrumbStore.breadcrumbListGet(route.path) || [];
});
</script>

<style scoped lang="scss">
@import './index.scss';

// 自定义菜单样式
.menu-style {
 .el-menu-item {
    // 正常状态样式
    background-color: #f4f4f4;
    color: #333;
    border-radius: 4px;
    margin: 8px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #e0e0e0;
    }

    // 激活状态样式
    &.is-active {
      background-color: #007bff;
      color: #fff;

      i {
        color: #fff;
      }

     .menu-icon {
        filter: brightness(0) invert(1); // 让激活状态下图标颜色变白
      }
    }
  }

 .menu-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    vertical-align: middle;
  }
}

.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.breadcrumb {
  display: flex;
  align-items: center;
  margin-left: 20px;
  a {
    color: var(--el-header-text-color);
    margin-right: 5px;
  }
  span {
    margin-right: 5px;
  }
  order: -1; // 将面包屑区域置于最左边
}
</style>
