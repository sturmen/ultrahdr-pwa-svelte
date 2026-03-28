import type {
  HdrIntentColorGamut,
  HdrIntentColorRange,
  HdrIntentColorTransfer,
} from './processing-types.js';
import type { GainMapMetadata } from './gain-map-metadata.js';

type HdrIntentFormat = 'rgba1010102' | 'rgbaf16' | 'p010';
type ReusableBufferName =
  | 'compressedBase'
  | 'compressedGainMap'
  | 'compressedGainMapMetadata'
  | 'hdrIntentImage';

interface RuntimeGlobal {
  UHDREncoderModule?: unknown;
  window?: {
    UHDREncoderModule?: unknown;
  };
}

interface ReusableBuffer {
  ptr: number;
  capacity: number;
}

interface WasmFactoryOptions {
  wasmBinary: ArrayBuffer;
  locateFile: (path: string) => string;
}

interface WasmModule {
  HEAPU8: Uint8Array;
  buffer?: ArrayBufferLike;
  wasmMemory?: unknown;
  UTF8ToString(ptr: number): string;
  getValue(ptr: number, type: 'i32'): number;
  _malloc(size: number): number;
  _free(ptr: number): void;
  _wasm_create_encoder(): number;
  _wasm_release_encoder(encoder: number): void;
  _wasm_reset_encoder(encoder: number): void;
  _wasm_enc_set_sdr_image(
    encoder: number,
    dataPtr: number,
    width: number,
    height: number,
    stride: number,
  ): number;
  _wasm_enc_set_compressed_base_image(
    encoder: number,
    dataPtr: number,
    size: number,
    capacity: number,
  ): number;
  _wasm_enc_set_exif_data(encoder: number, dataPtr: number, size: number, capacity: number): number;
  _wasm_enc_set_hdr_image(
    encoder: number,
    dataPtr: number,
    width: number,
    height: number,
    stride: number,
  ): number;
  _wasm_enc_set_hdr_intent_image(
    encoder: number,
    dataPtr: number,
    width: number,
    height: number,
    stride: number,
    formatCode: number,
    cgCode: number,
    ctCode: number,
    rangeCode: number,
  ): number;
  _wasm_enc_set_gainmap(
    encoder: number,
    dataPtr: number,
    width: number,
    height: number,
    stride: number,
    metaPtr: number,
  ): number;
  _wasm_enc_add_effect_rotate(encoder: number, degrees: number): number;
  _wasm_encode(encoder: number, quality: number): number;
  _wasm_get_encoded_data(encoder: number, sizePtr: number): number;
  _wasm_free_encoded_data(encoder: number, dataPtr: number | null): void;
  _wasm_get_error_message(encoder: number): number;
  _wasm_is_uhdr_image(dataPtr: number, size: number): number;
  _wasm_create_decoder(): number;
  _wasm_release_decoder(decoder: number): void;
  _wasm_dec_set_image(decoder: number, dataPtr: number, size: number): number;
  _wasm_dec_probe(decoder: number): number;
  _wasm_dec_get_gainmap_metadata(decoder: number, metaPtr: number): number;
  _wasm_dec_get_gainmap_image(decoder: number, sizePtr: number): number;
  _wasm_dec_get_base_image(decoder: number, sizePtr: number): number;
  _wasm_dec_get_gainmap_dimensions(decoder: number, widthPtr: number, heightPtr: number): number;
  _wasm_dec_add_effect_rotate(decoder: number, degrees: number): number;
  _wasm_dec_get_error_message(decoder: number): number;
}

type WasmFactory = (options: WasmFactoryOptions) => Promise<WasmModule>;

interface ImageAllocation {
  dataPtr: number;
  stride: number;
}

export interface HdrIntentImageDescriptor {
  strideBytes?: number;
  format?: HdrIntentFormat;
  cg?: HdrIntentColorGamut;
  ct?: HdrIntentColorTransfer;
  range?: HdrIntentColorRange;
}

export interface UhdrDecoderGainMapMetadata extends GainMapMetadata {
  useBaseCg: boolean;
}

export interface WasmStatus {
  loaded: boolean;
  module: WasmModule | null;
  error: unknown;
}

let _wasmModule: WasmModule | null = null;
let _wasmLoaded = false;
let _wasmLoadError: unknown = null;

const WASM_ASSET_VERSION =
  typeof import.meta.env.VITE_WASM_ASSET_VERSION === 'string'
    ? import.meta.env.VITE_WASM_ASSET_VERSION.trim()
    : '';

function appendVersionQuery(url: string): string {
  if (!WASM_ASSET_VERSION) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(WASM_ASSET_VERSION)}`;
}

function getRuntimeGlobal(): RuntimeGlobal {
  return (typeof globalThis !== 'undefined' ? globalThis : {}) as RuntimeGlobal;
}

function toWasmFactory(candidate: unknown): WasmFactory | null {
  return typeof candidate === 'function' ? (candidate as WasmFactory) : null;
}

function getGlobalWasmFactory(): WasmFactory | null {
  const runtimeGlobal = getRuntimeGlobal();
  return toWasmFactory(runtimeGlobal.UHDREncoderModule ?? runtimeGlobal.window?.UHDREncoderModule);
}

function resolveWasmBaseUrl(): string {
  let baseUrl = import.meta.env.BASE_URL || '/';
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  return baseUrl;
}

async function loadWasmBinaryWithOfflineFallback(wasmBinaryPath: string): Promise<ArrayBuffer> {
  try {
    const wasmResponse = await fetch(wasmBinaryPath);
    if (!wasmResponse.ok) {
      throw new Error(`Failed to fetch WASM binary: ${wasmResponse.status} ${wasmResponse.statusText}`);
    }
    return wasmResponse.arrayBuffer();
  } catch (fetchError) {
    const cacheStorage = globalThis.caches;
    if (!cacheStorage || typeof cacheStorage.match !== 'function') {
      throw fetchError;
    }

    const cachedResponse = await cacheStorage.match(wasmBinaryPath);
    if (!cachedResponse) {
      throw fetchError;
    }

    return cachedResponse.arrayBuffer();
  }
}

async function loadWasmFactoryViaModuleImport(wasmJsPath: string): Promise<WasmFactory> {
  const importedModule = (await import(/* @vite-ignore */ wasmJsPath)) as {
    default?: unknown;
    UHDREncoderModule?: unknown;
  };
  const moduleFactory = toWasmFactory(importedModule.default ?? importedModule.UHDREncoderModule);
  if (moduleFactory) {
    return moduleFactory;
  }

  const globalFactory = getGlobalWasmFactory();
  if (globalFactory) {
    return globalFactory;
  }

  throw new Error('UHDREncoderModule not found after module import');
}

async function loadWasmFactoryViaEval(wasmJsPath: string): Promise<WasmFactory> {
  const response = await fetch(wasmJsPath, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Failed to fetch WASM script from ${wasmJsPath}: ${response.status}`);
  }

  const source = await response.text();
  const evaluateFactory = new Function(
    `${source}\n` +
      'return (typeof UHDREncoderModule === "function" ? UHDREncoderModule : ' +
      '(typeof globalThis !== "undefined" ? globalThis.UHDREncoderModule : null));',
  ) as () => unknown;
  const evaluatedFactory = toWasmFactory(evaluateFactory());
  if (!evaluatedFactory) {
    throw new Error('UHDREncoderModule not found after script evaluation');
  }

  getRuntimeGlobal().UHDREncoderModule = evaluatedFactory;
  return evaluatedFactory;
}

async function loadWasmFactoryViaScriptTag(wasmJsPath: string): Promise<WasmFactory> {
  return new Promise<WasmFactory>((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      reject(new Error(`Timed out loading WASM script from ${wasmJsPath}`));
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
      const existingFactory = getGlobalWasmFactory();
      if (existingFactory) {
        settle(() => resolve(existingFactory));
        return;
      }

      existingScript.addEventListener(
        'load',
        () => {
          const loadedFactory = getGlobalWasmFactory();
          if (loadedFactory) {
            settle(() => resolve(loadedFactory));
            return;
          }
          settle(() => reject(new Error('UHDREncoderModule not found after script load')));
        },
        { once: true },
      );
      existingScript.addEventListener(
        'error',
        () => {
          settle(() => reject(new Error(`Failed to load WASM script from ${wasmJsPath}`)));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = wasmJsPath;
    script.async = true;
    script.onload = () => {
      console.log('[WASM] Script loaded from:', wasmJsPath);
      const loadedFactory = getGlobalWasmFactory();
      if (loadedFactory) {
        settle(() => resolve(loadedFactory));
        return;
      }
      settle(() => reject(new Error('UHDREncoderModule not defined after loading script')));
    };
    script.onerror = () => {
      settle(() => reject(new Error(`Failed to load WASM script from ${wasmJsPath}`)));
    };
    document.head.appendChild(script);
  });
}

async function loadWasmFactory(): Promise<WasmFactory> {
  const preloadedFactory = getGlobalWasmFactory();
  if (preloadedFactory) {
    return preloadedFactory;
  }

  const wasmJsPath = appendVersionQuery(`${resolveWasmBaseUrl()}assets/ultrahdr_wasm.js`);
  console.log('[WASM] Loading from:', wasmJsPath);

  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    try {
      return await loadWasmFactoryViaScriptTag(wasmJsPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/Timed out loading WASM script/i.test(message)) {
        throw error;
      }
      return loadWasmFactoryViaEval(wasmJsPath);
    }
  }

  try {
    return await loadWasmFactoryViaModuleImport(wasmJsPath);
  } catch {
    return loadWasmFactoryViaEval(wasmJsPath);
  }
}

async function loadWasmModule(): Promise<void> {
  if (_wasmLoaded && _wasmModule) {
    return;
  }
  if (_wasmLoadError) {
    throw _wasmLoadError;
  }

  try {
    const UHDREncoderModule = await loadWasmFactory();
    const wasmBinaryPath = appendVersionQuery(`${resolveWasmBaseUrl()}assets/ultrahdr_wasm.wasm`);
    console.log('[WASM] WASM binary path:', wasmBinaryPath);
    console.log('[WASM] Pre-fetching WASM binary...');
    const wasmBinary = await loadWasmBinaryWithOfflineFallback(wasmBinaryPath);
    console.log('[WASM] WASM binary fetched:', wasmBinary.byteLength, 'bytes');

    _wasmModule = await UHDREncoderModule({
      wasmBinary,
      locateFile: (path: string): string => {
        if (path.endsWith('.wasm')) {
          return wasmBinaryPath;
        }
        return path;
      },
    });

    _wasmLoaded = true;
    console.log('[WASM] libultrahdr module initialized');
    console.log('[WASM] Asset version token:', WASM_ASSET_VERSION || '(none)');
    console.log('[WASM] Module keys:', Object.keys(_wasmModule));
    console.log('[WASM] Module.HEAPU8 type:', typeof _wasmModule.HEAPU8);
    console.log('[WASM] Module.buffer type:', typeof _wasmModule.buffer);
    console.log('[WASM] Module.wasmMemory type:', typeof _wasmModule.wasmMemory);
  } catch (error) {
    _wasmLoadError = error;
    console.error('[WASM] Failed to load module:', error);
    throw error;
  }
}

export function isWasmLoaded(): boolean {
  return _wasmLoaded && _wasmModule !== null;
}

function getWasmModule(): WasmModule {
  if (_wasmModule === null) {
    throw new Error('WASM module has not been loaded');
  }
  return _wasmModule;
}

export class UHDREncoder {
  private _encoder: number | null = null;
  private _allocatedMemory: number[] = [];
  private _reusableBuffers: Record<ReusableBufferName, ReusableBuffer | null> = {
    compressedBase: null,
    compressedGainMap: null,
    compressedGainMapMetadata: null,
    hdrIntentImage: null,
  };
  private _initialized = false;

  async init(): Promise<void> {
    await loadWasmModule();
    const module = getWasmModule();

    this._encoder = module._wasm_create_encoder();
    if (!this._encoder) {
      throw new Error('Failed to create WASM encoder');
    }
    this._initialized = true;
    console.log('[WASM] Encoder created:', this._encoder);
  }

  isInitialized(): boolean {
    return this._initialized && this._encoder !== null;
  }

  setSDRImage(data: ImageData | Uint8Array, width: number, height: number, stride = 0): void {
    const encoder = this.requireEncoder();
    const module = getWasmModule();
    const allocation = this._allocateImageData(data, width, height, stride, 'SDR');

    try {
      console.log(
        `[WASM] JS Calling setSDRImage: ptr=${allocation.dataPtr}, w=${width}, h=${height}, stride=${allocation.stride}, HEAP=${module.HEAPU8.byteLength}`,
      );
      const result = module._wasm_enc_set_sdr_image(
        encoder,
        allocation.dataPtr,
        width,
        height,
        allocation.stride,
      );
      this._checkResult(result, 'Failed to set SDR image');
    } finally {
      this._freeMemory(allocation.dataPtr);
    }
  }

  setCompressedBaseImage(data: Uint8Array): void {
    const encoder = this.requireEncoder();
    const module = getWasmModule();
    const size = data.length;
    const { ptr, capacity } = this._ensureReusableBuffer('compressedBase', size, 'compressed base image');
    new Uint8Array(module.HEAPU8.buffer).set(data, ptr);

    console.log(`[WASM] JS Calling setCompressedBaseImage: ptr=${ptr}, size=${size}`);
    const result = module._wasm_enc_set_compressed_base_image(encoder, ptr, size, capacity);
    this._checkResult(result, 'Failed to set compressed base image');
  }

  setExifData(exifPayload: Uint8Array): void {
    const encoder = this.requireEncoder();
    if (!(exifPayload instanceof Uint8Array) || exifPayload.length === 0) {
      return;
    }

    const module = getWasmModule();
    const size = exifPayload.length;
    const ptr = module._malloc(size);
    if (!ptr) {
      throw new Error(`Failed to allocate ${size} bytes for EXIF payload`);
    }

    new Uint8Array(module.HEAPU8.buffer).set(exifPayload, ptr);

    try {
      const result = module._wasm_enc_set_exif_data(encoder, ptr, size, size);
      this._checkResult(result, 'Failed to set EXIF payload');
    } finally {
      module._free(ptr);
    }
  }

  setHDRImage(data: ImageData | Uint8Array, width: number, height: number, stride = 0): void {
    const encoder = this.requireEncoder();
    const module = getWasmModule();
    const allocation = this._allocateImageData(data, width, height, stride, 'HDR');

    try {
      const result = module._wasm_enc_set_hdr_image(
        encoder,
        allocation.dataPtr,
        width,
        height,
        allocation.stride,
      );
      this._checkResult(result, 'Failed to set HDR image');
    } finally {
      this._freeMemory(allocation.dataPtr);
    }
  }

  setHDRIntentImage(
    data: Uint8Array,
    width: number,
    height: number,
    descriptor: HdrIntentImageDescriptor = {},
  ): void {
    const encoder = this.requireEncoder();

    const format = descriptor.format ?? 'rgba1010102';
    const cg = descriptor.cg ?? 'bt2100';
    const ct = descriptor.ct ?? 'pq';
    const range = descriptor.range ?? 'full';
    const bytesPerPixel = format === 'rgbaf16' ? 8 : 4;
    const strideBytes = descriptor.strideBytes ?? width * bytesPerPixel;

    const formatCodeMap: Record<HdrIntentFormat, number> = {
      p010: 0,
      rgba1010102: 5,
      rgbaf16: 4,
    };
    const cgCodeMap: Record<HdrIntentColorGamut, number> = {
      bt709: 0,
      displayp3: 1,
      bt2100: 2,
    };
    const ctCodeMap: Record<HdrIntentColorTransfer, number> = {
      linear: 0,
      hlg: 1,
      pq: 2,
      srgb: 3,
    };
    const rangeCodeMap: Record<HdrIntentColorRange, number> = {
      limited: 0,
      full: 1,
    };

    const formatCode = formatCodeMap[format];
    const cgCode = cgCodeMap[cg];
    const ctCode = ctCodeMap[ct];
    const rangeCode = rangeCodeMap[range];

    if (!Number.isInteger(formatCode) || (format !== 'rgba1010102' && format !== 'rgbaf16')) {
      throw new Error(`Unsupported HDR intent format for WASM encoder: ${format}`);
    }
    if (!Number.isInteger(cgCode) || !Number.isInteger(ctCode) || !Number.isInteger(rangeCode)) {
      throw new Error(`Unsupported HDR intent color descriptor: cg=${cg} ct=${ct} range=${range}`);
    }

    const module = getWasmModule();
    const allocation = this._allocateImageData(
      data,
      width,
      height,
      strideBytes,
      'HDRIntent',
      'hdrIntentImage',
    );
    const result = module._wasm_enc_set_hdr_intent_image(
      encoder,
      allocation.dataPtr,
      width,
      height,
      allocation.stride,
      formatCode,
      cgCode,
      ctCode,
      rangeCode,
    );
    this._checkResult(result, 'Failed to set HDR intent image');
  }

  setGainMapImage(
    data: ImageData | Uint8Array,
    metadata: GainMapMetadata,
    width: number,
    height: number,
    stride = 0,
  ): void {
    const encoder = this.requireEncoder();
    if (!metadata) {
      throw new Error('Gain map metadata is required');
    }

    const module = getWasmModule();
    const allocation = this._allocateImageData(data, width, height, stride, 'GainMap');

    try {
      const metaPtr = module._malloc(23 * 4);
      if (!metaPtr) {
        this._freeMemory(allocation.dataPtr);
        throw new Error('Failed to allocate metadata memory');
      }

      try {
        const metaArray = new Float32Array(module.HEAPU8.buffer, metaPtr, 23);
        this.writeGainMapMetadata(metaArray, metadata);

        const result = module._wasm_enc_set_gainmap(
          encoder,
          allocation.dataPtr,
          width,
          height,
          allocation.stride,
          metaPtr,
        );
        this._checkResult(result, 'Failed to set gain map image');
      } finally {
        module._free(metaPtr);
      }
    } finally {
      this._freeMemory(allocation.dataPtr);
    }
  }

  setCompressedGainMapImage(data: Uint8Array, metadata: GainMapMetadata): void {
    const encoder = this.requireEncoder();
    if (!metadata) {
      throw new Error('Gain map metadata is required');
    }

    const module = getWasmModule();
    const size = data.length;
    const { ptr } = this._ensureReusableBuffer('compressedGainMap', size, 'compressed gain map image');
    new Uint8Array(module.HEAPU8.buffer).set(data, ptr);

    const { ptr: metaPtr } = this._ensureReusableBuffer(
      'compressedGainMapMetadata',
      23 * 4,
      'compressed gain map metadata',
    );
    const metaArray = new Float32Array(module.HEAPU8.buffer, metaPtr, 23);
    this.writeGainMapMetadata(metaArray, metadata);

    const result = module._wasm_enc_set_gainmap(encoder, ptr, size, 1, size, metaPtr);
    this._checkResult(result, 'Failed to set compressed gain map image');
  }

  addEffectRotate(degrees: number): void {
    const encoder = this.requireEncoder();
    const result = getWasmModule()._wasm_enc_add_effect_rotate(encoder, degrees);
    this._checkResult(result, 'Failed to add rotate effect');
  }

  encode(quality = 90): void {
    const encoder = this.requireEncoder();
    const result = getWasmModule()._wasm_encode(encoder, quality);
    this._checkResult(result, 'Encoding failed');
  }

  getEncodedData(): Uint8Array | null {
    const encoder = this.requireEncoder();
    const module = getWasmModule();
    const sizePtr = module._malloc(4);

    try {
      const dataPtr = module._wasm_get_encoded_data(encoder, sizePtr);
      if (!dataPtr) {
        return null;
      }

      const size = module.getValue(sizePtr, 'i32');
      if (size <= 0) {
        return null;
      }

      const result = new Uint8Array(size);
      for (let index = 0; index < size; index += 1) {
        result[index] = module.HEAPU8[dataPtr + index];
      }
      return result;
    } finally {
      module._free(sizePtr);
    }
  }

  freeEncodedData(): void {
    if (!this._initialized || this._encoder === null) {
      return;
    }

    getWasmModule()._wasm_free_encoded_data(this._encoder, null);
  }

  getErrorMessage(): string {
    if (!this._initialized || this._encoder === null) {
      return 'Encoder not initialized';
    }

    const module = getWasmModule();
    const msgPtr = module._wasm_get_error_message(this._encoder);
    if (!msgPtr) {
      return 'Unknown error';
    }

    return module.UTF8ToString(msgPtr);
  }

  reset(): void {
    if (!this._initialized || this._encoder === null) {
      return;
    }

    getWasmModule()._wasm_reset_encoder(this._encoder);
  }

  destroy(): void {
    this._freeReusableBuffers();
    if (this._encoder !== null) {
      getWasmModule()._wasm_release_encoder(this._encoder);
      this._encoder = null;
    }
    this._allocatedMemory = [];
    this._initialized = false;
  }

  dispose(): void {
    this.destroy();
  }

  private requireEncoder(): number {
    if (!this._initialized || this._encoder === null) {
      throw new Error('Encoder not initialized. Call init() first.');
    }
    return this._encoder;
  }

  private writeGainMapMetadata(target: Float32Array, metadata: GainMapMetadata): void {
    for (let index = 0; index < 3; index += 1) {
      target[index * 7] = metadata.gainMapMax?.[index] ?? 1.0;
      target[index * 7 + 3] = metadata.gainMapMin?.[index] ?? 1.0;
      target[index * 7 + 6] = metadata.gamma?.[index] ?? 1.0;
      target[index * 7 + 4] = metadata.offsetSdr?.[index] ?? 0.0;
      target[index * 7 + 5] = metadata.offsetHdr?.[index] ?? 0.0;
    }
    target[21] = metadata.hdrCapacityMin ?? 1.0;
    target[22] = metadata.hdrCapacityMax ?? 1.0;
  }

  private _allocateImageData(
    data: ImageData | Uint8Array,
    width: number,
    height: number,
    stride: number,
    label: string,
    reusableKey: ReusableBufferName | null = null,
  ): ImageAllocation {
    const module = getWasmModule();
    const hasImageDataConstructor = typeof ImageData !== 'undefined';

    let bytesPerPixel = width > 0 && stride > 0 ? Math.max(1, Math.floor(stride / width)) : 4;
    const pixelCount = width * height;

    if (data instanceof Uint8Array && data.length > 0 && (!stride || stride <= 0)) {
      if (data.length === pixelCount) {
        bytesPerPixel = 1;
      } else if (data.length === pixelCount * 3) {
        bytesPerPixel = 3;
      } else if (data.length === pixelCount * 8) {
        bytesPerPixel = 8;
      }
    } else if (hasImageDataConstructor && data instanceof ImageData) {
      bytesPerPixel = 4;
    }

    const unalignedStride = width * bytesPerPixel;
    const alignedStride = Math.ceil(unalignedStride / 64) * 64;
    const totalSize = alignedStride * height;
    const allocationSize = totalSize + 4_096;
    const dataPtr = reusableKey
      ? this._ensureReusableBuffer(reusableKey, allocationSize, `${label} image`).ptr
      : module._malloc(allocationSize);

    if (!dataPtr) {
      throw new Error(`Failed to allocate ${allocationSize} bytes for ${label} image`);
    }

    console.log(
      `[WASM] Allocated ${label} image: ${width}x${height}, stride=${alignedStride} (unaligned=${unalignedStride}), ptr=${dataPtr}`,
    );

    if (!reusableKey) {
      this._allocatedMemory.push(dataPtr);
    }

    const heap = new Uint8Array(module.HEAPU8.buffer);
    if (hasImageDataConstructor && data instanceof ImageData) {
      const src = new Uint8Array(data.data.buffer, data.data.byteOffset, data.data.byteLength);
      for (let y = 0; y < height; y += 1) {
        const srcStart = y * width * 4;
        const srcEnd = srcStart + unalignedStride;
        heap.set(src.subarray(srcStart, srcEnd), dataPtr + y * alignedStride);
      }
    } else if (data instanceof Uint8Array) {
      for (let y = 0; y < height; y += 1) {
        const srcStart = y * unalignedStride;
        const srcEnd = srcStart + unalignedStride;
        heap.set(data.subarray(srcStart, srcEnd), dataPtr + y * alignedStride);
      }
    } else {
      throw new Error(`Unsupported data type for ${label}: ${typeof data}`);
    }

    return { dataPtr, stride: alignedStride };
  }

  private _freeMemory(ptr: number): void {
    if (ptr) {
      getWasmModule()._free(ptr);
    }
    this._allocatedMemory = this._allocatedMemory.filter((allocatedPtr) => allocatedPtr !== ptr);
  }

  private _ensureReusableBuffer(name: ReusableBufferName, size: number, label: string): ReusableBuffer {
    const module = getWasmModule();
    const existing = this._reusableBuffers[name];
    if (existing && existing.capacity >= size) {
      return existing;
    }

    if (existing?.ptr) {
      module._free(existing.ptr);
    }

    const ptr = module._malloc(size);
    if (!ptr) {
      throw new Error(`Failed to allocate ${size} bytes for ${label}`);
    }

    const buffer = { ptr, capacity: size };
    this._reusableBuffers[name] = buffer;
    return buffer;
  }

  private _freeReusableBuffers(): void {
    const module = getWasmModule();
    const keys: ReusableBufferName[] = [
      'compressedBase',
      'compressedGainMap',
      'compressedGainMapMetadata',
      'hdrIntentImage',
    ];

    for (const key of keys) {
      const buffer = this._reusableBuffers[key];
      if (buffer?.ptr) {
        module._free(buffer.ptr);
      }
      this._reusableBuffers[key] = null;
    }
  }

  private _checkResult(result: number, message: string): void {
    if (result === 0) {
      return;
    }

    const errorType =
      (
        {
          [-1]: 'null pointer error',
          [-2]: 'invalid format',
          [-3]: 'invalid intent',
          [-4]: 'memory allocation failed',
          [-5]: 'encode failed',
          [-6]: 'buffer too small',
        } as Record<number, string>
      )[result] ?? `unknown error code ${result}`;

    throw new Error(`${message}: ${errorType} - ${this.getErrorMessage()}`);
  }
}

export async function isAvailable(): Promise<boolean> {
  try {
    await loadWasmModule();
    return isWasmLoaded();
  } catch {
    return false;
  }
}

export function getStatus(): WasmStatus {
  return {
    loaded: _wasmLoaded,
    module: _wasmModule,
    error: _wasmLoadError,
  };
}

export async function isUhdrImage(data: Uint8Array): Promise<boolean> {
  await loadWasmModule();
  const module = getWasmModule();
  const size = data.length;
  const ptr = module._malloc(size);
  if (!ptr) {
    return false;
  }

  try {
    new Uint8Array(module.HEAPU8.buffer).set(data, ptr);
    return module._wasm_is_uhdr_image(ptr, size) === 1;
  } finally {
    module._free(ptr);
  }
}

export class UHDRDecoder {
  private _decoder: number | null = null;
  private _initialized = false;
  private _currentImagePtr: number | null = null;

  async init(): Promise<void> {
    await loadWasmModule();
    this._decoder = getWasmModule()._wasm_create_decoder();
    if (!this._decoder) {
      throw new Error('Failed to create WASM decoder');
    }
    this._initialized = true;
  }

  setImage(data: Uint8Array): void {
    const decoder = this.requireDecoder();
    const module = getWasmModule();

    if (this._currentImagePtr) {
      module._free(this._currentImagePtr);
      this._currentImagePtr = null;
    }

    const size = data.length;
    const ptr = module._malloc(size);
    if (!ptr) {
      throw new Error('Failed to allocate memory for image');
    }

    new Uint8Array(module.HEAPU8.buffer).set(data, ptr);
    this._currentImagePtr = ptr;

    const result = module._wasm_dec_set_image(decoder, ptr, size);
    try {
      this._checkResult(result, 'Failed to set decoder image');
    } catch (error) {
      module._free(ptr);
      this._currentImagePtr = null;
      throw error;
    }
  }

  probe(): void {
    const decoder = this.requireDecoder();
    const result = getWasmModule()._wasm_dec_probe(decoder);
    this._checkResult(result, 'Probe failed');
  }

  getGainMapMetadata(): UhdrDecoderGainMapMetadata {
    const decoder = this.requireDecoder();
    const module = getWasmModule();
    const metaPtr = module._malloc(128);
    if (!metaPtr) {
      throw new Error('Failed to allocate memory for metadata');
    }

    try {
      const result = module._wasm_dec_get_gainmap_metadata(decoder, metaPtr);
      this._checkResult(result, 'Failed to get gainmap metadata');

      const floatData = new Float32Array(module.HEAPU8.buffer, metaPtr, 17);
      const intData = new Int32Array(module.HEAPU8.buffer, metaPtr + 17 * 4, 1);

      return {
        gainMapMax: [floatData[0], floatData[1], floatData[2]],
        gainMapMin: [floatData[3], floatData[4], floatData[5]],
        gamma: [floatData[6], floatData[7], floatData[8]],
        offsetSdr: [floatData[9], floatData[10], floatData[11]],
        offsetHdr: [floatData[12], floatData[13], floatData[14]],
        hdrCapacityMin: floatData[15],
        hdrCapacityMax: floatData[16],
        useBaseCg: intData[0] !== 0,
      };
    } finally {
      module._free(metaPtr);
    }
  }

  getGainMapImage(): Uint8Array {
    const decoder = this.requireDecoder();
    const module = getWasmModule();
    const sizePtr = module._malloc(4);
    if (!sizePtr) {
      throw new Error('Failed to allocate memory for size');
    }

    try {
      const dataPtr = module._wasm_dec_get_gainmap_image(decoder, sizePtr);
      const size = module.getValue(sizePtr, 'i32');
      if (!dataPtr || size <= 0) {
        throw new Error('No gain map image available');
      }
      return new Uint8Array(module.HEAPU8.buffer.slice(dataPtr, dataPtr + size));
    } finally {
      module._free(sizePtr);
    }
  }

  getBaseImage(): Uint8Array {
    const decoder = this.requireDecoder();
    const module = getWasmModule();
    const sizePtr = module._malloc(4);
    if (!sizePtr) {
      throw new Error('Failed to allocate memory for size');
    }

    try {
      const dataPtr = module._wasm_dec_get_base_image(decoder, sizePtr);
      const size = module.getValue(sizePtr, 'i32');
      if (!dataPtr || size <= 0) {
        throw new Error('No base image available');
      }
      return new Uint8Array(module.HEAPU8.buffer.slice(dataPtr, dataPtr + size));
    } finally {
      module._free(sizePtr);
    }
  }

  getGainMapDimensions(): { width: number; height: number } {
    const decoder = this.requireDecoder();
    const module = getWasmModule();
    const widthPtr = module._malloc(4);
    const heightPtr = module._malloc(4);
    if (!widthPtr || !heightPtr) {
      throw new Error('Failed to allocate memory for dimensions');
    }

    try {
      const result = module._wasm_dec_get_gainmap_dimensions(decoder, widthPtr, heightPtr);
      this._checkResult(result, 'Failed to get gainmap dimensions');
      return {
        width: module.getValue(widthPtr, 'i32'),
        height: module.getValue(heightPtr, 'i32'),
      };
    } finally {
      module._free(widthPtr);
      module._free(heightPtr);
    }
  }

  addEffectRotate(degrees: number): void {
    const decoder = this.requireDecoder();
    const result = getWasmModule()._wasm_dec_add_effect_rotate(decoder, degrees);
    this._checkResult(result, 'Failed to add rotate effect');
  }

  destroy(): void {
    const module = getWasmModule();
    if (this._currentImagePtr) {
      module._free(this._currentImagePtr);
      this._currentImagePtr = null;
    }
    if (this._decoder) {
      module._wasm_release_decoder(this._decoder);
      this._decoder = null;
    }
    this._initialized = false;
  }

  private requireDecoder(): number {
    if (!this._initialized || this._decoder === null) {
      throw new Error('Decoder not initialized');
    }
    return this._decoder;
  }

  private _checkResult(result: number, message: string): void {
    if (result === 0) {
      return;
    }

    const module = getWasmModule();
    const msgPtr = module._wasm_dec_get_error_message(this.requireDecoder());
    const errorMsg = msgPtr ? module.UTF8ToString(msgPtr) : 'Unknown error';
    throw new Error(`${message}: ${errorMsg} (code ${result})`);
  }
}

export function cleanup(): void {
  _wasmLoaded = false;
  _wasmModule = null;
  _wasmLoadError = null;
}
