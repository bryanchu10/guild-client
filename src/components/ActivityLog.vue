<script setup>
import { guildStore } from '../store/guild'
</script>

<template>
  <div class="w-[800px] bg-surface border border-border rounded-md px-3 py-1.5 min-h-[52px] max-h-[52px] overflow-hidden">
    <span v-if="guildStore.logEntries.length === 0" class="text-[#444]">// 等待成員活動...</span>
    <div
      v-for="(e, i) in guildStore.logEntries"
      :key="i"
      :class="['text-[11px] py-px', e.css]"
    >{{ e.text }}</div>
  </div>
</template>
