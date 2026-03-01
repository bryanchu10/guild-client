<script setup>
import { ref, onMounted } from 'vue'
import { guildStore } from '../store/guild'

const apiBase = import.meta.env.VITE_API_URL || ''

const state = ref('loading')  // loading | available | full | error
const count = ref(0)
const limit = ref(300)

function close() {
  guildStore.showJoinPanel = false
}

onMounted(async () => {
  try {
    const res = await fetch(`${apiBase}/api/capacity`)
    if (!res.ok) throw new Error()
    const data = await res.json()
    count.value = data.count
    limit.value = data.limit
    state.value = data.isFull ? 'full' : 'available'
  } catch {
    state.value = 'error'
  }
})
</script>

<template>
  <div class="fixed bottom-6 right-6 z-[100] w-[280px] bg-surface border border-border rounded-lg p-4 font-mono">
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-fg text-[13px]">加入公會</h3>
      <button class="text-muted text-xs hover:text-fg" @click="close">✕</button>
    </div>

    <div v-if="state === 'loading'" class="text-muted text-xs py-2">檢查人數中...</div>

    <div v-else-if="state === 'error'" class="text-red text-xs py-2">無法連線，請稍後再試</div>

    <div v-else-if="state === 'full'" class="text-xs py-1">
      <p class="text-orange mb-1">公會已達人數上限</p>
      <p class="text-muted">{{ count }} / {{ limit }} 位成員</p>
    </div>

    <div v-else class="text-xs">
      <p class="text-muted mb-3">安裝 GitHub App，你的 GitHub 活動將即時出現在大廳。卸載即自動退出公會。</p>
      <p class="text-[#444] mb-3">{{ count }} / {{ limit }} 位成員</p>
      <a
        v-if="guildStore.appSlug"
        :href="`https://github.com/apps/${guildStore.appSlug}/installations/new`"
        target="_blank"
        class="block text-center py-1.5 rounded-md bg-[#238636] text-white hover:bg-[#2ea043] cursor-pointer"
        @click="close"
      >安裝 GitHub App →</a>
      <p v-else class="text-[#444]">（GitHub App 尚未設定）</p>
    </div>
  </div>
</template>
