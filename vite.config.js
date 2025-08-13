import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    css: {
        modules: {
            localsConvention: 'camelCase'
        }
    },
    server: {
        proxy: {
            '/api/meee': {
                target: 'https://meeeapi.vercel.app',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/meee/, ''),
                secure: true
            }
        }
    }
})
