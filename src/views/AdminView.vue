<template>
  <LoginForm v-if="!loggedIn" @login="onLogin" />
  <AdminPanel v-else @logout="onLogout" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginForm from '../components/admin/LoginForm.vue'
import AdminPanel from '../components/admin/AdminPanel.vue'

const loggedIn = ref(false)

onMounted(async () => {
  // 嘗試 GET /api/members；成功 → session 有效，直接進面板
  const res = await fetch('/api/members')
  if (res.ok) loggedIn.value = true
})

function onLogin() {
  loggedIn.value = true
}

function onLogout() {
  loggedIn.value = false
}
</script>
