import { createApp } from 'vue';
import App from './App.vue';
import router from './router.js';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import './index.css';

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.mount('#app');
