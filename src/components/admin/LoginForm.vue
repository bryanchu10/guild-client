<template>
  <div class="login-wrap">
    <h1>⚔ Guild Hall 管理員</h1>
    <form @submit.prevent="submit">
      <input
        v-model="password"
        type="password"
        placeholder="管理員密碼"
        autocomplete="current-password"
      />
      <button type="submit" :disabled="loading">登入</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  if (!password.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value }),
    })
    if (res.ok) {
      emit('login')
    } else {
      error.value = '密碼錯誤'
    }
  } catch {
    error.value = '無法連線至伺服器'
  } finally {
    loading.value = false
    password.value = ''
  }
}
</script>

<style scoped>
.login-wrap {
  max-width: 360px;
  margin: 80px auto;
  font-family: 'Courier New', monospace;
  color: #e6edf3;
}
h1 { color: #58a6ff; font-size: 18px; margin-bottom: 24px; }
form { display: flex; gap: 8px; }
input {
  flex: 1;
  background: #161b22; border: 1px solid #30363d;
  color: #e6edf3; padding: 6px 10px; border-radius: 6px;
  font-family: monospace; font-size: 13px; outline: none;
}
input:focus { border-color: #58a6ff; }
button {
  background: #238636; color: #fff; border: 1px solid #238636;
  padding: 6px 16px; border-radius: 6px;
  font-family: monospace; font-size: 13px; cursor: pointer;
}
button:disabled { opacity: 0.5; cursor: default; }
button:not(:disabled):hover { background: #2ea043; }
.error { color: #f85149; font-size: 12px; margin-top: 8px; }
</style>
