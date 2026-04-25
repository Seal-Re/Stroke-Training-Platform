import { defineStore } from 'pinia';
const getAllContainerList = (ContainerList, parent = [], result = {}) => {
    for (const item of ContainerList) {
        result[item.treePos] = [...parent, item];
        if (item.children) getAllContainerList(item.children, result[item.treePos], result);
    }
    return result;
};
const CalculateCellNum = (data, num = 0) => {
    if (data.level !== 6) {
        for (const item of data) {
            if (item.children) num = CalculateCellNum(item.children, num);
            else num = num + item.cells.length;
        }
    } else num = num + data.cells.length;

    return num;
};
const useContainerStore = defineStore('container', {
    state: () => ({
        ContainerList: [],
        displayItem: false,
        breadcrumbCell: '',
        list: { item: 25920, layer: 6480, frame: 1296, line: 324, box: 81 },
    }),
    getters: {
        // 递归处理后的所有面包屑导航列表
        ContainerListGet: (state) => (path) => {
            return getAllContainerList(state.ContainerList)[path];
        },
    },
    actions: {
        getContainerList(data) {
            this.ContainerList = data;
        },
        getCellsNum(data) {
            return CalculateCellNum(data);
        },
        getColor(data, n) {
            const m = CalculateCellNum(data);
            if (m < this.list[n] * 0.2) {
                return '#00ff00';
            } else if (m < this.list[n] * 0.8 && m > this.list[n] * 0.2) {
                return '#ff6600';
            } else {
                return '#ff0000';
            }
        },
        // 递归计算细胞数量
        getCellsNumRate(data, n) {
            return Math.floor((CalculateCellNum(data) * 10000) / this.list[n]) / 100 + '%';
        },
        addBreadCrumbCell(data) {
            this.breadcrumbCell = '';
            for (const i in data) {
                this.breadcrumbCell += '/' + data[i].label;
            }
        },
        judgeCellState(newCell, data) {
            for (const item of data) {
                if (item['位置'] === newCell['位置']) {
                    return false;
                }
            }
            return true;
        },
    },
});

export default useContainerStore;
