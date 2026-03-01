<script setup>
import { ref, onMounted } from 'vue'
import LoginForm from '../components/admin/LoginForm.vue'
import AdminPanel from '../components/admin/AdminPanel.vue'

const apiBase = import.meta.env.VITE_API_URL || ''
const loggedIn = ref(false)

onMounted(async () => {
  const res = await fetch(`${apiBase}/api/members`)
  if (res.ok) loggedIn.value = true
})

function onLogin() {
  loggedIn.value = true
}

function onLogout() {
  loggedIn.value = false
}
</script>

<template>
  <LoginForm v-if="!loggedIn" @login="onLogin" />
  <AdminPanel v-else @logout="onLogout" />
</template>
