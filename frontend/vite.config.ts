import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    compression({
      include: [/\.(js|css|html|svg|json)$/],
      threshold: 1024,
    }),
  ],
  server: {
    host: '0.0.0.0', // Allow network access
    port: 5173,
    strictPort: true,
    // Enable HTTPS for mobile camera access
    // Note: Self-signed cert will show warning - accept it to proceed
    https: process.env.VITE_HTTPS === 'true' ? true : false,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'tensorflow-vendor': ['@tensorflow/tfjs', '@tensorflow-models/face-landmarks-detection'],
          'ui-vendor': ['zustand', 'axios'],
        },
      },
    },
    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'axios'],
  },
});
