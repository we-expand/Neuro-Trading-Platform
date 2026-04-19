import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true, // Enable protocol imports including URL-related APIs
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 🛡️ PROTEÇÃO: Define globals no build para evitar erros de referência
  define: {
    'global': 'globalThis',
  },
  optimizeDeps: {
    include: ['klinecharts'],
    esbuildOptions: {
      // 🛡️ Define globals durante otimização de dependências
      define: {
        global: 'globalThis'
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild'
  }
})