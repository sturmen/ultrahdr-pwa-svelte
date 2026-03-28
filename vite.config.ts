import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import packageJson from './package.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wasmVersionMetadataPath = path.join(__dirname, '.wasm-version.json');
const appVersionMetadataPath = path.join(__dirname, '.app-version.json');

function isTruthyEnvValue(value: unknown): boolean {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

function isStrictBuildMode(): boolean {
  return isTruthyEnvValue(process.env.WASM_BUILD_STRICT)
    || isTruthyEnvValue(process.env.CI)
    || String(process.env.NODE_ENV || '').toLowerCase() === 'production';
}

function isValidAssetVersion(version: string): boolean {
  return /^[a-f0-9]{16}$/.test(version);
}

function loadWasmAssetVersion(): string | null {
  if (!fs.existsSync(wasmVersionMetadataPath)) {
    return null;
  }

  try {
    const metadataRaw = fs.readFileSync(wasmVersionMetadataPath, 'utf8');
    const metadata = JSON.parse(metadataRaw) as { wasmAssetVersion?: string };
    const version = typeof metadata.wasmAssetVersion === 'string' ? metadata.wasmAssetVersion.trim() : '';
    if (!version) {
      return null;
    }
    if (!isValidAssetVersion(version)) {
      const message = `Invalid WASM asset version in ${wasmVersionMetadataPath}: "${version}"`;
      if (isStrictBuildMode()) {
        throw new Error(message);
      }
      console.warn(message);
      return null;
    }
    return version;
  } catch (error) {
    if (isStrictBuildMode()) {
      throw error;
    }
    console.warn(`Failed to parse WASM version metadata at ${wasmVersionMetadataPath}:`, error);
    return null;
  }
}

const wasmAssetVersion = loadWasmAssetVersion();
if (isStrictBuildMode() && !wasmAssetVersion) {
  throw new Error(
    `Missing WASM asset version metadata at ${wasmVersionMetadataPath}. `
    + 'Run `npm run build:wasm` successfully before building in CI/production.',
  );
}

const resolvedWasmAssetVersion = wasmAssetVersion || 'dev-unversioned';

function loadAppAssetVersion(): string | null {
  if (!fs.existsSync(appVersionMetadataPath)) {
    return null;
  }

  try {
    const metadataRaw = fs.readFileSync(appVersionMetadataPath, 'utf8');
    const metadata = JSON.parse(metadataRaw) as { appAssetVersion?: string };
    const version = typeof metadata.appAssetVersion === 'string' ? metadata.appAssetVersion.trim() : '';
    if (!version) {
      return null;
    }
    if (!isValidAssetVersion(version)) {
      const message = `Invalid app asset version in ${appVersionMetadataPath}: "${version}"`;
      if (isStrictBuildMode()) {
        throw new Error(message);
      }
      console.warn(message);
      return null;
    }
    return version;
  } catch (error) {
    if (isStrictBuildMode()) {
      throw error;
    }
    console.warn(`Failed to parse app version metadata at ${appVersionMetadataPath}:`, error);
    return null;
  }
}

const appAssetVersion = loadAppAssetVersion();
if (isStrictBuildMode() && !appAssetVersion) {
  throw new Error(
    `Missing app asset version metadata at ${appVersionMetadataPath}. `
    + 'Run `npm run build:app-version` successfully before building in CI/production.',
  );
}

const resolvedAppAssetVersion = appAssetVersion || 'dev-unversioned-app';

export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    'import.meta.env.VITE_APP_ASSET_VERSION': JSON.stringify(resolvedAppAssetVersion),
    'import.meta.env.VITE_WASM_ASSET_VERSION': JSON.stringify(resolvedWasmAssetVersion),
  },
  resolve: {
    conditions: ['onnxruntime-web-use-extern-wasm', 'browser', 'module', 'import'],
  },
  base: process.env.NODE_ENV === 'production' ? '/ultrahdr-pwa-svelte/' : '/',
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'models/gmnet-smoke-128.png'],
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
            url: './?action=pick',
          },
          {
            name: 'Open Results',
            short_name: 'Results',
            description: 'Jump to converted images',
            url: './?tab=results',
          },
          {
            name: 'Resume Queue',
            short_name: 'Resume',
            description: 'Resume paused conversions',
            url: './?action=resume',
          },
        ],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
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
                accept: ['image/*', '.heic', '.heif', '.hif', '.tif', '.tiff'],
              },
            ],
          },
        },
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globIgnores: ['**/assets/ultrahdr_wasm.js', '**/assets/ultrahdr_wasm.wasm', '**/assets/libheif.wasm', '**/assets/ort-*.wasm'],
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/libheif-js/libheif-wasm/libheif.wasm',
          dest: 'assets',
        },
        {
          src: 'node_modules/libheif-js/libheif-wasm/libheif-bundle.mjs',
          dest: 'assets',
        },
        {
          src: 'node_modules/onnxruntime-web/dist/*.wasm',
          dest: 'assets',
        },
        {
          src: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded*.mjs',
          dest: 'assets',
        },
        {
          src: 'node_modules/onnxruntime-web/dist/ort.webgl.min.mjs',
          dest: 'assets',
        },
        {
          src: 'public/models/*',
          dest: 'models',
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ['@monogrid/gainmap-js/libultrahdr'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/onnxruntime-web/')) {
            if (id.includes('/dist/ort.webgpu') || id.includes('/lib/backend-webgpu') || id.includes('/lib/wasm/jsep')) {
              return 'ort-webgpu-runtime';
            }
            if (id.includes('/dist/ort.wasm') || id.includes('/lib/wasm/')) {
              return 'ort-wasm-runtime';
            }
            return 'ort-runtime';
          }
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
