import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './src/public',
  build: {
    outDir: '../../dist/public',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
});
