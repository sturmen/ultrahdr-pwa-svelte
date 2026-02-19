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
    conditions: ['browser'],
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
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.js', 'src/**/*.test.svelte', 'scripts/**/*.test.js'],
    exclude: ['node_modules/', 'dist/', '.history/', '**/vite.config.test.js'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.js'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.js',
        '**/*.spec.js',
      ],
    },
    transformMode: {
      web: [/\.[jt]sx?$/],
    },
  },
});
