import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@':            resolve(__dirname, 'src'),
      '@components':  resolve(__dirname, 'src/components'),
      '@pages':       resolve(__dirname, 'src/pages'),
      '@stores':      resolve(__dirname, 'src/stores'),
      '@hooks':       resolve(__dirname, 'src/hooks'),
      '@mocks':       resolve(__dirname, 'src/mocks'),
      '@config':      resolve(__dirname, 'src/config'),
      '@lib':         resolve(__dirname, 'src/lib'),
      '@types':       resolve(__dirname, 'src/types'),
    },
  },

  server: {
    port: 3000,
    open: true,
    cors: true,
    hmr: { overlay: true },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          react:   ['react', 'react-dom'],
          zustand: ['zustand'],
          icons:   ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  preview: {
    port: 4173,
  },
});
