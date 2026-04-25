import { defineStore } from 'pinia';
import { PersistenceOptions } from 'pinia-plugin-persistedstate';

// 定义 pinia 持久化参数配置函数
const piniaPersistConfig = (key: string, paths?: string[]): PersistenceOptions => {
    const persist: PersistenceOptions = {
        key,
        storage: localStorage,
       ...(paths? { paths } : {})
    };
    return persist;
};

// 定义患者信息的类型
interface Patient {
    username: string;
    name: string;
}

interface PatientStoreState {
    patients: Patient[];
    filteredPatients: Patient[];
}

export const usePatientStore = defineStore('patient', {
    state: (): PatientStoreState => ({
        patients: [],
        filteredPatients: []
    }),
    actions: {
        // 设置所有患者信息
        setPatients(patientData: Patient[]) {
            this.patients = patientData;
            this.filteredPatients = patientData;
        },
        // 根据搜索关键词过滤患者信息
        filterPatients(searchQuery: string) {
            if (searchQuery === '') {
                this.filteredPatients = this.patients;
            } else {
                this.filteredPatients = this.patients.filter(patient =>
                    patient.name.includes(searchQuery)
                );
            }
        },
        // 获取当前页的患者信息
        getCurrentPagePatients(currentPage: number, pageSize: number) {
            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;
            return this.filteredPatients.slice(start, end);
        }
    },
    persist: piniaPersistConfig('patient', [
        'patients'
    ])
});

export default usePatientStore;
