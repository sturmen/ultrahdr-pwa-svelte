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

  const baseUrl = resolveWasmBaseUrl();
  const globalFactory = (globalThis as { createJpegliWasm?: (options: Record<string, unknown>) => Promise<JpegliWasmModule> }).createJpegliWasm;

  if (typeof globalFactory === 'function') {
    jpegliWasmModule = await globalFactory({
      locateFile: (path: string) => appendVersionQuery(`${baseUrl}assets/${path}`),
    });
    return jpegliWasmModule as JpegliWasmModule;
  }

  const wasmJsPath = appendVersionQuery(`${baseUrl}assets/jpegli_wasm.js`);
  try {
    const importedModule = await import(/* @vite-ignore */ wasmJsPath);
    const createWasm = importedModule?.default || importedModule?.createJpegliWasm;
    if (typeof createWasm === 'function') {
      jpegliWasmModule = await createWasm({
        locateFile: (path: string) => appendVersionQuery(`${baseUrl}assets/${path}`),
      });
      return jpegliWasmModule as JpegliWasmModule;
    }
    throw new Error('createJpegliWasm not found in imported module');
  } catch (error) {
    try {
      const response = await fetch(wasmJsPath);
      const source = typeof response.text === 'function' ? await response.text() : '';
      if (source) {
        const evaluateFactory = new Function(
          `${source}\nreturn (typeof createJpegliWasm === "function" ? createJpegliWasm : (typeof globalThis !== "undefined" ? globalThis.createJpegliWasm : null));`,
        );
        const createWasm = evaluateFactory();
        if (typeof createWasm === 'function') {
          jpegliWasmModule = await createWasm({
            locateFile: (path: string) => appendVersionQuery(`${baseUrl}assets/${path}`),
          });
          return jpegliWasmModule as JpegliWasmModule;
        }
      }
    } catch (fetchError) {
      console.warn('Fallback eval failed:', fetchError);
    }
    console.warn('Failed to load jpegli WASM dynamically:', error);
    throw new Error('Jpegli WASM module failed to load');
  }
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
  jpegliWasmModule = null;
}
import { decodeRasterBuffer } from './raster-image.ts';
