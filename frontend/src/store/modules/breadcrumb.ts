import { defineStore } from 'pinia';

// 用于存储处理结果的缓存
let breadcrumbCache = null;

const getAllBreadcrumbList = (menuList, parent = [], result = {}) => {
    for (const item of menuList) {
        result[item.path] = [...parent, item];
        if (item.children) getAllBreadcrumbList(item.children, result[item.path], result);
    }
    return result;
};

const useBreadCrumb = defineStore('breadcrumb', {
    state: () => ({
        MenuList: [],
    }),
    getters: {
        // 递归处理后的所有面包屑导航列表
        breadcrumbListGet: (state) => (path) => {
            // 如果缓存为空或者菜单列表发生了变化，重新计算面包屑列表
            if (!breadcrumbCache || state.MenuList!== breadcrumbCache.menuList) {
                breadcrumbCache = {
                    menuList: state.MenuList,
                    breadcrumbMap: getAllBreadcrumbList(state.MenuList)
                };
            }
            // 获取指定路径的面包屑列表，如果不存在则返回空数组
            return breadcrumbCache.breadcrumbMap[path] || [];
        },
    },
    actions: {
        getMenuList(data) {
            this.MenuList = data;
            // 当菜单列表更新时，清空缓存
            breadcrumbCache = null;
        },
    },
});

export default useBreadCrumb;
