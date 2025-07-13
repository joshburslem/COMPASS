
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 443,
      port: 5000
    },
    allowedHosts: ['localhost', '.replit.dev', '0be339cd-c50a-4418-8e8a-6a8ba8f37f74-00-1vtjo0ra12kao.riker.replit.dev']
  }
})
