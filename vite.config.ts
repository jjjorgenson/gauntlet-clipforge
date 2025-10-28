import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Base path for production builds
  base: './',
  
  // Resolve path aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@contracts': resolve(__dirname, 'src/shared/contracts'),
      '@types': resolve(__dirname, 'src/shared/types'),
    },
  },
  
  // Development server config
  server: {
    port: 5173,
    strictPort: true,
  },
  
  // Build config
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  
  // Electron compatibility
  optimizeDeps: {
    exclude: ['electron'],
  },
});

