<template>
  <div id="log">
    <span v-if="guildStore.logEntries.length === 0" style="color:#444">// 等待成員活動...</span>
    <div
      v-for="(e, i) in guildStore.logEntries"
      :key="i"
      :class="['le', e.css]"
    >{{ e.text }}</div>
  </div>
</template>

<script setup>
import { guildStore } from '../store/guild'
</script>
