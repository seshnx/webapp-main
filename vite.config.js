import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
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
      // Use browser-safe API for client-side builds
      // The generated api.js imports from convex/server which is server-side only
      "convex/_generated/api": path.resolve(__dirname, "./convex/_generated/api-browser.js"),
      // Firebase client SDK has been removed; map legacy imports to local shims.
      "firebase/app": path.resolve(__dirname, "./src/adapters/firebase/app.js"),
      "firebase/auth": path.resolve(__dirname, "./src/adapters/firebase/auth.js"),
      "firebase/firestore": path.resolve(__dirname, "./src/adapters/firebase/firestore.js"),
      "firebase/storage": path.resolve(__dirname, "./src/adapters/firebase/storage.js"),
      "firebase/functions": path.resolve(__dirname, "./src/adapters/firebase/functions.js"),
      "firebase/database": path.resolve(__dirname, "./src/adapters/firebase/database.js"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increased for large dependencies
    sourcemap: import.meta.env.PROD ? 'hidden' : true, // Source maps for debugging
    minify: 'esbuild', // Fastest minifier
    cssMinify: 'esbuild', // Fast CSS minification
    rollupOptions: {
      external: (id) => {
        // Don't externalize convex/server - we're using a stub instead
        // Only externalize if it's a different pattern
        return false;
      },
      output: {
        // Better chunk naming for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // Code splitting strategy for better caching and performance
          if (id.includes('node_modules')) {
            // Large libraries get their own chunks for better caching
            if (id.includes('convex/react')) return 'vendor-convex';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('react-leaflet') || id.includes('leaflet')) return 'vendor-maps';
            if (id.includes('wavesurfer')) return 'vendor-audio';
            if (id.includes('@stripe')) return 'vendor-stripe';
            if (id.includes('react-big-calendar')) return 'vendor-calendar';
            // Other vendor dependencies
            return 'vendor';
          }
          // Feature-based code splitting
          if (id.includes('/EDU/')) return 'edu';
          if (id.includes('/chat/')) return 'chat';
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['convex/server'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'convex/react',
      '@sentry/react'
    ],
  },
  server: {
    hmr: {
      overlay: true, // Show errors in browser overlay
    },
  },
  plugins: [
    react(),
    // Bundle analyzer (only in analysis mode)
    ...(process.env.ANALYZE === 'true' ? [visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    })] : []),
    VitePWA({
      registerType: 'autoUpdate',
      // TEMP: force-remove old cached bundles (including any prior Firebase chunks).
      // Once the migration is fully rolled out everywhere, we can re-enable PWA caching.
      selfDestroying: true,
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
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        
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
