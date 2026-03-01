<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['logout'])

const apiBase = import.meta.env.VITE_API_URL || ''
const approved = ref([])
const addUsername = ref('')
const addMsg = ref('')
const addMsgType = ref('')
const testActor = ref('')
const testEvent = ref('push')
const testTarget = ref('')
const testAnon = ref(false)
const testMsg = ref('')
const testMsgType = ref('')

const PRESETS = {
  'push':           { icon: '📦', css: 'push',   col: 0xf0883e, msg: 'pushed 3 commits to test-repo/main' },
  'pr-open':        { icon: '🔀', css: 'pr',     col: 0xa371f7, msg: 'opened PR #42 on test-repo: Add feature' },
  'pr-merge':       { icon: '✅', css: 'merge',  col: 0x3fb950, msg: 'merged PR #42 on test-repo' },
  'pr-close':       { icon: '🚫', css: 'pr',     col: 0xf85149, msg: 'closed PR #42 on test-repo' },
  'review-approve': { icon: '👀', css: 'review', col: 0x58a6ff, msg: 'PR #42 on test-repo: LGTM! 👍' },
  'review-changes': { icon: '👀', css: 'review', col: 0x58a6ff, msg: 'PR #42 on test-repo: needs changes 🔧' },
  'issue-open':     { icon: '🐛', css: 'bug',    col: 0xf85149, msg: 'opened issue #10 on test-repo: Bug found' },
  'issue-close':    { icon: '🔒', css: 'merge',  col: 0x3fb950, msg: 'closed issue #10 on test-repo' },
  'comment':        { icon: '💬', css: 'review', col: 0x58a6ff, msg: 'commented on test-repo #10' },
  'fork':           { icon: '🍴', css: 'pr',     col: 0xa371f7, msg: 'forked someone/test-repo' },
  'star':           { icon: '⭐', css: 'review', col: 0xf5d076, msg: 'starred test-repo' },
  'release':        { icon: '🚀', css: 'merge',  col: 0x3fb950, msg: 'released v1.0.0 on test-repo' },
}

async function loadMembers() {
  const res = await fetch(`${apiBase}/api/members`, { credentials: 'include' })
  if (!res.ok) return
  const data = await res.json()
  approved.value = data.approved || []
}

async function remove(username) {
  if (!confirm(`確定要移除 ${username}？`)) return
  await fetch(`${apiBase}/api/members/${username}`, { method: 'DELETE', credentials: 'include' })
  loadMembers()
}

async function addMember() {
  const username = addUsername.value.trim()
  if (!username) return
  const res = await fetch(`${apiBase}/api/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username }),
  })
  const data = await res.json()
  if (data.ok) {
    addMsgType.value = 'ok'
    addMsg.value = `✓ ${username} 已新增`
    addUsername.value = ''
    loadMembers()
  } else {
    addMsgType.value = 'err'
    addMsg.value = data.error || '新增失敗'
  }
}

async function fireTest() {
  const actor = testActor.value.trim()
  if (!actor) {
    testMsgType.value = 'err'
    testMsg.value = '請填寫 Actor'
    return
  }
  const preset = PRESETS[testEvent.value]
  const action = { ...preset, targetActor: testTarget.value.trim() || null }
  const res = await fetch(`${apiBase}/api/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ actor, anonymous: testAnon.value, action }),
  })
  const data = await res.json()
  if (data.ok) {
    testMsgType.value = 'ok'
    testMsg.value = `✓ 已觸發：${actor} → ${testEvent.value}${testTarget.value ? ' → ' + testTarget.value : ''}`
  } else {
    testMsgType.value = 'err'
    testMsg.value = data.error || '觸發失敗'
  }
}

async function logout() {
  await fetch(`${apiBase}/api/admin/logout`, { method: 'POST', credentials: 'include' })
  emit('logout')
}

onMounted(() => {
  loadMembers()
  setInterval(loadMembers, 15000)
})
</script>

<template>
  <div class="max-w-[700px] mx-auto p-8 font-mono text-fg bg-canvas min-h-screen">

    <div class="flex items-center justify-between mb-6">
      <h1 class="text-blue text-lg">⚔ Guild Hall 管理員</h1>
      <button class="btn-admin text-xs" @click="logout">登出</button>
    </div>

    <!-- 直接新增成員 -->
    <h2 class="text-muted text-[13px] mt-6 mb-2.5 uppercase tracking-[1px]">直接新增成員</h2>
    <div class="flex gap-2">
      <input
        v-model="addUsername"
        class="flex-1 bg-surface border border-border text-fg px-2.5 py-1.5 rounded-md font-mono text-sm outline-none focus:border-blue"
        placeholder="GitHub username"
        maxlength="39"
        @keydown.enter="addMember"
      />
      <button
        class="bg-[#238636] border border-[#238636] text-white px-3 py-1 rounded-md font-mono text-[11px] cursor-pointer hover:bg-[#2ea043] hover:border-[#2ea043]"
        @click="addMember"
      >新增核准</button>
    </div>
    <p
      class="text-xs mt-2 min-h-[18px]"
      :class="addMsgType === 'ok' ? 'text-green' : addMsgType === 'err' ? 'text-red' : 'text-muted'"
    >{{ addMsg }}</p>

    <!-- 成員 -->
    <h2 class="text-muted text-[13px] mt-6 mb-2.5 uppercase tracking-[1px]">
      已核准成員 <span class="font-normal">({{ approved.length }})</span>
    </h2>
    <div v-if="!approved.length" class="text-[#444] text-[13px] py-3">尚無成員</div>
    <div v-for="u in approved" :key="u" class="flex items-center gap-3 bg-surface border border-border rounded-lg py-3.5 px-4 mb-2">
      <span class="flex-1 text-sm">{{ u }}</span>
      <span class="text-[10px] py-0.5 px-2 rounded-[10px] bg-[#1a3a24] text-green">已核准</span>
      <a :href="`https://github.com/${u}`" target="_blank"><button class="btn-admin">GitHub ↗</button></a>
      <button class="btn-danger" @click="remove(u)">移除</button>
    </div>

    <!-- 測試事件 -->
    <h2 class="text-muted text-[13px] mt-6 mb-2.5 uppercase tracking-[1px]">
      測試事件 <span class="text-orange text-[10px] normal-case">開發用</span>
    </h2>
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2.5">
        <label class="w-20 text-xs text-muted shrink-0">Actor</label>
        <input v-model="testActor" list="member-datalist" placeholder="GitHub username" class="admin-input" />
        <datalist id="member-datalist">
          <option v-for="u in approved" :key="u" :value="u" />
        </datalist>
      </div>
      <div class="flex items-center gap-2.5">
        <label class="w-20 text-xs text-muted shrink-0">事件類型</label>
        <select v-model="testEvent" class="admin-input">
          <option v-for="(p, key) in PRESETS" :key="key" :value="key">{{ p.icon }} {{ key }}</option>
        </select>
      </div>
      <div class="flex items-center gap-2.5">
        <label class="w-20 text-xs text-muted shrink-0">Target</label>
        <input v-model="testTarget" list="member-datalist" placeholder="留空=自身事件 / 不存在的名字=走出大門" class="admin-input" />
      </div>
      <div class="flex items-center gap-2.5">
        <label class="w-20 text-xs text-muted shrink-0">匿名</label>
        <input type="checkbox" v-model="testAnon" />
        <span class="text-[10px] text-[#444]">勾選後 actor 視為非公會成員（灰色 ??? 角色進場），target 須填公會成員</span>
      </div>
      <button
        class="bg-[#1f2d3d] border border-blue text-blue px-3 py-1 rounded-md font-mono text-[11px] cursor-pointer mt-1 hover:bg-blue hover:text-canvas"
        @click="fireTest"
      >▶ 觸發</button>
    </div>
    <p
      class="text-xs mt-1.5 min-h-[18px]"
      :class="testMsgType === 'ok' ? 'text-green' : testMsgType === 'err' ? 'text-red' : 'text-muted'"
    >{{ testMsg }}</p>

  </div>
</template>
