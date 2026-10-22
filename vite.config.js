import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo-new.png'],
      manifest: {
        name: 'ICD - Ismail Cold Drinks',
        short_name: 'ICD',
        description: 'Wholesale Cold Drinks Order App',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/logo-new.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-new.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})