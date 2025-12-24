import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const basePath =
  process.env.VITE_BASE_PATH || '/flagsmith-backstage-plugin/';

export default defineConfig({
  plugins: [react()],
  root: 'demo',
  base: basePath,
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'msw'],
  },
});
