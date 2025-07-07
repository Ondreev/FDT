import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.', // ⬅️ Это важно: говорим Vite, что корень проекта — текущая папка
})
