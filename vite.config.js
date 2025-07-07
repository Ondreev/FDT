import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.', // 👈 Указываем корень
  build: {
    outDir: 'dist',
  },
})
