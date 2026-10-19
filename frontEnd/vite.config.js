
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('/node_modules/')) {
            if (
              normalized.includes('/react/') ||
              normalized.includes('/react-dom/') ||
              normalized.includes('/react-router/') ||
              normalized.includes('/react-router-dom/') ||
              normalized.includes('/scheduler/')
            ) {
              return 'vendor-react';
            }
            if (normalized.includes('/react-icons/') || normalized.includes('@fortawesome')) {
              return 'vendor-icons';
            }
            if (normalized.includes('/socket.io-client/') || normalized.includes('/engine.io-client/')) {
              return 'vendor-socket';
            }
          }
        },
      },
    },
  },
});
