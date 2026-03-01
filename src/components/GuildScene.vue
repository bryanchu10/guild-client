<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Phaser from 'phaser'
import { guildStore } from '../store/guild'
import { Guild } from '../game/Guild'

let game = null
let ro = null
const sizerRef = ref(null)
const scale = ref(1)

function updateScale() {
  if (!sizerRef.value) return
  scale.value = Math.min(sizerRef.value.clientWidth / 800, 1)
}

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

  ro = new ResizeObserver(updateScale)
  ro.observe(sizerRef.value)
  updateScale()
})

onUnmounted(() => {
  ro?.disconnect()
  game?.destroy(true)
  game = null
  window._guild = null
})
</script>

<template>
  <div ref="sizerRef" class="w-full max-w-[800px] overflow-hidden" :style="{ height: `${480 * scale}px` }">
    <div
      class="game-inner relative w-[800px] h-[480px]"
      :class="guildStore.following ? 'cursor-default following' : 'cursor-grab'"
      :style="{ transform: `scale(${scale})`, transformOrigin: 'top left' }"
    >
      <div id="game-container"></div>

      <button
        v-if="guildStore.following"
        class="flex absolute top-2 right-2 items-center gap-1.5 z-10 bg-surface border border-blue text-muted py-[5px] px-[14px] rounded-md font-mono text-[11px] cursor-pointer hover:bg-[#1c2a3a] hover:text-fg"
        @click="unlockCamera"
      >✕ 解除追蹤 <span class="text-yellow">{{ guildStore.followName }}</span></button>

      <div class="absolute bottom-[78px] right-2 z-10 text-[9px] text-[#444] tracking-[1px]">MINIMAP</div>
      <canvas id="minimap" width="160" height="64" class="absolute bottom-2 right-2 z-10 border border-border rounded"></canvas>
    </div>
  </div>
</template>

<style scoped>
.game-inner:not(.following):active { cursor: grabbing; }
</style>
