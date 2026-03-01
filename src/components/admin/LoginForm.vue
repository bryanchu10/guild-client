<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])
const apiBase = import.meta.env.VITE_API_URL || ''
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  if (!password.value) return
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${apiBase}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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

<template>
  <div class="max-w-[360px] mx-auto mt-20 font-mono text-fg">
    <h1 class="text-blue text-lg mb-6">⚔ Guild Hall 管理員</h1>
    <form class="flex gap-2" @submit.prevent="submit">
      <input
        v-model="password"
        type="password"
        class="flex-1 bg-surface border border-border text-fg px-2.5 py-1.5 rounded-md font-mono text-sm outline-none focus:border-blue"
        placeholder="管理員密碼"
        autocomplete="current-password"
      />
      <button
        type="submit"
        class="bg-[#238636] border border-[#238636] text-white py-1.5 px-4 rounded-md font-mono text-sm cursor-pointer disabled:opacity-50 disabled:cursor-default hover:bg-[#2ea043] hover:border-[#2ea043]"
        :disabled="loading"
      >登入</button>
    </form>
    <p v-if="error" class="text-red text-xs mt-2">{{ error }}</p>
  </div>
</template>
