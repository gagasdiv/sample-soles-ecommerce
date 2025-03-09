import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  // Load all .env files (e.g., .env, .env.development, etc.) from this folder
  const env = loadEnv(mode, __dirname);

  return {
    root: __dirname, // Ensure Vite treats this folder as the root
    envDir: __dirname, // Tells Vite to look for .env in this folder
    plugins: [vue()],
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
    },
  };
});
