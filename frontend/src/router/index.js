import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/store/index';


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      {
        path:'/',
        redirect:() =>{
          const isLoggedIn =useUserStore().loginStatus
          return isLoggedIn ? '/home':'/login'
        },
      },
      {
        path:'/login',
        name:'Login',
        component: () => import('@/views/Login/AppIndex.vue'),
        meta: {
          title: '登陆',
          layout: false,
        },
      },
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/Home/AppIndex.vue'),
        meta: {
          title: '首页',
          layout: true,
          icon: 'HomeFilled',
        },
      },
      {
        path: '/home_doctor',
        name: 'Home_doctor',
        component: () => import('@/views/Home/AppIndexDoctor.vue'),
        meta: {
          title: '首页',
          layout: true,
        },
      },
      {
        path: '/evaluate',
        name: 'Evaluate',
        component: () => import('@/views/Evaluate/AppIndex.vue'),
        meta: {
          title: '认知评估',
          layout: true,
        },
      },
      {
        path: '/train',
        name: 'Train',
        component: () => import('@/views/Train/AppIndex.vue'),
        meta: {
          title: '认知训练',
          layout: true,
        },
      },
      {
        path: '/aiTips',
        name: 'AITips',
        component: () => import('@/views/AITips/AppIndex.vue'),
        meta: {
          title: 'AI建议',
          layout: true,
        },
      },
      {
        path: '/userinfo',
        name: 'Userinfo',
        component: () => import('@/views/Userinfo/AppIndex.vue'),
        meta: {
          title: '用户信息',
          layout: true,
        },
      },
      {
        path: '/doctor_pair',
        name: 'Doctorpair',
        component: () => import('@/views/DoctorPair/AppIndex.vue'),
        meta: {
          title: '医患配对',
          layout: true,
        },
      },
      {
        path: '/doctor_detail',
        name: 'DoctorPatientDetail',
        component: () => import('@/views/DoctorPatientDetail/AppIndex.vue'),
        meta: {
          title: '患者详情',
          layout: true,
        },
      },
      {
        path: '/doctor_evaluate',
        name: 'DoctorEvaluate',
        component: () => import('@/views/DoctorEvaluate/AppIndex.vue'),
        meta: {
          title: '患者评估情况',
          layout: true,
        },
      },
      {
        path: '/doctor_tips',
        name: 'DoctorTips',
        component: () => import('@/views/DoctorTips/AppIndex.vue'),
        meta: {
          title: '医生建议',
          layout: true,
        },
      },
      {
        path: '/RecordTest',
        name: 'RecordTest',
        component: () => import('@/views/RecordTest/AppIndex.vue'),
        meta: {
          title: '录音测试',
          layout: true,
        },
      }
    ]
  });

  router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    const isLoggedIn = userStore.loginStatus;

    if (to.name === 'Login' && isLoggedIn) {
        // 如果已经登录，访问登录页则重定向到主页
        next('/home');
    }
    else {
      // 其他情况正常放行
      next();
    }
});

export default router;
