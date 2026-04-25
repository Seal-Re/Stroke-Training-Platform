import { defineStore } from 'pinia';
import { PersistenceOptions } from 'pinia-plugin-persistedstate';

// 定义持久化配置函数
const piniaPersistConfig = (key: string, paths?: string[]): PersistenceOptions => {
    const persist: PersistenceOptions = {
        key,
        storage: localStorage,
        ...(paths? { paths } : {})
    };
    return persist;
};

// 定义 usequestion_trainStore 存储，使用不同的 ID
const usequestion_trainStore = defineStore('question_train', {
    state: () => ({
        questionList: [],
        currentIndex: 0,
        currentPageIndex: 0,
        answerRecords: [],
        answerResults: []
    }),
    actions: {
        setQuestionList(list: any[]) {
            this.questionList = list;
        },
        setCurrentIndex(index: number) {
            this.currentIndex = index;
        },
        setCurrentPageIndex(pageIndex: number) {
            this.currentPageIndex = pageIndex;
        },
        setAnswerRecords(records: any[]) {
            this.answerRecords = records;
        },
        setAnswerResults(results: any[]) {
            this.answerResults = results;
        },
        resetState() {
            this.questionList = [];
            this.currentIndex = 0;
            this.currentPageIndex = 0;
            this.answerRecords = [];
            this.answerResults = [];
        }
    },
    persist: piniaPersistConfig('question_train', [
        'questionList',
        'currentIndex',
        'currentPageIndex',
        'answerRecords',
        'answerResults'
    ])
});

export default usequestion_trainStore;
