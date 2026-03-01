<template>
  <div id="join-panel">
    <h3>申請加入公會</h3>
    <input
      v-model="guildStore.joinUsername"
      placeholder="你的 GitHub username"
      maxlength="39"
      @keyup.enter="submitJoin"
    />
    <div class="btns">
      <button id="join-submit" @click="submitJoin">送出申請</button>
      <button id="join-cancel" @click="close">取消</button>
    </div>
    <div id="join-msg" :style="{ color: guildStore.joinMsgColor }">{{ guildStore.joinMsg }}</div>
  </div>
</template>

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
