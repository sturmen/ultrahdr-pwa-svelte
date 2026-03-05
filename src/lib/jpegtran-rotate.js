let jpegtranWasmModule = null;

const WASM_ASSET_VERSION = typeof import.meta.env.VITE_WASM_ASSET_VERSION === 'string'
  ? import.meta.env.VITE_WASM_ASSET_VERSION.trim()
  : '';

const TRANSFORM_CODE_BY_NAME = Object.freeze({
  flipH: 1,
  flipV: 2,
  transpose: 3,
  transverse: 4,
  '90': 5,
  '180': 6,
  '270': 7,
});

const JPEGTRAN_ERROR_IMPERFECT = 2;

function resolveWasmBaseUrl() {
  let baseUrl = import.meta.env.BASE_URL || '/';
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  return baseUrl;
}

function appendVersionQuery(url) {
  if (!WASM_ASSET_VERSION) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(WASM_ASSET_VERSION)}`;
}

function toUint8Array(inputBytes) {
  if (inputBytes instanceof Uint8Array) {
    return inputBytes;
  }
  if (inputBytes instanceof ArrayBuffer) {
    return new Uint8Array(inputBytes);
  }
  throw new TypeError('rotateJpeg inputBytes must be a Uint8Array or ArrayBuffer');
}

function getOffendingEdges(mask) {
  const edges = [];
  if ((mask & 1) !== 0) {
    edges.push('right');
  }
  if ((mask & 2) !== 0) {
    edges.push('bottom');
  }
  if ((mask & 4) !== 0) {
    edges.push('left');
  }
  if ((mask & 8) !== 0) {
    edges.push('top');
  }
  return edges;
}

export class JpegTransformError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'JpegTransformError';
    this.code = code;
    this.details = details;
  }
}

export function resetJpegtranForTests() {
  jpegtranWasmModule = null;
}

export async function ensureJpegtranLoaded() {
  if (jpegtranWasmModule) {
    return jpegtranWasmModule;
  }

  const baseUrl = resolveWasmBaseUrl();
  if (typeof window !== 'undefined' && typeof window.createJpegtranWasm === 'function') {
    jpegtranWasmModule = await window.createJpegtranWasm({
      locateFile: (path) => appendVersionQuery(`${baseUrl}assets/${path}`),
    });
    return jpegtranWasmModule;
  }

  const wasmJsPath = appendVersionQuery(`${baseUrl}assets/jpegtran_wasm.js`);
  try {
    const importedModule = await import(/* @vite-ignore */ wasmJsPath);
    const createWasm = importedModule?.default || importedModule?.createJpegtranWasm;
    if (typeof createWasm === 'function') {
      jpegtranWasmModule = await createWasm({
        locateFile: (path) => appendVersionQuery(`${baseUrl}assets/${path}`),
      });
      return jpegtranWasmModule;
    }
    throw new Error('createJpegtranWasm not found in imported module');
  } catch (_error) {
    const response = await fetch(wasmJsPath);
    const source = typeof response.text === 'function' ? await response.text() : '';
    const evaluateFactory = new Function(
      `${source}\n` +
      'return (typeof createJpegtranWasm === "function" ? createJpegtranWasm : ' +
      '(typeof globalThis !== "undefined" ? globalThis.createJpegtranWasm : null));'
    );
    const createWasm = evaluateFactory();
    if (typeof createWasm === 'function') {
      jpegtranWasmModule = await createWasm({
        locateFile: (path) => appendVersionQuery(`${baseUrl}assets/${path}`),
      });
      return jpegtranWasmModule;
    }
    throw new Error('Jpegtran WASM module failed to load');
  }
}

function createTransformFailureError(wasm, state, transform) {
  const rawErrorCode = typeof wasm._jpegtran_wasm_get_last_error_code === 'function'
    ? Number(wasm._jpegtran_wasm_get_last_error_code(state)) || 0
    : 0;
  const messagePtr = typeof wasm._jpegtran_wasm_get_last_error_message === 'function'
    ? wasm._jpegtran_wasm_get_last_error_message(state)
    : 0;
  const message = messagePtr
    ? (typeof wasm.UTF8ToString === 'function' ? wasm.UTF8ToString(messagePtr) : 'JPEG transform failed')
    : 'JPEG transform failed';

  if (rawErrorCode === JPEGTRAN_ERROR_IMPERFECT) {
    const width = typeof wasm._jpegtran_wasm_get_error_image_width === 'function'
      ? Number(wasm._jpegtran_wasm_get_error_image_width(state)) || 0
      : 0;
    const height = typeof wasm._jpegtran_wasm_get_error_image_height === 'function'
      ? Number(wasm._jpegtran_wasm_get_error_image_height(state)) || 0
      : 0;
    const mcuWidth = typeof wasm._jpegtran_wasm_get_error_mcu_width === 'function'
      ? Number(wasm._jpegtran_wasm_get_error_mcu_width(state)) || 0
      : 0;
    const mcuHeight = typeof wasm._jpegtran_wasm_get_error_mcu_height === 'function'
      ? Number(wasm._jpegtran_wasm_get_error_mcu_height(state)) || 0
      : 0;
    const imperfectMask = typeof wasm._jpegtran_wasm_get_error_imperfect_mask === 'function'
      ? Number(wasm._jpegtran_wasm_get_error_imperfect_mask(state)) || 0
      : 0;

    return new JpegTransformError(
      message || 'JPEG transform is not perfect for this image geometry',
      'JPEG_TRANSFORM_IMPERFECT',
      {
        transform,
        width,
        height,
        mcuWidth,
        mcuHeight,
        offendingEdges: getOffendingEdges(imperfectMask),
      }
    );
  }

  return new JpegTransformError(
    message || 'JPEG transform failed',
    'JPEG_TRANSFORM_FAILED',
    { transform, rawErrorCode }
  );
}

export async function rotateJpeg(inputBytes, transform, options = {}) {
  const normalizedBytes = toUint8Array(inputBytes);
  const normalizedTransform = String(transform);
  const transformCode = TRANSFORM_CODE_BY_NAME[normalizedTransform];
  if (!transformCode) {
    throw new JpegTransformError(
      `Unsupported JPEG transform: ${transform}`,
      'JPEG_TRANSFORM_UNSUPPORTED',
      { transform }
    );
  }

  const trim = options?.trim === true;
  const perfect = options?.perfect === true;
  if (trim && perfect) {
    throw new JpegTransformError(
      'trim and perfect cannot both be true',
      'JPEG_TRANSFORM_INVALID_OPTIONS',
      { trim, perfect }
    );
  }

  const wasm = await ensureJpegtranLoaded();
  const state = wasm._jpegtran_wasm_create();
  if (!state) {
    throw new JpegTransformError(
      'Failed to create jpegtran wasm state',
      'JPEG_TRANSFORM_INIT_FAILED'
    );
  }

  const inputPtr = wasm._malloc(normalizedBytes.length);
  if (!inputPtr) {
    wasm._jpegtran_wasm_destroy(state);
    throw new JpegTransformError(
      'Failed to allocate memory for JPEG input',
      'JPEG_TRANSFORM_ALLOC_FAILED'
    );
  }

  try {
    wasm.HEAPU8.set(normalizedBytes, inputPtr);
    const result = wasm._jpegtran_wasm_transform(
      state,
      inputPtr,
      normalizedBytes.length,
      transformCode,
      trim ? 1 : 0,
      perfect ? 1 : 0
    );
    if (result !== 0) {
      throw createTransformFailureError(wasm, state, normalizedTransform);
    }

    const outputPtr = wasm._jpegtran_wasm_get_output_data(state);
    const outputSize = wasm._jpegtran_wasm_get_output_size(state);
    if (!outputPtr || !outputSize) {
      throw new JpegTransformError(
        'JPEG transform produced an empty output buffer',
        'JPEG_TRANSFORM_EMPTY_OUTPUT',
        { transform: normalizedTransform }
      );
    }

    return new Uint8Array(wasm.HEAPU8.buffer, outputPtr, outputSize).slice();
  } finally {
    wasm._free(inputPtr);
    wasm._jpegtran_wasm_destroy(state);
  }
}
