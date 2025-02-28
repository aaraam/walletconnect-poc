import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/walletconnect': {
        target: 'https://verify.walletconnect.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/walletconnect/, ''),
      },
    },
    host: 'localhost',
  },
  preview: {
    host: '97c9-2401-4900-1cde-b9f3-a1b9-bc88-da43-5b6f.ngrok-free.app',
  },
});
