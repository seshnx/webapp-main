import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import * as SentryVitePlugin from "@sentry/vite-plugin"

// Derive __dirname for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Conditionally get visualizer plugin (only when ANALYZE=true and package is installed)
function getVisualizerPlugin() {
  if (process.env.ANALYZE !== 'true') return null;
  
  try {
    // Use createRequire for ES modules compatibility
    const require = createRequire(import.meta.url);
    const { visualizer } = require('rollup-plugin-visualizer');
    return visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    });
  } catch (e) {
    // Package not installed - skip analyzer
    if (process.env.ANALYZE === 'true') {
      console.warn('⚠️ rollup-plugin-visualizer not found. Install with: npm install --save-dev rollup-plugin-visualizer');
    }
    return null;
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "convex/_generated": path.resolve(__dirname, "./convex/_generated")
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1000, // Increased for large dependencies
    sourcemap: (import.meta.env?.PROD || process.env.NODE_ENV === 'production') ? 'hidden' : true, // Source maps for debugging
    minify: 'esbuild', // Fastest minifier
    cssMinify: 'esbuild', // Fast CSS minification
    rollupOptions: {
      external: [],
      output: {
        // Better chunk naming for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // Code splitting strategy for better caching and performance
          if (id.includes('node_modules')) {
            // Core React runtime & router together to ensure stable initialization
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router')) {
              return 'vendor-core';
            }
            if (id.includes('@clerk')) return 'vendor-clerk';
            if (id.includes('@sentry')) return 'vendor-sentry';
            if (id.includes('@tanstack')) return 'vendor-query';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('framer-motion')) return 'vendor-framer';
            if (id.includes('convex')) return 'vendor-convex';
            if (id.includes('react-leaflet') || id.includes('leaflet')) return 'vendor-maps';
            if (id.includes('wavesurfer')) return 'vendor-audio';
            if (id.includes('@stripe') || id.includes('stripe')) return 'vendor-stripe';
            if (id.includes('react-big-calendar') || id.includes('date-fns')) return 'vendor-calendar';
            if (id.includes('pannellum')) return 'vendor-pannellum';
            if (id.includes('clsx') || id.includes('tailwind-merge')) return 'vendor-ui';
            // Other vendor dependencies
            return 'vendor-misc';
          }
          // IMPORTANT: Keep config files in their own chunk to ensure proper initialization
          if (id.includes('/config/constants')) return 'config';
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
      'react-router',
      'react-router-dom',
      'convex/react',
      '@sentry/react'
    ],
    // Force React Router to be pre-bundled and available immediately
    esbuildOptions: {
      // Ensure proper initialization order
      target: 'es2020',
    },
  },
  server: {
    hmr: {
      overlay: true, // Show errors in browser overlay
    },
    proxy: {
      // Proxy API requests to development server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    // Sentry for error tracking and performance monitoring
    SentryVitePlugin.sentryVitePlugin({
      org: "amalia-media",
      project: "seshnx-main",
      // Auth token should be set via SENTRY_AUTH_TOKEN env variable
      // Only upload source maps in production
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      // Enable source maps for better error debugging
      sourcemaps: {
        assets: ['./dist/assets/**'],
        ignore: ['./dist/assets/*.html', './dist/manifest.webmanifest'],
      },
      // Release tracking
      release: {
        name: process.env.VERCEL_GIT_COMMIT_SHA || process.env.CI_COMMIT_SHA || 'local',
        setCommits: {
          auto: true,
          ignore: ['vercel-cli', 'vercel'],
        },
      },
    }),
    // Bundle analyzer (only in analysis mode) - conditionally loaded
    ...(() => {
      const plugin = getVisualizerPlugin();
      return plugin ? [plugin] : [];
    })(),
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
