<script setup>
import { guildStore } from '../store/guild'

const apiBase = import.meta.env.VITE_API_URL || ''

function close() {
  guildStore.showJoinPanel = false
  guildStore.joinMsg = ''
}

async function submitJoin() {
  const username = guildStore.joinUsername.trim()
  if (!username) {
    guildStore.joinMsgColor = '#f85149'
    guildStore.joinMsg = '請輸入 GitHub username'
    return
  }
  try {
    const res = await fetch(`${apiBase}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    const data = await res.json()
    if (data.ok) {
      guildStore.joinMsgColor = '#3fb950'
      guildStore.joinMsg = data.message || '申請已送出！'
      localStorage.setItem('guild_username', username)
    } else {
      guildStore.joinMsgColor = '#f85149'
      guildStore.joinMsg = data.error || '發生錯誤'
    }
  } catch {
    guildStore.joinMsgColor = '#f85149'
    guildStore.joinMsg = '網路錯誤'
  }
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[100] w-[260px] bg-surface border border-border rounded-lg p-4 font-mono">
    <h3 class="text-fg text-[13px] mb-2.5">申請加入公會</h3>
    <input
      v-model="guildStore.joinUsername"
      class="w-full bg-canvas border border-border text-fg px-2 py-1.5 rounded-md font-mono text-xs outline-none mb-2 focus:border-blue"
      placeholder="你的 GitHub username"
      maxlength="39"
      @keyup.enter="submitJoin"
    />
    <div class="flex gap-1.5">
      <button class="flex-1 py-1.5 border-0 rounded-md font-mono text-xs cursor-pointer bg-[#238636] text-white hover:bg-[#2ea043]" @click="submitJoin">送出申請</button>
      <button class="flex-1 py-1.5 border-0 rounded-md font-mono text-xs cursor-pointer bg-[#21262d] text-muted" @click="close">取消</button>
    </div>
    <div class="text-[11px] mt-1.5 min-h-[16px]" :style="{ color: guildStore.joinMsgColor }">{{ guildStore.joinMsg }}</div>
  </div>
</template>
