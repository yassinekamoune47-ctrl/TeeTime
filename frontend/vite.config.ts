import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  server: {
    // Proxy API calls in dev so the browser sees a single origin (localhost:5173).
    // This keeps Sanctum's session + XSRF cookies readable regardless of whether
    // the app is opened via localhost or 127.0.0.1.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: false,
      },
      '/sanctum': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: false,
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: false,
      },
    },
  },
})
