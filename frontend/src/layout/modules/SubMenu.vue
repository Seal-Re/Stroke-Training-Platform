<template>
    <template v-for="SubMenu in MenuList" :key="SubMenu.path">
        <el-sub-menu v-if="SubMenu.children?.length" :index="SubMenu.path">
            <template #title>
                <el-icon>
                    <component :is="SubMenu.meta.icon"></component>
                </el-icon>
                <span class="sle">{{ SubMenu.meta.title }}</span>
            </template>
            <sub-menu :MenuList="SubMenu.children"></sub-menu>
        </el-sub-menu>
        <el-menu-item v-else :index="SubMenu.path">
            <el-icon>
                <component :is="SubMenu.meta.icon"></component>
            </el-icon>
            <template #title>
                <span class="sle">{{ SubMenu.meta.title }}</span>
            </template>
        </el-menu-item>
    </template>
</template>
<script lang="ts" setup>
defineProps({
    MenuList: {
        type: Object,
        default: () => {},
    },
});
</script>
<style lang="scss">
.el-sub-menu .el-sub-menu__title:hover {
    color: #333333 !important;
    background-color: transparent !important;
}
.el-menu--collapse {
    .is-active {
        .el-sub-menu__title {
            color: #ffffff !important;
            background-color: var(--el-color-primary) !important;
        }
    }
}
.el-menu-item {
    &:hover {
        color: #333333;
    }
    &.is-active {
        color: var(--el-color-primary) !important;
        background-color: var(--el-color-primary-light-9) !important;
        &::before {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 4px;
            left: 0;
            content: '';
            background-color: var(--el-color-primary);
        }
    }
}
.vertical,
.classic,
.transverse {
    .el-menu-item {
        &.is-active {
            &::before {
                left: 0;
            }
        }
    }
}
.columns {
    .el-menu-item {
        &.is-active {
            &::before {
                right: 0;
            }
        }
    }
}
.classic,
.transverse {
    #driver-highlighted-element-stage {
        background-color: #606266 !important;
    }
}
</style>
