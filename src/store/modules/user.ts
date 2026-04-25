import { defineStore } from 'pinia';
import { PersistenceOptions } from 'pinia-plugin-persistedstate';

/**
 * @description pinia 持久化参数配置
 * @param {String} key 存储到持久化的 name
 * @param {Array} paths
 * @return
 * */
const piniaPersistConfig = (key: string, paths?: string[]): PersistenceOptions => {
    const persist: PersistenceOptions = {
        key,
        storage: localStorage,
        ...(paths ? { paths } : {})
    };
    return persist;
};

interface UserInfo {
    // 定义 userInfo 的具体类型
    name?: string;
    age?: number;
    class?: number; // 添加 class 属性
}

const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        userInfo: '',
    }),
    actions: {
        setToken(token: string) {
            if (typeof token === 'string' && token.trim()!== '') {
                this.token = token;
            } else {
                throw new Error('无效的 token');
            }
        },
        setUserInfo(userInfo: UserInfo | string) {
            let userInfoStr;
            if (typeof userInfo === 'string') {
                userInfoStr = userInfo;
            } else {
                try {
                    userInfoStr = JSON.stringify(userInfo);
                } catch (error) {
                    throw new Error('无法将 userInfo 转换为字符串: ' + error);
                }
            }
            if (userInfoStr.trim()!== '') {
                this.userInfo = userInfoStr;
            } else {
                throw new Error('无效的用户信息');
            }
        },
        clearUserInfo() {
            this.token = '';
            this.userInfo = '';
        },
        getUserInfoObject(): UserInfo | null {
            try {
                return JSON.parse(this.userInfo);
            } catch (error) {
                console.error('无法解析 userInfo:', error);
                return null;
            }
        }
    },
    persist: piniaPersistConfig('user'),
});

export default useUserStore;

