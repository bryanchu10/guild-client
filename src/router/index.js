import { createRouter, createWebHistory } from 'vue-router'
const GuildView = () => import('../views/GuildView.vue')
const AdminView = () => import('../views/AdminView.vue')

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: GuildView },
    { path: '/admin', component: AdminView },
  ],
})
