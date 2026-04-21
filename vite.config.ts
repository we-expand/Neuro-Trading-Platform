import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined 
      }
    }
  }
})
