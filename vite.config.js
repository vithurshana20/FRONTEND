import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  base: '/FRONTEND/', // Set the base path for GitHub Pages
  plugins: [react(), tailwindcss(),],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // your backend URL & port
        changeOrigin: true,
        secure: false,
      },
    },
  },

})


