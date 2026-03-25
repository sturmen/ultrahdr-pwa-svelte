import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_ASSET_VERSION': JSON.stringify(
      process.env.VITE_APP_ASSET_VERSION || 'test-app-version'
    ),
    'import.meta.env.VITE_WASM_ASSET_VERSION': JSON.stringify(
      process.env.VITE_WASM_ASSET_VERSION || 'test-wasm-version'
    ),
  },
  resolve: {
    conditions: ['browser', 'import'],
    mainFields: ['browser', 'module', 'main'],
    alias: {
      'virtual:pwa-register': '/src/test/mocks/pwa-register.js',
    },
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: true,
      },
    }),
  ],
  worker: {
    format: 'es',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/lib/__tests__/gain-map-extraction.*.test.ts',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      '.history/',
      'src/lib/__tests__/gain-map-extraction.test.js',
    ],
    fileParallelism: false,
    maxWorkers: 1,
    transformMode: {
      web: [/\.[jt]sx?$/, /\.svelte$/],
    },
  },
});
