import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/cute-pomodoro/', // 깃허브 저장소 이름에 맞춰 기본 경로 설정!
})
