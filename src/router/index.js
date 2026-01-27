import { createRouter, createWebHashHistory } from 'vue-router'
import LoginForm from '../components/Auth/LoginForm.vue'
import RegisterForm from '../components/Auth/RegisterForm.vue'
import Home from '../components/MainLayout/MainLayout.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/LoginForm',
      name: 'LoginForm',
      component: LoginForm
    },
    {
      path: '/RegisterForm',
      name: 'RegisterForm',
      component: RegisterForm
    },
    {
      path: '/',
      name: 'Home',
      component: Home
    },
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.name !== 'LoginForm' && to.name !== 'RegisterForm' && !token) {
    // 如果没有 token 且不是登录或注册页面，重定向到登录页面
    next({ name: 'LoginForm' })
  } else if ((to.name == 'LoginForm' || to.name == 'RegisterForm') && token) {
    // 如果是登录或注册页面且有 token，重定向到首页
    next({ name: 'Home' })
  } else {
    // 否则继续导航
    next()
  }
})

export default router