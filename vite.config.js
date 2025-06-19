import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    // Add CORS headers for Mapbox
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Set to false for production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mapbox: ['mapbox-gl'],
          supabase: ['@supabase/supabase-js'],
          ui: ['framer-motion', '@heroicons/react']
        },
      },
    },
  },
  define: {
    // Fix for some Mapbox issues
    global: 'globalThis'
  },
  // Add this for better error handling
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
});