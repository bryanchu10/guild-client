import { createApp } from 'vue'
import 'virtual:uno.css'
import App from './App.vue'
import router from './router/index.js'

createApp(App).use(router).mount('#app')
