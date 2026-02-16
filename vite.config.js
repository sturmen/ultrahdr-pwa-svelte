import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import packageJson from './package.json' with { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const wasmVersionMetadataPath = path.join(__dirname, '.wasm-version.json')
const appVersionMetadataPath = path.join(__dirname, '.app-version.json')

function isTruthyEnvValue(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase())
}

function isStrictBuildMode() {
  return isTruthyEnvValue(process.env.WASM_BUILD_STRICT)
    || isTruthyEnvValue(process.env.CI)
    || String(process.env.NODE_ENV || '').toLowerCase() === 'production'
}

function isValidAssetVersion(version) {
  return /^[a-f0-9]{16}$/.test(version)
}

function loadWasmAssetVersion() {
  if (!fs.existsSync(wasmVersionMetadataPath)) {
    return null
  }

  try {
    const metadataRaw = fs.readFileSync(wasmVersionMetadataPath, 'utf8')
    const metadata = JSON.parse(metadataRaw)
    const version = typeof metadata.wasmAssetVersion === 'string' ? metadata.wasmAssetVersion.trim() : ''
    if (!version) {
      return null
    }
    if (!isValidAssetVersion(version)) {
      const message = `Invalid WASM asset version in ${wasmVersionMetadataPath}: "${version}"`
      if (isStrictBuildMode()) {
        throw new Error(message)
      }
      console.warn(message)
      return null
    }
    return version
  } catch (error) {
    if (isStrictBuildMode()) {
      throw error
    }
    console.warn(`Failed to parse WASM version metadata at ${wasmVersionMetadataPath}:`, error)
    return null
  }
}

const wasmAssetVersion = loadWasmAssetVersion()
if (isStrictBuildMode() && !wasmAssetVersion) {
  throw new Error(
    `Missing WASM asset version metadata at ${wasmVersionMetadataPath}. ` +
    'Run `npm run build:wasm` successfully before building in CI/production.'
  )
}

const resolvedWasmAssetVersion = wasmAssetVersion || 'dev-unversioned'

function loadAppAssetVersion() {
  if (!fs.existsSync(appVersionMetadataPath)) {
    return null
  }

  try {
    const metadataRaw = fs.readFileSync(appVersionMetadataPath, 'utf8')
    const metadata = JSON.parse(metadataRaw)
    const version = typeof metadata.appAssetVersion === 'string' ? metadata.appAssetVersion.trim() : ''
    if (!version) {
      return null
    }
    if (!isValidAssetVersion(version)) {
      const message = `Invalid app asset version in ${appVersionMetadataPath}: "${version}"`
      if (isStrictBuildMode()) {
        throw new Error(message)
      }
      console.warn(message)
      return null
    }
    return version
  } catch (error) {
    if (isStrictBuildMode()) {
      throw error
    }
    console.warn(`Failed to parse app version metadata at ${appVersionMetadataPath}:`, error)
    return null
  }
}

const appAssetVersion = loadAppAssetVersion()
if (isStrictBuildMode() && !appAssetVersion) {
  throw new Error(
    `Missing app asset version metadata at ${appVersionMetadataPath}. ` +
    'Run `npm run build:app-version` successfully before building in CI/production.'
  )
}

const resolvedAppAssetVersion = appAssetVersion || 'dev-unversioned-app'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    'import.meta.env.VITE_APP_ASSET_VERSION': JSON.stringify(resolvedAppAssetVersion),
    'import.meta.env.VITE_WASM_ASSET_VERSION': JSON.stringify(resolvedWasmAssetVersion),
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
      injectManifest: {
        globIgnores: ['**/assets/ultrahdr_wasm.js', '**/assets/ultrahdr_wasm.wasm', '**/assets/libheif.wasm']
      }
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
