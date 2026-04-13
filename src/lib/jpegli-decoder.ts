export type JpegliEncodeOptions = {
  onProgress?: (progress: number, metadata?: Record<string, unknown>) => void;
  chunkRows?: number;
  inputMode?: string;
  iccProfile?: Uint8Array;
};

export type DecodedJpegliImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray<ArrayBuffer>;
};

interface JpegliWasmFactoryOptions {
  wasmBinary: ArrayBuffer;
  locateFile: (path: string) => string;
}

type JpegliWasmModule = {
  HEAPU8: Uint8Array;
  _malloc(size: number): number;
  _free(ptr: number): void;
  _jpegli_wasm_encoder_create?(): number;
  _jpegli_wasm_encoder_destroy?(state: number): void;
  _jpegli_wasm_encoder_start?(state: number, inputPtr: number, width: number, height: number, quality: number): number;
  _jpegli_wasm_encoder_process_rows?(state: number, chunkRows: number): number;
  _jpegli_wasm_encoder_finish?(state: number): number;
  _jpegli_wasm_encoder_get_next_scanline?(state: number): number;
  _jpegli_wasm_encoder_get_image_height?(state: number): number;
  _jpegli_wasm_encoder_set_input_mode?(state: number, channels: number): number;
  _jpegli_wasm_encoder_set_icc_profile?(state: number, ptr: number, size: number): number;
  _jpegli_wasm_encode?(state: number, inputPtr: number, width: number, height: number, quality: number): number;
  _jpegli_wasm_get_output_data?(state: number): number;
  _jpegli_wasm_get_output_size?(state: number): number;
  _jpegli_wasm_decoder_create?(): number;
  _jpegli_wasm_decoder_destroy?(state: number): void;
  _jpegli_wasm_decode?(state: number, inputPtr: number, inputSize: number): number;
  _jpegli_wasm_decoder_get_width?(state: number): number;
  _jpegli_wasm_decoder_get_height?(state: number): number;
  _jpegli_wasm_decoder_get_output_data?(state: number): number;
  _jpegli_wasm_decoder_get_output_size?(state: number): number;
};

let jpegliWasmModule: JpegliWasmModule | null = null;
let jpegliWasmModulePromise: Promise<JpegliWasmModule> | null = null;
let jpegliWasmLoadState: 'idle' | 'loading' | 'ready' | 'failed' = 'idle';
let jpegliWasmLoadError: Error | null = null;

const DEFAULT_CHUNK_ROWS = 64;

function resolveWasmBaseUrl(): string {
  let baseUrl = import.meta.env.BASE_URL || '/';
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  return baseUrl;
}

const WASM_ASSET_VERSION = typeof import.meta.env.VITE_WASM_ASSET_VERSION === 'string'
  ? import.meta.env.VITE_WASM_ASSET_VERSION.trim()
  : '';

function appendVersionQuery(url: string): string {
  if (!WASM_ASSET_VERSION) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(WASM_ASSET_VERSION)}`;
}

type RuntimeGlobal = typeof globalThis & {
  createJpegliWasm?: ((options: JpegliWasmFactoryOptions) => Promise<JpegliWasmModule>) | null;
  window?: {
    createJpegliWasm?: ((options: JpegliWasmFactoryOptions) => Promise<JpegliWasmModule>) | null;
  };
};

type JpegliWasmFactory = (options: JpegliWasmFactoryOptions) => Promise<JpegliWasmModule>;

function getRuntimeGlobal(): RuntimeGlobal {
  return globalThis as RuntimeGlobal;
}

function toJpegliFactory(candidate: unknown): JpegliWasmFactory | null {
  return typeof candidate === 'function' ? (candidate as JpegliWasmFactory) : null;
}

function getGlobalJpegliFactory(): JpegliWasmFactory | null {
  const runtimeGlobal = getRuntimeGlobal();
  return toJpegliFactory(runtimeGlobal.createJpegliWasm ?? runtimeGlobal.window?.createJpegliWasm);
}

function getSharedDiagnosticsRecorderSafe() {
  try {
    return getSharedDiagnosticsRecorder(globalThis);
  } catch {
    return null;
  }
}

function recordJpegliDiagnostic(
  name: string,
  severity: 'info' | 'warning' | 'error' = 'info',
  context: Record<string, unknown> = {},
): void {
  getSharedDiagnosticsRecorderSafe()?.record({
    category: name === 'jpegli-loader-failed' ? 'error' : 'runtime',
    name,
    severity,
    context,
  });
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error && typeof error.message === 'string') {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

function classifyLoaderError(error: unknown): string {
  const message = normalizeErrorMessage(error).toLowerCase();
  if (message.includes('timed out')) {
    return 'factory-load-timeout';
  }
  if (message.includes('failed to fetch') || message.includes('offline') || message.includes('network')) {
    return 'asset-fetch-failed';
  }
  if (message.includes('not found')) {
    return 'factory-not-found';
  }
  if (message.includes('missing wasmbinary')) {
    return 'missing-wasm-binary';
  }
  return 'unknown';
}

function resolveFetchableAssetUrl(assetUrl: string): string {
  try {
    return new URL(assetUrl, globalThis.location?.href || 'https://ultrahdr.invalid/').toString();
  } catch {
    return assetUrl;
  }
}

async function loadWasmBinaryWithOfflineFallback(
  wasmBinaryPath: string,
): Promise<{ wasmBinary: ArrayBuffer; cacheSource: 'network' | 'cache' }> {
  const requestUrl = resolveFetchableAssetUrl(wasmBinaryPath);
  try {
    const response = await fetch(requestUrl, { credentials: 'same-origin' });
    if (!response.ok) {
      throw new Error(`Failed to fetch Jpegli WASM binary: ${response.status}`);
    }
    return {
      wasmBinary: await response.arrayBuffer(),
      cacheSource: 'network',
    };
  } catch (fetchError) {
    const cacheStorage = globalThis.caches;
    if (!cacheStorage || typeof cacheStorage.match !== 'function') {
      throw fetchError;
    }

    const cachedResponse = await cacheStorage.match(requestUrl) || await cacheStorage.match(wasmBinaryPath);
    if (!cachedResponse) {
      throw fetchError;
    }

    return {
      wasmBinary: await cachedResponse.arrayBuffer(),
      cacheSource: 'cache',
    };
  }
}

async function loadJpegliFactoryViaScriptTag(wasmJsPath: string): Promise<JpegliWasmFactory> {
  const existingFactory = getGlobalJpegliFactory();
  if (existingFactory) {
    return existingFactory;
  }

  if (typeof document === 'undefined') {
    throw new Error('document is unavailable for jpegli script loading');
  }

  return new Promise<JpegliWasmFactory>((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      reject(new Error(`Timed out loading Jpegli WASM script from ${wasmJsPath}`));
    }, 3_000);

    const settle = (callback: () => void): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      callback();
    };

    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${wasmJsPath}"]`);
    if (existingScript) {
      const scriptFactory = getGlobalJpegliFactory();
      if (scriptFactory) {
        settle(() => resolve(scriptFactory));
        return;
      }
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = wasmJsPath;
    script.onload = () => {
      const loadedFactory = getGlobalJpegliFactory();
      if (loadedFactory) {
        settle(() => resolve(loadedFactory));
        return;
      }
      settle(() => reject(new Error('Jpegli WASM factory not found after script load')));
    };
    script.onerror = () => {
      settle(() => reject(new Error(`Failed to load Jpegli WASM script from ${wasmJsPath}`)));
    };
    (document.head || document.body || document.documentElement).appendChild(script);
  });
}

function normalizeQualityRatio(quality: number): number {
  const normalized = Number(quality);
  if (!Number.isFinite(normalized)) {
    return 0.95;
  }
  const clamped = Math.max(1, Math.min(100, normalized));
  return clamped / 100.0;
}

function normalizeChunkRows(chunkRows: number | undefined, imageHeight: number): number {
  const requested = Math.floor(Number(chunkRows));
  const fallback = Math.max(1, Math.min(DEFAULT_CHUNK_ROWS, Math.max(1, imageHeight)));
  if (!Number.isFinite(requested) || requested <= 0) {
    return fallback;
  }
  return Math.max(1, Math.min(requested, Math.max(1, imageHeight)));
}

function invokeProgressCallback(
  onProgress: JpegliEncodeOptions['onProgress'],
  progress: number,
  metadata: Record<string, unknown> = {},
): void {
  if (typeof onProgress !== 'function') {
    return;
  }
  try {
    onProgress(progress, metadata);
  } catch (error) {
    console.warn('[Jpegli] Progress callback failed:', error);
  }
}

function readEncodedBytes(wasm: JpegliWasmModule, encoderState: number): Uint8Array {
  const outBufferPtr = wasm._jpegli_wasm_get_output_data?.(encoderState) ?? 0;
  const outSize = wasm._jpegli_wasm_get_output_size?.(encoderState) ?? 0;

  if (!outBufferPtr || outSize === 0) {
    throw new Error('Jpegli encoding returned empty buffer');
  }

  const jpegBytes = new Uint8Array(wasm.HEAPU8.buffer, outBufferPtr, outSize);
  return new Uint8Array(jpegBytes);
}

function hasChunkedEncodeApi(wasm: JpegliWasmModule): boolean {
  return typeof wasm._jpegli_wasm_encoder_start === 'function'
    && typeof wasm._jpegli_wasm_encoder_process_rows === 'function'
    && typeof wasm._jpegli_wasm_encoder_finish === 'function'
    && typeof wasm._jpegli_wasm_encoder_get_next_scanline === 'function'
    && typeof wasm._jpegli_wasm_encoder_get_image_height === 'function';
}

function configureEncoder(wasm: JpegliWasmModule, encoderState: number, options: JpegliEncodeOptions = {}): void {
  if (
    options.inputMode === 'grayscale'
    && typeof wasm._jpegli_wasm_encoder_set_input_mode === 'function'
  ) {
    const configured = Number(wasm._jpegli_wasm_encoder_set_input_mode(encoderState, 1));
    if (configured !== 0) {
      throw new Error('Jpegli grayscale input-mode configuration failed');
    }
  }

  const iccProfile = options.iccProfile;
  if (
    iccProfile instanceof Uint8Array
    && iccProfile.length > 0
    && typeof wasm._jpegli_wasm_encoder_set_icc_profile === 'function'
  ) {
    const iccPointer = wasm._malloc(iccProfile.length);
    if (!iccPointer) {
      throw new Error('Failed to allocate memory for ICC profile');
    }
    try {
      wasm.HEAPU8.set(iccProfile, iccPointer);
      const configured = Number(
        wasm._jpegli_wasm_encoder_set_icc_profile(encoderState, iccPointer, iccProfile.length),
      );
      if (configured !== 0) {
        throw new Error('Jpegli ICC profile configuration failed');
      }
    } finally {
      wasm._free(iccPointer);
    }
  }
}

type RgbaLike = {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array;
};

async function encodeJpegliWithLegacyApi(
  wasm: JpegliWasmModule,
  imageData: RgbaLike,
  quality = 95,
  options: JpegliEncodeOptions = {},
): Promise<Uint8Array> {
  const { width, height, data } = imageData;
  const inputSize = width * height * 4;

  const inputPointer = wasm._malloc(inputSize);
  wasm.HEAPU8.set(data, inputPointer);

  const encoderState = wasm._jpegli_wasm_encoder_create?.();
  if (!encoderState) {
    wasm._free(inputPointer);
    throw new Error('Failed to create Jpegli encoder state');
  }

  try {
    configureEncoder(wasm, encoderState, options);
    const success = wasm._jpegli_wasm_encode?.(
      encoderState,
      inputPointer,
      width,
      height,
      normalizeQualityRatio(quality),
    );

    if (success !== 0) {
      throw new Error('Jpegli encoding failed');
    }

    return readEncodedBytes(wasm, encoderState);
  } finally {
    wasm._jpegli_wasm_encoder_destroy?.(encoderState);
    wasm._free(inputPointer);
  }
}

async function encodeJpegliWithChunkedApi(
  wasm: JpegliWasmModule,
  imageData: RgbaLike,
  quality = 95,
  options: JpegliEncodeOptions = {},
): Promise<Uint8Array> {
  const { width, height, data } = imageData;
  const inputSize = width * height * 4;
  const chunkRows = normalizeChunkRows(options.chunkRows, height);
  const inputPointer = wasm._malloc(inputSize);
  wasm.HEAPU8.set(data, inputPointer);

  const encoderState = wasm._jpegli_wasm_encoder_create?.();
  if (!encoderState) {
    wasm._free(inputPointer);
    throw new Error('Failed to create Jpegli encoder state');
  }

  try {
    configureEncoder(wasm, encoderState, options);
    const started = wasm._jpegli_wasm_encoder_start?.(
      encoderState,
      inputPointer,
      width,
      height,
      normalizeQualityRatio(quality),
    );

    if (started !== 0) {
      throw new Error('Jpegli chunked encoding start failed');
    }

    const totalRows = Math.max(1, Number(wasm._jpegli_wasm_encoder_get_image_height?.(encoderState)) || height || 1);
    let emittedProgress = -1;
    invokeProgressCallback(options.onProgress, 0, {
      jpegliRowsEncoded: 0,
      jpegliTotalRows: totalRows,
      jpegliChunkRows: chunkRows,
    });
    emittedProgress = 0;

    while (true) {
      const nextScanline = Number(wasm._jpegli_wasm_encoder_get_next_scanline?.(encoderState)) || 0;
      if (nextScanline >= totalRows) {
        break;
      }

      const rowsProcessed = Number(wasm._jpegli_wasm_encoder_process_rows?.(encoderState, chunkRows));
      if (!Number.isFinite(rowsProcessed) || rowsProcessed < 0) {
        throw new Error('Jpegli chunked encoding failed while processing scanlines');
      }

      const updatedScanline = Number(wasm._jpegli_wasm_encoder_get_next_scanline?.(encoderState)) || 0;
      if (rowsProcessed === 0 && updatedScanline <= nextScanline) {
        throw new Error('Jpegli chunked encoding made no progress');
      }

      const progress = Math.max(0, Math.min(99, Math.floor((updatedScanline / totalRows) * 100)));
      if (progress > emittedProgress) {
        invokeProgressCallback(options.onProgress, progress, {
          jpegliRowsEncoded: Math.min(totalRows, updatedScanline),
          jpegliTotalRows: totalRows,
          jpegliChunkRows: chunkRows,
        });
        emittedProgress = progress;
      }
    }

    const finished = wasm._jpegli_wasm_encoder_finish?.(encoderState);
    if (finished !== 0) {
      throw new Error('Jpegli chunked encoding finish failed');
    }

    invokeProgressCallback(options.onProgress, 100, {
      jpegliRowsEncoded: totalRows,
      jpegliTotalRows: totalRows,
      jpegliChunkRows: chunkRows,
    });

    return readEncodedBytes(wasm, encoderState);
  } finally {
    wasm._jpegli_wasm_encoder_destroy?.(encoderState);
    wasm._free(inputPointer);
  }
}

export async function ensureJpegliLoaded(): Promise<JpegliWasmModule> {
  if (jpegliWasmModule) {
    return jpegliWasmModule;
  }
  if (jpegliWasmModulePromise) {
    return jpegliWasmModulePromise;
  }
  if (jpegliWasmLoadState === 'failed' && jpegliWasmLoadError) {
    throw jpegliWasmLoadError;
  }

  const baseUrl = resolveWasmBaseUrl();
  const wasmBinaryPath = appendVersionQuery(`${baseUrl}assets/jpegli_wasm.wasm`);
  const wasmJsPath = appendVersionQuery(`${baseUrl}assets/jpegli_wasm.js`);
  jpegliWasmLoadState = 'loading';
  recordJpegliDiagnostic('jpegli-loader-started', 'info', {
    trigger: 'module-load',
    hasGlobalFactory: getGlobalJpegliFactory() !== null,
  });

  jpegliWasmModulePromise = (async () => {
    try {
      const { wasmBinary, cacheSource } = await loadWasmBinaryWithOfflineFallback(wasmBinaryPath);
      recordJpegliDiagnostic('jpegli-wasm-binary-fetched', 'info', {
        trigger: 'module-load',
        byteLength: wasmBinary.byteLength,
        cacheSource,
      });

      const factory = getGlobalJpegliFactory() ?? await loadJpegliFactoryViaScriptTag(wasmJsPath);
      recordJpegliDiagnostic('jpegli-factory-resolved', 'info', {
        trigger: 'module-load',
        source: getGlobalJpegliFactory() ? 'global' : 'script-tag',
      });

      jpegliWasmModule = await factory({
        wasmBinary,
        locateFile: (path: string) => appendVersionQuery(`${baseUrl}assets/${path}`),
      });
      jpegliWasmLoadState = 'ready';
      jpegliWasmLoadError = null;
      recordJpegliDiagnostic('jpegli-loader-ready', 'info', {
        trigger: 'module-load',
      });
      return jpegliWasmModule as JpegliWasmModule;
    } catch (error) {
      const normalizedError = new Error('Jpegli WASM module failed to load');
      const errorMessage = normalizeErrorMessage(error);
      normalizedError.cause = error;
      jpegliWasmLoadState = 'failed';
      jpegliWasmLoadError = normalizedError;
      recordJpegliDiagnostic('jpegli-loader-failed', 'error', {
        trigger: 'module-load',
        errorCategory: classifyLoaderError(error),
        message: errorMessage.slice(0, 200),
      });
      throw normalizedError;
    }
  })();

  return jpegliWasmModulePromise;
}

function resetJpegliWasmModuleState(): void {
  jpegliWasmModule = null;
  jpegliWasmModulePromise = null;
  jpegliWasmLoadState = 'idle';
  jpegliWasmLoadError = null;
}

export function resetJpegliBootstrapState(): void {
  resetJpegliWasmModuleState();
}

export async function bootstrapJpegliRuntime(
  options: { resetBeforeLoad?: boolean } = {},
): Promise<{ ready: true; module: JpegliWasmModule }> {
  if (options.resetBeforeLoad === true) {
    resetJpegliWasmModuleState();
  }
  const module = await ensureJpegliLoaded();
  return {
    ready: true,
    module,
  };
}

export async function encodeJpegliLegacyForTests(imageData: RgbaLike, quality = 95): Promise<Uint8Array> {
  const wasm = await ensureJpegliLoaded();
  return encodeJpegliWithLegacyApi(wasm, imageData, quality);
}

export async function encodeJpegli(
  imageData: RgbaLike,
  quality = 95,
  options: JpegliEncodeOptions = {},
): Promise<Uint8Array> {
  const wasm = await ensureJpegliLoaded();

  if (hasChunkedEncodeApi(wasm)) {
    return encodeJpegliWithChunkedApi(wasm, imageData, quality, options);
  }

  invokeProgressCallback(options.onProgress, 0, {
    jpegliRowsEncoded: 0,
    jpegliTotalRows: Math.max(1, Number(imageData?.height) || 1),
    jpegliChunkRows: normalizeChunkRows(options.chunkRows, imageData?.height || 1),
  });
  const result = await encodeJpegliWithLegacyApi(wasm, imageData, quality, options);
  invokeProgressCallback(options.onProgress, 100, {
    jpegliRowsEncoded: Math.max(1, Number(imageData?.height) || 1),
    jpegliTotalRows: Math.max(1, Number(imageData?.height) || 1),
    jpegliChunkRows: normalizeChunkRows(options.chunkRows, imageData?.height || 1),
  });
  return result;
}

export async function decodeJpegli(inputBytes: Uint8Array | ArrayBuffer): Promise<DecodedJpegliImage> {
  const normalizedBytes = inputBytes instanceof Uint8Array ? inputBytes : new Uint8Array(inputBytes);
  const wasm = await ensureJpegliLoaded();
  if (
    typeof wasm._jpegli_wasm_decoder_create !== 'function'
    || typeof wasm._jpegli_wasm_decode !== 'function'
  ) {
    const imageData = await decodeRasterBuffer(normalizedBytes);
    return {
      width: imageData.width,
      height: imageData.height,
      data: new Uint8ClampedArray(imageData.data),
    };
  }
  const decoderState = wasm._jpegli_wasm_decoder_create?.();
  if (!decoderState) {
    throw new Error('Failed to create Jpegli decoder state');
  }

  const inputPointer = wasm._malloc(normalizedBytes.length);
  if (!inputPointer) {
    wasm._jpegli_wasm_decoder_destroy?.(decoderState);
    throw new Error('Failed to allocate memory for JPEG input');
  }

  try {
    wasm.HEAPU8.set(normalizedBytes, inputPointer);
    const status = wasm._jpegli_wasm_decode?.(decoderState, inputPointer, normalizedBytes.length);
    if (status !== 0) {
      throw new Error('Jpegli decoding failed');
    }

    const width = Number(wasm._jpegli_wasm_decoder_get_width?.(decoderState)) || 0;
    const height = Number(wasm._jpegli_wasm_decoder_get_height?.(decoderState)) || 0;
    const outputPtr = Number(wasm._jpegli_wasm_decoder_get_output_data?.(decoderState)) || 0;
    const outputSize = Number(wasm._jpegli_wasm_decoder_get_output_size?.(decoderState)) || 0;

    if (!width || !height || !outputPtr || outputSize !== width * height * 4) {
      throw new Error('Jpegli decoding returned invalid image metadata');
    }

    return {
      width,
      height,
      data: new Uint8ClampedArray(new Uint8Array(wasm.HEAPU8.buffer, outputPtr, outputSize)),
    };
  } finally {
    wasm._free(inputPointer);
    wasm._jpegli_wasm_decoder_destroy?.(decoderState);
  }
}

export function __resetJpegliWasmModuleForTests(): void {
  resetJpegliWasmModuleState();
}
import { decodeRasterBuffer } from './raster-image.ts';
import { getSharedDiagnosticsRecorder } from './diagnostics.ts';
