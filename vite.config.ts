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
        // Remove a divisão complexa que causava o erro de inicialização 't'
        manualChunks: undefined 
      }
    }
  }
})
