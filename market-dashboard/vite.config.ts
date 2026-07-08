import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/binance/exchange-info': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        rewrite: () => '/api/v3/exchangeInfo',
      },
      '/api/binance/ticker-24hr': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        rewrite: () => '/api/v3/ticker/24hr',
      },
    },
  },
})
