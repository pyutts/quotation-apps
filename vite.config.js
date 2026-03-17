import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Use relative paths for Electron production build
  base: './',
  server: {
    port: 3000,
    // Don't auto-open browser when using electron:dev
    open: false,
  },
  build: {
    // Output to dist/ for Electron to load
    outDir: 'dist',
    emptyOutDir: true,
  },
})
