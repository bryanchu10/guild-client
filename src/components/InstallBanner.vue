<script setup>
import { guildStore } from '../store/guild'
</script>

<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-[#1f2937] border border-orange rounded-lg py-2.5 px-[18px] text-orange text-xs font-mono whitespace-nowrap">
    請安裝 GitHub App 以讓活動出現在大廳：
    <a :href="`https://github.com/apps/${guildStore.appSlug}/installations/new`" target="_blank" class="text-blue">點此安裝</a>
  </div>
</template>
