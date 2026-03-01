<template>
  <div id="install-banner">
    請安裝 GitHub App 以讓活動出現在大廳：
    <a :href="`https://github.com/apps/${guildStore.appSlug}/installations/new`" target="_blank">點此安裝</a>
  </div>
</template>

<script setup>
import { guildStore } from '../store/guild'
</script>
