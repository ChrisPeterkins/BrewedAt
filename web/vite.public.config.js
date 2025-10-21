import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  root: './src/public-site',
  build: {
    outDir: '../../dist/public',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/public-site/index.html'),
        events: resolve(__dirname, 'src/public-site/events.html'),
        podcast: resolve(__dirname, 'src/public-site/podcast.html'),
        press: resolve(__dirname, 'src/public-site/press.html'),
        'for-business': resolve(__dirname, 'src/public-site/for-business.html'),
        'submit-event': resolve(__dirname, 'src/public-site/submit-event.html'),
        'hall-of-champions': resolve(__dirname, 'src/public-site/hall-of-champions.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
});
