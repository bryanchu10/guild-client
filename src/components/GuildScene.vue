<template>
  <div :class="['game-wrap', { following: guildStore.following }]">
    <div id="game-container"></div>

    <button v-if="guildStore.following" id="unlock-btn" @click="unlockCamera">
      ✕ 解除追蹤 <span id="follow-name">{{ guildStore.followName }}</span>
    </button>

    <div id="minimap-hint">MINIMAP</div>
    <canvas id="minimap" width="160" height="64"></canvas>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import Phaser from 'phaser'
import { guildStore } from '../store/guild'
import { Guild } from '../game/Guild'

let game = null

function unlockCamera() {
  window._guild?.unlockCamera()
}

onMounted(() => {
  game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 800,
    height: 480,
    parent: 'game-container',
    backgroundColor: '#1a0d00',
    scene: Guild,
  })
})

onUnmounted(() => {
  game?.destroy(true)
  game = null
  window._guild = null
})
</script>
