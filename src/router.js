import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('./views/Contact.vue')
    },
    {
      path: '/transfer',
      name: 'transfer',
      component: () => import('./views/Transfer.vue')
    },
    {
      path: '/setting',
      name: 'setting',
      component: () => import('./views/Setting.vue')
    }
  ]
})
