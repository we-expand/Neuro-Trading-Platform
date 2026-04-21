import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  build: {
    minify: 'terser',
    rollupOptions: {
      output: {
        # Isso aqui mata o erro 'Circular chunk' que vimos no log
        manualChunks: undefined 
      }
    }
  }
})
