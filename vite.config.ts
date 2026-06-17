import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { devApi } from './dev-api-plugin'

// Relative base so the static build can be deployed under any sub-path.
export default defineConfig({
  plugins: [react(), devApi()],
  base: './',
})
