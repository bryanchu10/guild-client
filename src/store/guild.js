import { reactive } from 'vue'

export const guildStore = reactive({
  connStatus: '● 連線中...',
  memberCount: 0,
  logEntries: [],        // [{ css, text }]
  appSlug: '',
  pendingInitMembers: null,

  showJoinPanel: false,

  following: false,
  followName: '',
})
