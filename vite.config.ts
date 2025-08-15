import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-e5mvlm2so-ernests-projects-4cb81ca9.vercel.app',
        changeOrigin: true,
      },
    },
  },
}) 