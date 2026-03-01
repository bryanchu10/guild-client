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

<template>
  <div class="flex justify-between items-center w-full max-w-[800px]">
    <span class="text-[11px] text-muted">{{ statusText }}</span>
    <button
      class="bg-transparent border border-border text-muted px-3 py-1 rounded-md font-mono text-[11px] cursor-pointer hover:border-blue hover:text-blue"
      @click="guildStore.showJoinPanel = !guildStore.showJoinPanel"
    >加入</button>
  </div>
</template>
