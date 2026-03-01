<template>
  <div id="status-bar">
    <span id="conn-status">{{ statusText }}</span>
    <button id="join-btn" @click="guildStore.showJoinPanel = !guildStore.showJoinPanel">申請加入</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { guildStore } from '../store/guild'

const statusText = computed(() => {
  if (guildStore.connStatus === '● 已連線' && guildStore.memberCount > 0) {
    return `● 已連線  |  ${guildStore.memberCount} 位成員`
  }
  return guildStore.connStatus
})
</script>
