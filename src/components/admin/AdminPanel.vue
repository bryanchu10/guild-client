<template>
  <div class="admin-wrap">
    <div class="header">
      <h1>⚔ Guild Hall 管理員</h1>
      <button class="logout" @click="logout">登出</button>
    </div>

    <!-- 直接新增成員 -->
    <h2>直接新增成員</h2>
    <div class="add-form">
      <input
        v-model="addUsername"
        placeholder="GitHub username"
        maxlength="39"
        @keydown.enter="addMember"
      />
      <button @click="addMember">新增核准</button>
    </div>
    <p class="msg" :class="addMsgType">{{ addMsg }}</p>

    <!-- 待審申請 -->
    <h2>待審申請 <span class="count">({{ pending.length }})</span></h2>
    <div v-if="!pending.length" class="empty">無待審申請</div>
    <div v-for="u in pending" :key="u" class="card">
      <span class="username">{{ u }}</span>
      <span class="badge pending">待審</span>
      <button class="approve" @click="approve(u)">核准</button>
      <button class="danger" @click="remove(u)">拒絕</button>
    </div>

    <!-- 已核准成員 -->
    <h2>已核准成員 <span class="count">({{ approved.length }})</span></h2>
    <div v-if="!approved.length" class="empty">尚無成員</div>
    <div v-for="u in approved" :key="u" class="card">
      <span class="username">{{ u }}</span>
      <span class="badge approved">已核准</span>
      <a :href="`https://github.com/${u}`" target="_blank"><button>GitHub ↗</button></a>
      <button class="danger" @click="remove(u)">移除</button>
    </div>

    <!-- 測試事件 -->
    <h2>測試事件 <span class="dev-tag">開發用</span></h2>
    <div class="test-form">
      <div class="test-row">
        <label>Actor</label>
        <input v-model="testActor" list="member-datalist" placeholder="GitHub username" />
        <datalist id="member-datalist">
          <option v-for="u in approved" :key="u" :value="u" />
        </datalist>
      </div>
      <div class="test-row">
        <label>事件類型</label>
        <select v-model="testEvent">
          <option v-for="(_, key) in PRESETS" :key="key" :value="key">
            {{ PRESETS[key].icon }} {{ key }}
          </option>
        </select>
      </div>
      <div class="test-row">
        <label>Target</label>
        <input v-model="testTarget" list="member-datalist" placeholder="留空=自身事件 / 不存在的名字=走出大門" />
      </div>
      <div class="test-row">
        <label>匿名</label>
        <input type="checkbox" v-model="testAnon" />
        <span class="hint">勾選後 actor 視為非公會成員（灰色 ??? 角色進場），target 須填公會成員</span>
      </div>
      <button class="fire-btn" @click="fireTest">▶ 觸發</button>
    </div>
    <p class="msg" :class="testMsgType">{{ testMsg }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['logout'])

const approved = ref([])
const pending = ref([])
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
  const res = await fetch('/api/members')
  if (!res.ok) return
  const data = await res.json()
  approved.value = data.approved || []
  pending.value = data.pending || []
}

async function approve(username) {
  await fetch(`/api/members/${username}/approve`, { method: 'POST' })
  loadMembers()
}

async function remove(username) {
  if (!confirm(`確定要移除 ${username}？`)) return
  await fetch(`/api/members/${username}`, { method: 'DELETE' })
  loadMembers()
}

async function addMember() {
  const username = addUsername.value.trim()
  if (!username) return
  const res = await fetch('/api/members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const res = await fetch('/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  await fetch('/api/admin/logout', { method: 'POST' })
  emit('logout')
}

onMounted(() => {
  loadMembers()
  setInterval(loadMembers, 15000)
})
</script>

<style scoped>
.admin-wrap {
  max-width: 700px;
  margin: 0 auto;
  padding: 32px;
  font-family: 'Courier New', monospace;
  color: #e6edf3;
  background: #0d1117;
  min-height: 100vh;
}
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
h1 { color: #58a6ff; font-size: 18px; }
h2 { color: #8b949e; font-size: 13px; margin: 24px 0 10px; text-transform: uppercase; letter-spacing: 1px; }
.count { font-weight: normal; }
.dev-tag { color: #f0883e; font-size: 10px; text-transform: none; }
.card {
  background: #161b22; border: 1px solid #30363d;
  border-radius: 8px; padding: 14px 16px; margin-bottom: 8px;
  display: flex; align-items: center; gap: 12px;
}
.username { flex: 1; font-size: 14px; }
.badge {
  font-size: 10px; padding: 2px 8px; border-radius: 10px;
  background: #21262d; color: #8b949e;
}
.badge.approved { background: #1a3a24; color: #3fb950; }
.badge.pending  { background: #2a1f00; color: #f0883e; }
button {
  background: none; border: 1px solid #30363d; color: #8b949e;
  padding: 4px 12px; border-radius: 6px;
  font-family: monospace; font-size: 11px; cursor: pointer;
}
button:hover { border-color: #58a6ff; color: #58a6ff; }
button.danger:hover  { border-color: #f85149; color: #f85149; }
button.approve:hover { border-color: #3fb950; color: #3fb950; }
button.logout { font-size: 12px; }
.add-form { display: flex; gap: 8px; margin-top: 10px; }
.add-form input {
  flex: 1; background: #161b22; border: 1px solid #30363d;
  color: #e6edf3; padding: 6px 10px; border-radius: 6px;
  font-family: monospace; font-size: 13px; outline: none;
}
.add-form input:focus { border-color: #58a6ff; }
.add-form button { background: #238636; color: #fff; border-color: #238636; }
.add-form button:hover { background: #2ea043; border-color: #2ea043; color: #fff; }
.msg { font-size: 12px; color: #8b949e; margin-top: 8px; min-height: 18px; }
.msg.ok  { color: #3fb950; }
.msg.err { color: #f85149; }
.empty { color: #444; font-size: 13px; padding: 12px 0; }
.test-form { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.test-row { display: flex; align-items: center; gap: 10px; }
.test-row label:first-child { width: 80px; font-size: 12px; color: #8b949e; flex-shrink: 0; }
.test-row input:not([type=checkbox]), .test-row select {
  flex: 1; background: #161b22; border: 1px solid #30363d;
  color: #e6edf3; padding: 5px 8px; border-radius: 6px;
  font-family: monospace; font-size: 12px; outline: none;
}
.test-row input:focus, .test-row select:focus { border-color: #58a6ff; }
.hint { font-size: 10px; color: #444; }
.fire-btn { background: #1f2d3d; border-color: #58a6ff; color: #58a6ff; margin-top: 4px; }
.fire-btn:hover { background: #58a6ff; color: #0d1117; }
</style>
