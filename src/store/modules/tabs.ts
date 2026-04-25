import { defineStore } from 'pinia';
/* tabsMenuProps */
interface TabsMenuProps {
    icon: string;
    title: string;
    path: string;
    name: string;
    close: boolean;
}

interface TabsState {
    tabsMenuList: TabsMenuProps[];
}

const useTabsStore = defineStore('tabs', {
    state: (): TabsState => ({
        tabsMenuList: [],
    }),
    actions: {
        // Add Tabs
        async addTabs(tabItem: TabsMenuProps) {
            if (this.tabsMenuList.every((item) => item.path !== tabItem.path)) {
                this.tabsMenuList.push(tabItem);
            }
        },
        // Remove Tabs
        async removeTabs(params) {
            const tabPath = params.tabPath;
            const isCurrent = params.isCurrent;
            const router = params.router;

            const tabsMenuList = this.tabsMenuList;
            if (isCurrent) {
                tabsMenuList.forEach((item, index) => {
                    if (item.path !== tabPath) return;
                    const nextTab = tabsMenuList[index + 1] || tabsMenuList[index - 1];
                    if (!nextTab) return;
                    router.push(nextTab.path);
                });
            }
            this.tabsMenuList = tabsMenuList.filter((item) => item.path !== tabPath);
        },
        // Set Tabs
        async setTabs(tabsMenuList: TabsMenuProps[]) {
            this.tabsMenuList = tabsMenuList;
        },
    },
});

export default useTabsStore;
