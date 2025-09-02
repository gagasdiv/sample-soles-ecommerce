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

// Register all components
const components = import.meta.globEager('./components/*.vue');
Object.entries(components).forEach(([path, definition]) => {
  const componentName = path.split('/').pop().replace(/\.\w+$/, '');
  app.component(componentName, definition.default);
});

app.mount('#app');
