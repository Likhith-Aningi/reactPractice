import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     '/likit': {
  //       target: 'http://localhost:8081',
  //       changeOrigin: true,
  //       // rewrite: (path) => path.replace(/^\/likit/, ''),
  //     },
  //   },
  // },
})
