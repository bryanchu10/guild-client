import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],

  preflights: [
    { getCSS: () => 'body { background: #0d1117; }' },
  ],

  theme: {
    colors: {
      surface: '#161b22',
      canvas:  '#0d1117',
      border:  '#30363d',
      muted:   '#8b949e',
      fg:      '#e6edf3',
      blue:    '#58a6ff',
      green:   '#3fb950',
      orange:  '#f0883e',
      red:     '#f85149',
      purple:  '#a371f7',
      yellow:  '#f5d076',
    },
  },

  shortcuts: {
    // 事件 class — 由伺服器 action.css 欄位動態指定，靜態分析掃不到，需在此明確定義
    'push':   'text-orange',
    'pr':     'text-purple',
    'merge':  'text-green',
    'review': 'text-blue',
    'bug':    'text-red',

    // Admin 面板按鈕：base → 特化
    'btn-base':    'bg-transparent border border-border text-muted px-3 py-1 rounded-md font-mono text-[11px] cursor-pointer',
    'btn-admin':   'btn-base hover:border-blue hover:text-blue',
    'btn-danger':  'btn-base hover:border-red hover:text-red',
    'btn-approve': 'btn-base hover:border-green hover:text-green',

    // Admin 面板輸入框
    'admin-input': 'flex-1 bg-surface border border-border text-fg px-2.5 py-[5px] rounded-md font-mono text-xs outline-none focus:border-blue',
  },
})
