import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/brewedat/db-viewer/',
  server: {
    port: 3006,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    },
    allowedHosts: [
      'chrispeterkins.com',
      'www.chrispeterkins.com',
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3005',
        changeOrigin: true,
      }
    }
  }
})
