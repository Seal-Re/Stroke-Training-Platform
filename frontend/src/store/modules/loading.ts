import { defineStore } from 'pinia';

const useLoadingStore = defineStore('loading', {
    state: () => ({
        loadingState: false,
    }),
    actions: {
        showLoading(state) {
            state.loadingState = true;
        },
        hideLoading(state) {
            state.loadingState = false;
        },
    },
});

export default useLoadingStore;
