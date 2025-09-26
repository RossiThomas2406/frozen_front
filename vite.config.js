import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Limpia la carpeta antes de build
    chunkSizeWarningLimit: 1600, // Opcional: ajusta límite de warnings
  },
  preview: {
    port: 3000,
    host: true
  }
})