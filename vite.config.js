import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // สั่งให้สร้างโฟลเดอร์ชื่อ 'build' แทน 'dist' (เพื่อให้ Vercel เจอ)
  }
})
