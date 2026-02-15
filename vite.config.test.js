import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  resolve: {
    conditions: ['browser'],
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.js', 'src/**/*.test.svelte'],
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
