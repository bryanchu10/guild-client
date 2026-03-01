import { onMounted, onUnmounted } from 'vue'
import { guildStore } from '../store/guild'

export function useGuildWS() {
  let ws = null
  let reconnectTimer = null

  function connect() {
    const wsUrl = import.meta.env.VITE_WS_URL
    const url = wsUrl || (() => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws'
      return `${proto}://${location.host}/ws`
    })()

    ws = new WebSocket(url)

    ws.onopen = () => {
      guildStore.connStatus = '● 已連線'
      const apiBase = import.meta.env.VITE_API_URL || ''
      fetch(`${apiBase}/api/config`)
        .then(r => r.json())
        .then(d => { guildStore.appSlug = d.appSlug })
        .catch(() => {})
    }

    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data)
      switch (msg.type) {
        case 'init':
          guildStore.memberCount = msg.members.length
          guildStore.viewerCount = msg.viewers ?? 0
          if (window._guild) {
            window._guild.initMembers(msg.members)
          } else {
            guildStore.pendingInitMembers = msg.members
          }
          break
        case 'viewers':
          guildStore.viewerCount = msg.count
          break
        case 'event':
          window._guild?.pushServerEvent(msg)
          break
        case 'member_join':
          guildStore.memberCount++
          window._guild?.addMember(msg.username)
          break
        case 'member_leave':
          guildStore.memberCount--
          window._guild?.removeMember(msg.username)
          break
      }
    }

    ws.onclose = () => {
      guildStore.connStatus = '● 連線中斷，5 秒後重試...'
      reconnectTimer = setTimeout(connect, 5000)
    }

    ws.onerror = () => ws.close()
  }

  onMounted(() => { connect() })

  onUnmounted(() => {
    if (reconnectTimer) clearTimeout(reconnectTimer)
    ws?.close()
  })
}
