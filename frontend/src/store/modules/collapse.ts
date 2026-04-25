import { defineStore } from 'pinia';
const useCollapseStore = defineStore('collapse', {
    state: () => ({
        isCollapse: false,
    }),
    actions: {
        changeCollapse(state) {
            state.isCollapse = !state.isCollapse;
        },
    },
});

export default useCollapseStore;
