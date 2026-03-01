<template>
  <h1>⚔  G I T H U B   G U I L D   H A L L  ⚔</h1>
  <StatusBar />
  <GuildScene />
  <ActivityLog />
  <JoinPanel v-if="guildStore.showJoinPanel" />
  <InstallBanner v-if="guildStore.showInstallBanner" />
</template>

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
