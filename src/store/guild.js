import { reactive } from 'vue'

export const guildStore = reactive({
  connStatus: '● 連線中...',
  memberCount: 0,
  logEntries: [],        // [{ css, text }]
  appSlug: '',
  pendingInitMembers: null,

  showJoinPanel: false,
  joinUsername: '',
  joinMsg: '',
  joinMsgColor: '#8b949e',

  showInstallBanner: false,

  following: false,
  followName: '',
})
