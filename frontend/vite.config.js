import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://anudip-production.up.railway.app', // 👈 Your backend root domain
        changeOrigin: true,
      },
    },
  },
});
