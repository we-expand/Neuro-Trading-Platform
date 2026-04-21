import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    minify: 'terser',
    cssCodeSplit: false, // Força o CSS num arquivo só para não sumir o layout
    rollupOptions: {
      output: {
        manualChunks: undefined // Impede a separação que causava o erro 't'
      }
    }
  }
})
