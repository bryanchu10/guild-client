<script setup>
import { guildStore } from '../store/guild'
import { useGuildWS } from '../composables/useGuildWS'
import StatusBar from '../components/StatusBar.vue'
import GuildScene from '../components/GuildScene.vue'
import ActivityLog from '../components/ActivityLog.vue'
import JoinPanel from '../components/JoinPanel.vue'
import InstallBanner from '../components/InstallBanner.vue'

useGuildWS()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen gap-2 font-mono select-none">
    <h1 class="text-blue text-base tracking-[3px]">⚔  G I T H U B   G U I L D   H A L L  ⚔</h1>
    <StatusBar />
    <GuildScene />
    <ActivityLog />
    <JoinPanel v-if="guildStore.showJoinPanel" />
    <InstallBanner v-if="guildStore.showInstallBanner" />
  </div>
</template>
