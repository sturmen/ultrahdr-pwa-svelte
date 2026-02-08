// Vitest setup file
// This file runs before each test file
console.log('=== SETUP FILE LOADED ===');

// Mock browser APIs that may not be available in JSDOM
global.URL.createObjectURL = vi.fn((blob) => {
  return 'mock-object-url';
});

global.URL.revokeObjectURL = vi.fn();

// Mock indexedDB
global.indexedDB = {
  open: vi.fn(),
};

// Mock navigator
if (typeof navigator === 'undefined') {
  global.navigator = {
    canShare: false,
    share: vi.fn(),
  };
} else {
  navigator.canShare = false;
  navigator.share = vi.fn();
}

// Mock fetch for WASM loading
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
  })
);

// Mock requestIdleCallback and cancelIdleCallback
global.requestIdleCallback = vi.fn((cb) => {
  setTimeout(() => cb({ didTimeout: false }), 0);
  return 1;
});
global.cancelIdleCallback = vi.fn();

// Mock ResizeObserver if not available
if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock getComputedStyle
const originalGetComputedStyle = global.window.getComputedStyle;
global.window.getComputedStyle = (elt) => {
  const styles = originalGetComputedStyle(elt);
  styles.display = 'block';
  styles.visibility = 'visible';
  return styles;
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Import canvas and set up ImageData on global
import { ImageData as CanvasImageData } from 'canvas';
window.ImageData = CanvasImageData;
