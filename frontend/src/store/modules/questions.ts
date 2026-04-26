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

// 定义 useQuestionStore 存储
const useQuestionStore = defineStore('question', {
    state: () => ({
        questionList: [], // 题目列表
        currentIndex: 0, // 当前题目索引
        currentPageIndex: 0, // 当前页码索引
        answerRecords: [], // 记录每道题的作答情况
        answerResults: [] // 记录每道题的作答结果（正确或错误）
    }),
    actions: {
        // 设置题目列表
        setQuestionList(list: any[]) {
            this.questionList = list;
        },
        // 设置当前题目索引
        setCurrentIndex(index: number) {
            this.currentIndex = index;
        },
        // 设置当前页码索引
        setCurrentPageIndex(pageIndex: number) {
            this.currentPageIndex = pageIndex;
        },
        // 设置作答记录
        setAnswerRecords(records: any[]) {
            this.answerRecords = records;
        },
        // 设置作答结果
        setAnswerResults(results: any[]) {
            this.answerResults = results;
        },
        // 重置所有状态
        resetState() {
            this.questionList = [];
            this.currentIndex = 0;
            this.currentPageIndex = 0;
            this.answerRecords = [];
            this.answerResults = [];
        }
    },
    persist: piniaPersistConfig('question', [
        'questionList',
        'currentIndex',
        'currentPageIndex',
        'answerRecords',
        'answerResults'
    ])
});

export default useQuestionStore;
