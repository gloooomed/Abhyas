import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

import { VitePWA } from 'vite-plugin-pwa'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.gif'],
      manifest: {
        name: 'Abhyas',
        short_name: 'Abhyas',
        description: 'AI Powered Career and Skill Advisor',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'logo.gif',
            sizes: '192x192',
            type: 'image/gif'
          },
          {
            src: 'logo.gif',
            sizes: '512x512',
            type: 'image/gif'
          }
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Go to your dashboard',
            url: '/dashboard',
            icons: [{ src: 'logo.gif', sizes: '192x192' }]
          },
          {
            name: 'Skills Analysis',
            short_name: 'Skills',
            description: 'Analyze your skills',
            url: '/skills-analysis',
            icons: [{ src: 'logo.gif', sizes: '192x192' }]
          },
          {
            name: 'Mock Interview',
            short_name: 'Interview',
            description: 'Start a mock interview',
            url: '/mock-interview',
            icons: [{ src: 'logo.gif', sizes: '192x192' }]
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/hooks/**', 'src/lib/saveGuard.ts'],
    },
  },
})
