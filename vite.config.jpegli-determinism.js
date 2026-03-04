import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'import.meta.env.BASE_URL': JSON.stringify('/'),
    'import.meta.env.VITE_APP_ASSET_VERSION': JSON.stringify(
      process.env.VITE_APP_ASSET_VERSION || 'test-app-version'
    ),
    'import.meta.env.VITE_WASM_ASSET_VERSION': JSON.stringify(
      process.env.VITE_WASM_ASSET_VERSION || 'test-wasm-version'
    ),
  },
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    include: ['tests/integration/jpegli-determinism.test.js'],
    exclude: ['node_modules/', 'dist/', '.history/'],
  },
});
