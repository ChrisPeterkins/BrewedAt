import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-assets',
      closeBundle() {
        // Copy static assets after build
        const publicAssets = [
          'brewedat-logo.png',
          'beer-background-optimized.jpg'
        ];

        publicAssets.forEach(asset => {
          try {
            copyFileSync(
              resolve(__dirname, 'public', asset),
              resolve(__dirname, 'dist/public', asset)
            );
            console.log(`✓ Copied ${asset}`);
          } catch (err) {
            console.error(`Failed to copy ${asset}:`, err.message);
          }
        });
      }
    }
  ],
  root: './src/public',
  base: '/brewedat/',
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
