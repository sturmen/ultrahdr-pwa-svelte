import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const heavyHeicFixtureTests = [
  'src/lib/__tests__/gain-map-extraction.test.js',
  'src/lib/__tests__/gain-map-extraction.*.test.ts',
];

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
      'src/**/*.test.js',
      'src/**/*.test.ts',
      'src/**/*.test.svelte',
      'scripts/**/*.test.js',
      'scripts/**/*.test.ts',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      '.history/',
      '**/vite.config.test.ts',
      ...heavyHeicFixtureTests,
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.js', 'src/lib/**/*.ts'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.js',
        '**/*.test.ts',
        '**/*.spec.js',
        '**/*.spec.ts',
      ],
    },
    transformMode: {
      web: [/\.[jt]sx?$/, /\.svelte$/],
    },
  },
});
