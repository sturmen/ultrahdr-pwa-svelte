import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import packageJson from './package.json' with { type: 'json' }

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },
  base: process.env.NODE_ENV === 'production' ? '/ultrahdr-pwa-svelte/' : '/',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'UltraHDR Converter',
        short_name: 'UltraHDR',
        description: 'Convert images to UltraHDR gain maps offline',
        theme_color: '#ffffff',
        shortcuts: [
          {
            name: 'Pick Images',
            short_name: 'Pick',
            description: 'Import images and start a conversion queue',
            url: './?action=pick'
          },
          {
            name: 'Open Results',
            short_name: 'Results',
            description: 'Jump to converted images',
            url: './?tab=results'
          },
          {
            name: 'Resume Queue',
            short_name: 'Resume',
            description: 'Resume paused conversions',
            url: './?action=resume'
          }
        ],
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
          }
        ],
        share_target: {
          action: '_share-target',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [
              {
                name: 'file',
                accept: ['image/*', '.heic', '.heif', '.tif', '.tiff']
              }
            ]
          }
        }
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/libheif-js/libheif-wasm/libheif.wasm',
          dest: 'assets'
        }
      ]
    })
  ],
  optimizeDeps: {
    exclude: ['@monogrid/gainmap-js/libultrahdr']
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
})
