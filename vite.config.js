import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

// Derive __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Stub convex/server for browser builds (it's only used in generated API files)
      // Use src/utils location which is always available in builds
      'convex/server': path.resolve(__dirname, './src/utils/convex-server-stub.js'),
      // Stub @sentry/react when not installed (optional dependency)
      '@sentry/react': path.resolve(__dirname, './src/utils/sentry-stub.js'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600, // Increase warning threshold slightly
    rollupOptions: {
      external: (id) => {
        // Don't externalize convex/server - we're using a stub instead
        // Only externalize if it's a different pattern
        return false;
      },
      output: {
        manualChunks: (id) => {
          // Code splitting strategy
          // Split vendor chunks for better caching
          if (id.includes('node_modules')) {
            // Large libraries get their own chunks
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('convex')) {
              return 'vendor-convex';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (id.includes('react-leaflet') || id.includes('leaflet')) {
              return 'vendor-maps';
            }
            if (id.includes('wavesurfer')) {
              return 'vendor-audio';
            }
            if (id.includes('@stripe')) {
              return 'vendor-stripe';
            }
            if (id.includes('react-big-calendar')) {
              return 'vendor-calendar';
            }
            // Other node_modules
            return 'vendor';
          }
          // Split EDU components (large feature set)
          if (id.includes('/EDU/')) {
            return 'edu';
          }
          // Split chat components
          if (id.includes('/chat/')) {
            return 'chat';
          }
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['convex/server'],
    include: ['convex/react'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png', 'mask-icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'SeshNx Creator Platform',
        short_name: 'SeshNx',
        description: 'The operating system for music creators and studios.',
        theme_color: '#3D84ED',
        background_color: '#1f2128',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // FIX: Increase the limit to 4 MiB (default is 2 MiB)
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        
        // Cache Google Fonts and local assets for offline use
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
