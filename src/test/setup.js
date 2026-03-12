import '@testing-library/jest-dom/vitest';

// Vitest setup file
// This file runs before each test file
console.log('=== SETUP FILE LOADED ===');

// Mock browser APIs that may not be available in JSDOM
import pkg from 'canvas';
const { createCanvas } = pkg;

function resolveImageDataConstructor() {
  if (typeof globalThis.ImageData === 'function') {
    return globalThis.ImageData;
  }

  if (typeof window !== 'undefined' && typeof window.ImageData === 'function') {
    return window.ImageData;
  }

  if (typeof pkg.ImageData === 'function') {
    return pkg.ImageData;
  }

  const canvas = createCanvas(1, 1);
  const context = canvas.getContext('2d');
  const imageData = context?.createImageData?.(1, 1);
  if (imageData?.constructor && typeof imageData.constructor === 'function') {
    return imageData.constructor;
  }

  class ImageDataShim {
    constructor(data, width, height) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  }

  return ImageDataShim;
}

function installImageDataConstructor(ImageDataCtor) {
  if (typeof globalThis !== 'undefined') {
    Object.defineProperty(globalThis, 'ImageData', {
      configurable: true,
      writable: true,
      value: ImageDataCtor,
    });
  }

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'ImageData', {
      configurable: true,
      writable: true,
      value: ImageDataCtor,
    });
  }

  if (typeof global !== 'undefined') {
    Object.defineProperty(global, 'ImageData', {
      configurable: true,
      writable: true,
      value: ImageDataCtor,
    });
  }
}

function createMemoryStorage() {
  const storage = new Map();
  return {
    getItem(key) {
      return storage.has(String(key)) ? storage.get(String(key)) : null;
    },
    setItem(key, value) {
      storage.set(String(key), String(value));
    },
    removeItem(key) {
      storage.delete(String(key));
    },
    clear() {
      storage.clear();
    },
    key(index) {
      return Array.from(storage.keys())[index] ?? null;
    },
    get length() {
      return storage.size;
    },
  };
}

function installSafeStorage(name, storage) {
  if (typeof globalThis !== 'undefined') {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: storage,
    });
  }

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, name, {
      configurable: true,
      writable: true,
      value: storage,
    });
  }
}

const CanvasImageData = resolveImageDataConstructor();
installImageDataConstructor(CanvasImageData);
installSafeStorage('localStorage', createMemoryStorage());
installSafeStorage('sessionStorage', createMemoryStorage());

global.URL.createObjectURL = vi.fn((blob) => {
  return 'mock-object-url';
});

global.URL.revokeObjectURL = vi.fn();

global.createImageBitmap = vi.fn(async (blob) => {
  const canvas = createCanvas(64, 64);
  // Add close() for compatibility with ImageBitmap
  canvas.close = () => { };
  return canvas;
});

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
    json: () => Promise.resolve({
      bundleVersion: 'test|test-app-version|test-wasm-version',
      requiredAssets: [],
    }),
    text: () => Promise.resolve(''),
  });
});

// Mock window.createJpegliWasm
if (typeof window !== 'undefined') {
  let mockWasmMemOffset = 0;
  const mockWasmMemory = new ArrayBuffer(64 * 1024 * 1024); // 64MB
  let mockNextScanline = 0;
  let mockImageHeight = 0;

  window.createJpegliWasm = vi.fn(() => Promise.resolve({
    _jpegli_wasm_encoder_create: vi.fn(() => 12345),
    _jpegli_wasm_encoder_destroy: vi.fn(),
    _jpegli_wasm_encoder_start: vi.fn((_state, _ptr, _width, height) => {
      mockNextScanline = 0;
      mockImageHeight = Number(height) || 0;
      return 0;
    }),
    _jpegli_wasm_encoder_process_rows: vi.fn((_state, maxRows) => {
      if (mockNextScanline >= mockImageHeight) {
        return 0;
      }
      const rows = Math.max(
        1,
        Math.min(mockImageHeight - mockNextScanline, Math.floor(Number(maxRows) || 1))
      );
      mockNextScanline += rows;
      return rows;
    }),
    _jpegli_wasm_encoder_finish: vi.fn(() => 0),
    _jpegli_wasm_encoder_get_next_scanline: vi.fn(() => mockNextScanline),
    _jpegli_wasm_encoder_get_image_height: vi.fn(() => mockImageHeight),
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

  window.createJpegtranWasm = vi.fn(() => Promise.resolve({
    _jpegtran_wasm_create: vi.fn(() => 24680),
    _jpegtran_wasm_destroy: vi.fn(),
    _jpegtran_wasm_transform: vi.fn(() => 0),
    _jpegtran_wasm_get_output_data: vi.fn(() => 1024),
    _jpegtran_wasm_get_output_size: vi.fn(() => 1024),
    _jpegtran_wasm_get_last_error_code: vi.fn(() => 0),
    _jpegtran_wasm_get_last_error_message: vi.fn(() => 0),
    _jpegtran_wasm_get_error_image_width: vi.fn(() => 0),
    _jpegtran_wasm_get_error_image_height: vi.fn(() => 0),
    _jpegtran_wasm_get_error_mcu_width: vi.fn(() => 0),
    _jpegtran_wasm_get_error_mcu_height: vi.fn(() => 0),
    _jpegtran_wasm_get_error_imperfect_mask: vi.fn(() => 0),
    _jpegtran_wasm_dct_digest: vi.fn(() => 0),
    _malloc: vi.fn((size) => {
      const ptr = mockWasmMemOffset;
      mockWasmMemOffset = (mockWasmMemOffset + size + 3) & ~3;
      return ptr;
    }),
    _free: vi.fn(),
    UTF8ToString: vi.fn(() => ''),
    HEAPU8: new Uint8Array(mockWasmMemory),
    buffer: mockWasmMemory
  }));
}

if (typeof globalThis !== 'undefined') {
  globalThis.createJpegliWasm = typeof window !== 'undefined' ? window.createJpegliWasm : undefined;
  globalThis.createJpegtranWasm = typeof window !== 'undefined' ? window.createJpegtranWasm : undefined;
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

// Console is already mocked above if needed
