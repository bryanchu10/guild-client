<script setup>
import { guildStore } from '../store/guild'
</script>

<template>
  <div class="flex justify-between items-center w-full max-w-[800px]">
    <div class="flex items-center gap-3 text-[11px] text-muted">
      <span>{{ guildStore.connStatus }}</span>
      <span v-if="guildStore.memberCount > 0" class="text-[#555]">|</span>
      <span v-if="guildStore.memberCount > 0">公會成員 {{ guildStore.memberCount }} 人</span>
      <span v-if="guildStore.viewerCount > 0" class="text-[#555]">|</span>
      <span v-if="guildStore.viewerCount > 0">{{ guildStore.viewerCount }} 人在線</span>
    </div>
    <button
      class="bg-transparent border border-border text-muted px-3 py-1 rounded-md font-mono text-[11px] cursor-pointer hover:border-blue hover:text-blue"
      @click="guildStore.showJoinPanel = !guildStore.showJoinPanel"
    >加入</button>
  </div>
</template>
