import '@testing-library/jest-dom/vitest';

// Vitest setup file
// This file runs before each test file
console.log('=== SETUP FILE LOADED ===');

// Mock browser APIs that may not be available in JSDOM
global.URL.createObjectURL = vi.fn((blob) => {
  return 'mock-object-url';
});

global.URL.revokeObjectURL = vi.fn();

// Mock navigator
if (typeof navigator === 'undefined') {
  global.navigator = {
    canShare: false,
    share: vi.fn(),
    setAppBadge: vi.fn(),
    clearAppBadge: vi.fn(),
  };
} else {
  navigator.canShare = false;
  navigator.share = vi.fn();
  navigator.setAppBadge = vi.fn();
  navigator.clearAppBadge = vi.fn();
}

// Mock fetch for WASM and JS loading
global.fetch = vi.fn((url) => {
  return Promise.resolve({
    ok: true,
    status: 200,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
    text: () => Promise.resolve(''),
  });
});

// Mock window.createJpegliWasm
if (typeof window !== 'undefined') {
  let mockWasmMemOffset = 0;
  const mockWasmMemory = new ArrayBuffer(64 * 1024 * 1024); // 64MB

  window.createJpegliWasm = vi.fn(() => Promise.resolve({
    _jpegli_wasm_encoder_create: vi.fn(() => 12345),
    _jpegli_wasm_encoder_destroy: vi.fn(),
    _jpegli_wasm_encode: vi.fn(() => 0),
    _jpegli_wasm_get_output_data: vi.fn(() => 1024),
    _jpegli_wasm_get_output_size: vi.fn(() => 1024),
    _malloc: vi.fn((size) => {
      const ptr = mockWasmMemOffset;
      mockWasmMemOffset = (mockWasmMemOffset + size + 3) & ~3;
      return ptr;
    }),
    _free: vi.fn(),
    ccall: vi.fn(() => 1),
    HEAPU8: new Uint8Array(mockWasmMemory),
    HEAPU32: new Uint32Array(mockWasmMemory),
    buffer: mockWasmMemory
  }));
}

if (typeof globalThis !== 'undefined') {
  globalThis.createJpegliWasm = typeof window !== 'undefined' ? window.createJpegliWasm : undefined;
}



// Mock requestIdleCallback and cancelIdleCallback
global.requestIdleCallback = vi.fn((cb) => {
  setTimeout(() => cb({ didTimeout: false }), 0);
  return 1;
});
global.cancelIdleCallback = vi.fn();

// Mock ResizeObserver if not available
if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
  };
}

// Mock getComputedStyle
// Mock getComputedStyle
if (global.window) {
  const originalGetComputedStyle = global.window.getComputedStyle;
  global.window.getComputedStyle = (elt) => {
    const styles = originalGetComputedStyle ? originalGetComputedStyle(elt) : {};
    styles.display = 'block';
    styles.visibility = 'visible';
    return styles;
  };
}

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
if (typeof window !== 'undefined') {
  window.ImageData = CanvasImageData;
} else {
  global.ImageData = CanvasImageData;
}
