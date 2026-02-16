/**
 * JavaScript bindings for libultrahdr WASM encoder
 *
 * This module provides a JavaScript API for the libultrahdr encoder
 * compiled to WebAssembly via Emscripten.
 */

// WASM module is loaded dynamically
let _wasmModule = null;
let _wasmLoaded = false;
let _wasmLoadError = null;
const WASM_ASSET_VERSION = typeof import.meta.env.VITE_WASM_ASSET_VERSION === 'string'
    ? import.meta.env.VITE_WASM_ASSET_VERSION.trim()
    : '';

function appendVersionQuery(url) {
    if (!WASM_ASSET_VERSION) {
        return url;
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(WASM_ASSET_VERSION)}`;
}

/**
 * Load the WASM module factory by injecting a script tag
 * @returns {Promise<Function>} - The UHDREncoderModule factory function
 */
async function loadWasmFactory() {
    // Check if already loaded globally
    if (typeof window !== 'undefined' && window.UHDREncoderModule) {
        return window.UHDREncoderModule;
    }

    // Build the base URL for assets, ensuring no double slashes
    let baseUrl = import.meta.env.BASE_URL || '/';
    if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
    }
    const wasmJsPath = appendVersionQuery(`${baseUrl}assets/ultrahdr_wasm.js`);
    console.log('[WASM] Loading from:', wasmJsPath);

    return new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector(`script[src="${wasmJsPath}"]`);
        if (existingScript) {
            // Wait for it to load if it's still loading
            if (window.UHDREncoderModule) {
                resolve(window.UHDREncoderModule);
            } else {
                existingScript.addEventListener('load', () => {
                    if (window.UHDREncoderModule) {
                        resolve(window.UHDREncoderModule);
                    } else {
                        reject(new Error('UHDREncoderModule not found after script load'));
                    }
                });
                existingScript.addEventListener('error', reject);
            }
            return;
        }

        // Create and inject the script
        const script = document.createElement('script');
        script.src = wasmJsPath;
        script.async = true;

        script.onload = () => {
            console.log('[WASM] Script loaded from:', wasmJsPath);
            if (window.UHDREncoderModule) {
                resolve(window.UHDREncoderModule);
            } else {
                reject(new Error('UHDREncoderModule not defined after loading script'));
            }
        };

        script.onerror = (e) => {
            reject(new Error(`Failed to load WASM script from ${wasmJsPath}`));
        };

        document.head.appendChild(script);
    });
}

/**
 * Load the WASM module
 * @returns {Promise<void>}
 */
async function loadWasmModule() {
    if (_wasmLoaded && _wasmModule) {
        return;
    }
    if (_wasmLoadError) {
        throw _wasmLoadError;
    }

    try {
        // Load the factory function
        const UHDREncoderModule = await loadWasmFactory();

        // Build the base URL for assets (same logic as loadWasmFactory)
        let baseUrl = import.meta.env.BASE_URL || '/';
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        const wasmBinaryPath = appendVersionQuery(`${baseUrl}assets/ultrahdr_wasm.wasm`);
        console.log('[WASM] WASM binary path:', wasmBinaryPath);

        // Pre-fetch the WASM binary to avoid Emscripten's sync fetch error
        console.log('[WASM] Pre-fetching WASM binary...');
        const wasmResponse = await fetch(wasmBinaryPath);
        if (!wasmResponse.ok) {
            throw new Error(`Failed to fetch WASM binary: ${wasmResponse.status} ${wasmResponse.statusText}`);
        }
        const wasmBinary = await wasmResponse.arrayBuffer();
        console.log('[WASM] WASM binary fetched:', wasmBinary.byteLength, 'bytes');



        _wasmModule = await UHDREncoderModule({
            wasmBinary: wasmBinary,
            locateFile: (path) => {
                if (path.endsWith('.wasm')) {
                    return wasmBinaryPath;
                }
                return path;
            }
        });

        _wasmLoaded = true;
        console.log('[WASM] libultrahdr module initialized');
        console.log('[WASM] Asset version token:', WASM_ASSET_VERSION || '(none)');
        console.log('[WASM] Module keys:', Object.keys(_wasmModule));
        console.log('[WASM] Module.HEAPU8 type:', typeof _wasmModule.HEAPU8);
        console.log('[WASM] Module.buffer type:', typeof _wasmModule.buffer);
        console.log('[WASM] Module.wasmMemory type:', typeof _wasmModule.wasmMemory);
    } catch (err) {
        _wasmLoadError = err;
        console.error('[WASM] Failed to load module:', err);
        throw err;
    }
}

/**
 * Check if WASM module is loaded
 * @returns {boolean}
 */
export function isWasmLoaded() {
    return _wasmLoaded && _wasmModule !== null;
}

/**
 * Get WASM module (internal use)
 * @returns {Object|null}
 */
function getWasmModule() {
    return _wasmModule;
}

/**
 * Encoder class for UltraHDR images using libultrahdr WASM
 */
export class UHDREncoder {
    constructor() {
        this._encoder = null;
        this._allocatedMemory = [];
        this._initialized = false;
    }

    /**
     * Initialize the encoder (must be called before other methods)
     * @returns {Promise<void>}
     */
    async init() {
        await loadWasmModule();
        const Module = getWasmModule();

        this._encoder = Module._wasm_create_encoder();
        if (!this._encoder) {
            throw new Error('Failed to create WASM encoder');
        }
        this._initialized = true;
        console.log('[WASM] Encoder created:', this._encoder);
    }

    /**
     * Check if encoder is initialized
     * @returns {boolean}
     */
    isInitialized() {
        return this._initialized && this._encoder !== null;
    }

    /**
     * Set SDR (base) image for encoding
     * @param {ImageData|Uint8Array} data - Image data (ImageData or flat Uint8Array)
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {number} [stride=0] - Row stride in bytes (0 for tightly packed)
     * @returns {void}
     */
    setSDRImage(data, width, height, stride = 0) {
        if (!this._initialized) {
            throw new Error('Encoder not initialized. Call init() first.');
        }

        const Module = getWasmModule();
        const ptr = this._allocateImageData(data, width, height, stride, 'SDR');
        try {
            console.log(`[WASM] JS Calling setSDRImage: ptr=${ptr.dataPtr}, w=${width}, h=${height}, stride=${ptr.stride}, HEAP=${Module.HEAPU8.byteLength}`);
            const result = Module._wasm_enc_set_sdr_image(
                this._encoder,
                ptr.dataPtr,
                width,
                height,
                ptr.stride
            );
            this._checkResult(result, 'Failed to set SDR image');
        } finally {
            // Free the temporary allocation
            this._freeMemory(ptr.dataPtr);
        }
    }

    /**
     * Set compressed base image (SDR) for encoding
     * @param {Uint8Array} data - Compressed JPEG data
     * @returns {void}
     */
    setCompressedBaseImage(data) {
        if (!this._initialized) {
            throw new Error('Encoder not initialized. Call init() first.');
        }

        const Module = getWasmModule();
        // Allocate memory for compressed data
        const size = data.length;
        const capacity = size; // Or slightly larger? exact size is fine.
        const ptr = Module._malloc(capacity);

        if (!ptr) {
            throw new Error(`Failed to allocate ${capacity} bytes for compressed base image`);
        }

        // Copy data to WASM memory
        const heap = new Uint8Array(Module.HEAPU8.buffer);
        heap.set(data, ptr);

        try {
            console.log(`[WASM] JS Calling setCompressedBaseImage: ptr=${ptr}, size=${size}`);
            const result = Module._wasm_enc_set_compressed_base_image(
                this._encoder,
                ptr,
                size,
                capacity
            );
            this._checkResult(result, 'Failed to set compressed base image');
        } finally {
            // Free the memory - uhdr_enc_set_compressed_image should copy it
            Module._free(ptr);
        }
    }

    /**
     * Set EXIF APP1 payload bytes.
     * @param {Uint8Array} exifPayload - EXIF APP1 payload bytes ("Exif\\0\\0" + TIFF)
     * @returns {void}
     */
    setExifData(exifPayload) {
        if (!this._initialized) {
            throw new Error('Encoder not initialized. Call init() first.');
        }
        if (!(exifPayload instanceof Uint8Array) || exifPayload.length === 0) {
            return;
        }

        const Module = getWasmModule();
        const size = exifPayload.length;
        const ptr = Module._malloc(size);
        if (!ptr) {
            throw new Error(`Failed to allocate ${size} bytes for EXIF payload`);
        }

        const heap = new Uint8Array(Module.HEAPU8.buffer);
        heap.set(exifPayload, ptr);

        try {
            const result = Module._wasm_enc_set_exif_data(
                this._encoder,
                ptr,
                size,
                size
            );
            this._checkResult(result, 'Failed to set EXIF payload');
        } finally {
            Module._free(ptr);
        }
    }

    /**
     * Set HDR (optional) image for encoding
     * @param {ImageData|Uint8Array} data - Image data (ImageData or flat Uint8Array)
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {number} [stride=0] - Row stride in bytes (0 for tightly packed)
     * @returns {void}
     */
    setHDRImage(data, width, height, stride = 0) {
        if (!this._initialized) {
            throw new Error('Encoder not initialized. Call init() first.');
        }

        const Module = getWasmModule();
        const ptr = this._allocateImageData(data, width, height, stride, 'HDR');
        try {
            const result = Module._wasm_enc_set_hdr_image(
                this._encoder,
                ptr.dataPtr,
                width,
                height,
                ptr.stride
            );
            this._checkResult(result, 'Failed to set HDR image');
        } finally {
            // Free the temporary allocation
            this._freeMemory(ptr.dataPtr);
        }
    }

    /**
     * Set pre-computed gain map image with metadata
     * @param {ImageData|Uint8Array} data - Gain map image data (grayscale or RGBA)
     * @param {Object} metadata - Gain map metadata
     * @param {number} width - Gain map width
     * @param {number} height - Gain map height
     * @param {number} [stride=0] - Row stride in bytes (0 for tightly packed)
     * @returns {void}
     */
    setGainMapImage(data, metadata, width, height, stride = 0) {
        if (!this._initialized) {
            throw new Error('Encoder not initialized. Call init() first.');
        }

        const Module = getWasmModule();

        // Validate metadata
        if (!metadata) {
            throw new Error('Gain map metadata is required');
        }

        // Allocate gain map image data
        const dataPtr = this._allocateImageData(data, width, height, stride, 'GainMap');
        try {
            // Allocate metadata in WASM memory (23 float values)
            const metaPtr = Module._malloc(23 * 4);
            if (!metaPtr) {
                this._freeMemory(dataPtr);
                throw new Error('Failed to allocate metadata memory');
            }

            try {
                const metaArray = new Float32Array(Module.HEAPU8.buffer, metaPtr, 23);

                // Per-channel metadata (max_boost, min_boost, gamma, offset_sdr, offset_hdr)
                for (let i = 0; i < 3; i++) {
                    metaArray[i * 7 + 0] = metadata.gainMapMax ? metadata.gainMapMax[i] : 1.0;
                    metaArray[i * 7 + 3] = metadata.gainMapMin ? metadata.gainMapMin[i] : 1.0;
                    metaArray[i * 7 + 6] = metadata.gamma ? metadata.gamma[i] : 1.0;
                    metaArray[i * 7 + 4] = metadata.offsetSdr ? metadata.offsetSdr[i] : 0.0;
                    metaArray[i * 7 + 5] = metadata.offsetHdr ? metadata.offsetHdr[i] : 0.0;
                }
                metaArray[21] = metadata.hdrCapacityMin !== undefined ? metadata.hdrCapacityMin : 1.0;
                metaArray[22] = metadata.hdrCapacityMax !== undefined ? metadata.hdrCapacityMax : 1.0;

                const result = Module._wasm_enc_set_gainmap(
                    this._encoder,
                    dataPtr.dataPtr,
                    width,
                    height,
                    dataPtr.stride,
                    metaPtr
                );
                this._checkResult(result, 'Failed to set gain map image');
            } finally {
                Module._free(metaPtr);
            }
        } finally {
            this._freeMemory(dataPtr.dataPtr);
        }
    }

    /**
     * Set pre-compressed gain map image (JPEG bytes) with metadata.
     * Use this instead of setGainMapImage when you already have compressed JPEG bytes
     * (e.g., extracted from an existing UltraHDR image).
     * @param {Uint8Array} data - Compressed JPEG gain map data
     * @param {Object} metadata - Gain map metadata
     * @returns {void}
     */
    setCompressedGainMapImage(data, metadata) {
        if (!this._initialized) {
            throw new Error('Encoder not initialized. Call init() first.');
        }
        if (!metadata) {
            throw new Error('Gain map metadata is required');
        }

        const Module = getWasmModule();

        // Allocate memory for compressed JPEG data
        const size = data.length;
        const ptr = Module._malloc(size);
        if (!ptr) {
            throw new Error(`Failed to allocate ${size} bytes for compressed gain map image`);
        }

        const heap = new Uint8Array(Module.HEAPU8.buffer);
        heap.set(data, ptr);

        // Allocate metadata in WASM memory (23 float values)
        const metaPtr = Module._malloc(23 * 4);
        if (!metaPtr) {
            Module._free(ptr);
            throw new Error('Failed to allocate metadata memory');
        }

        try {
            const metaArray = new Float32Array(Module.HEAPU8.buffer, metaPtr, 23);

            // Per-channel metadata (matches wasm_enc_set_gainmap layout)
            for (let i = 0; i < 3; i++) {
                metaArray[i * 7 + 0] = metadata.gainMapMax ? metadata.gainMapMax[i] : 1.0;
                metaArray[i * 7 + 3] = metadata.gainMapMin ? metadata.gainMapMin[i] : 1.0;
                metaArray[i * 7 + 6] = metadata.gamma ? metadata.gamma[i] : 1.0;
                metaArray[i * 7 + 4] = metadata.offsetSdr ? metadata.offsetSdr[i] : 0.0;
                metaArray[i * 7 + 5] = metadata.offsetHdr ? metadata.offsetHdr[i] : 0.0;
            }
            metaArray[21] = metadata.hdrCapacityMin !== undefined ? metadata.hdrCapacityMin : 1.0;
            metaArray[22] = metadata.hdrCapacityMax !== undefined ? metadata.hdrCapacityMax : 1.0;

            // Call C function: wasm_enc_set_gainmap(encoder, data, width, height, stride, metadata)
            // For compressed data: width = data length, height = 1, stride = data length
            // The C side computes capacity = stride * height = data.length, which is the exact JPEG size
            const result = Module._wasm_enc_set_gainmap(
                this._encoder,
                ptr,
                size,  // width = byte count
                1,     // height = 1
                size,  // stride = byte count (so capacity = size * 1 = size)
                metaPtr
            );
            this._checkResult(result, 'Failed to set compressed gain map image');
        } finally {
            Module._free(ptr);
            Module._free(metaPtr);
        }
    }

    /**
     * Add rotation effect to the encoder.
     * @param {number} degrees - Rotation in degrees (90, 180, 270)
     */
    addEffectRotate(degrees) {
        if (!this._initialized) {
            throw new Error('Encoder not initialized. Call init() first.');
        }
        const Module = getWasmModule();
        const result = Module._wasm_enc_add_effect_rotate(this._encoder, degrees);
        this._checkResult(result, 'Failed to add rotate effect');
    }

    /**
     * Encode images to UltraHDR JPEG
     * @param {number} [quality=90] - JPEG quality (0-100)
     * @returns {void}
     */
    encode(quality = 90) {
        if (!this._initialized) {
            throw new Error('Encoder not initialized. Call init() first.');
        }

        const Module = getWasmModule();
        const result = Module._wasm_encode(this._encoder, quality);
        this._checkResult(result, 'Encoding failed');
    }

    /**
     * Get encoded JPEG data
     * @returns {Uint8Array|null} - Encoded JPEG data, or null if encoding failed
     */
    getEncodedData() {
        if (!this._initialized) {
            throw new Error('Encoder not initialized. Call init() first.');
        }

        const Module = getWasmModule();
        const sizePtr = Module._malloc(4); // 4 bytes for int

        try {
            const dataPtr = Module._wasm_get_encoded_data(this._encoder, sizePtr);
            if (!dataPtr) {
                return null;
            }

            const size = Module.getValue(sizePtr, 'i32');
            if (size <= 0) {
                return null;
            }

            // Copy data from WASM memory to a new Uint8Array
            const result = new Uint8Array(size);
            for (let i = 0; i < size; i++) {
                result[i] = Module.HEAPU8[dataPtr + i];
            }

            return result;
        } finally {
            Module._free(sizePtr);
        }
    }

    /**
     * Free encoded data allocated by the encoder
     * @returns {void}
     */
    freeEncodedData() {
        if (!this._initialized) {
            return;
        }

        const Module = getWasmModule();
        Module._wasm_free_encoded_data(this._encoder, null);
    }

    /**
     * Get the last error message
     * @returns {string} - Error message, or 'OK' if no error
     */
    getErrorMessage() {
        if (!this._initialized) {
            return 'Encoder not initialized';
        }

        const Module = getWasmModule();
        const msgPtr = Module._wasm_get_error_message(this._encoder);
        if (!msgPtr) {
            return 'Unknown error';
        }

        return Module.UTF8ToString(msgPtr);
    }

    /**
     * Reset encoder to initial state
     * @returns {void}
     */
    reset() {
        if (!this._initialized) {
            return;
        }

        const Module = getWasmModule();
        Module._wasm_reset_encoder(this._encoder);
    }

    /**
     * Destroy the encoder and free all resources
     * @returns {void}
     */
    destroy() {
        if (this._encoder !== null) {
            const Module = getWasmModule();
            Module._wasm_release_encoder(this._encoder);
            this._encoder = null;
        }
        this._allocatedMemory = [];
        this._initialized = false;
    }

    /**
     * Allocate image data in WASM memory
     * @param {ImageData|Uint8Array} data - Image data
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {number} stride - Row stride in bytes
     * @param {string} label - Label for debugging
     * @returns {{dataPtr: number, stride: number}} - Pointer to data and stride
     */
    /**
     * Allocate image data in WASM memory
     * @param {ImageData|Uint8Array} data - Image data
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {number} stride - Row stride in bytes
     * @param {string} label - Label for debugging
     * @returns {{dataPtr: number, stride: number}} - Pointer to data and stride
     */
    _allocateImageData(data, width, height, stride, label) {
        const Module = getWasmModule();

        // Calculate size
        const pixelCount = width * height;
        let bytesPerPixel = 4; // Default RGBA8888
        if (data instanceof Uint8Array && data.length > 0) {
            if (data.length === pixelCount) {
                bytesPerPixel = 1; // Grayscale
            } else if (data.length === pixelCount * 3) {
                bytesPerPixel = 3; // RGB888
            }
        } else if (data instanceof ImageData) {
            bytesPerPixel = 4;
        }

        // Calculate unaligned stride
        const unalignedStride = width * bytesPerPixel;

        // Align stride to 64 bytes to satisfy potential SIMD/library requirements
        const align = 64;
        const alignedStride = Math.ceil(unalignedStride / align) * align;

        // Allocate memory for the image with padding to prevent OOB reads
        const totalSize = alignedStride * height;
        const padding = 4096; // 4KB padding
        const dataPtr = Module._malloc(totalSize + padding);

        if (!dataPtr) { // Check for null or 0
            throw new Error(`Failed to allocate ${totalSize + padding} bytes for ${label} image`);
        }

        console.log(`[WASM] Allocated ${label} image: ${width}x${height}, stride=${alignedStride} (unaligned=${unalignedStride}), ptr=${dataPtr}`);

        // Track for cleanup
        this._allocatedMemory.push(dataPtr);

        // Copy data to WASM memory
        const heap = new Uint8Array(Module.HEAPU8.buffer);

        if (data instanceof ImageData) {
            const src = new Uint8Array(data.data.buffer);
            for (let y = 0; y < height; y++) {
                const srcStart = y * width * 4; // ImageData is always RGBA
                const srcEnd = srcStart + unalignedStride;
                const dstStart = dataPtr + (y * alignedStride);
                // Copy the row
                heap.set(src.subarray(srcStart, srcEnd), dstStart);
            }
        } else if (data instanceof Uint8Array) {
            for (let y = 0; y < height; y++) {
                const srcStart = y * unalignedStride;
                const srcEnd = srcStart + unalignedStride;
                const dstStart = dataPtr + (y * alignedStride);
                // Copy the row
                heap.set(data.subarray(srcStart, srcEnd), dstStart);
            }
        } else {
            throw new Error(`Unsupported data type for ${label}: ${typeof data}`);
        }

        return { dataPtr, stride: alignedStride };
    }

    /**
     * Free allocated memory
     * @param {number} ptr - Pointer to free
     * @returns {void}
     */
    _freeMemory(ptr) {
        const Module = getWasmModule();
        if (ptr) {
            Module._free(ptr);
        }
        this._allocatedMemory = this._allocatedMemory.filter(p => p !== ptr);
    }

    /**
     * Check result code and throw error if failed
     * @param {number} result - Result code
     * @param {string} message - Error message prefix
     * @returns {void}
     */
    _checkResult(result, message) {
        const ERR_OK = 0;
        if (result === ERR_OK) {
            return;
        }

        const errorMsg = this.getErrorMessage();
        const errorCodes = {
            '-1': 'null pointer error',
            '-2': 'invalid format',
            '-3': 'invalid intent',
            '-4': 'memory allocation failed',
            '-5': 'encode failed',
            '-6': 'buffer too small',
        };

        const errorType = errorCodes[result.toString()] || `unknown error code ${result}`;
        throw new Error(`${message}: ${errorType} - ${errorMsg}`);
    }

    /** @deprecated Use destroy() instead */
    dispose() {
        this.destroy();
    }
}

/**
 * Check if WASM module is available
 * @returns {Promise<boolean>}
 */
export async function isAvailable() {
    try {
        await loadWasmModule();
        return isWasmLoaded();
    } catch (e) {
        return false;
    }
}

/**
 * Get WASM module status
 * @returns {Object}
 */
export function getStatus() {
    return {
        loaded: _wasmLoaded,
        module: _wasmModule,
        error: _wasmLoadError,
    };
}

/**
 * Check if the image is a valid UltraHDR image
 * @param {Uint8Array} data - Image data
 * @returns {Promise<boolean>}
 */
export async function isUhdrImage(data) {
    await loadWasmModule();
    const Module = getWasmModule();

    const size = data.length;
    const ptr = Module._malloc(size);
    if (!ptr) return false;

    try {
        const heap = new Uint8Array(Module.HEAPU8.buffer);
        heap.set(data, ptr);
        return Module._wasm_is_uhdr_image(ptr, size) === 1;
    } finally {
        Module._free(ptr);
    }
}

/**
 * Decoder class for UltraHDR images using libultrahdr WASM
 */
export class UHDRDecoder {
    constructor() {
        this._decoder = null;
        this._initialized = false;
    }

    /**
     * Initialize the decoder
     * @returns {Promise<void>}
     */
    async init() {
        await loadWasmModule();
        const Module = getWasmModule();

        this._decoder = Module._wasm_create_decoder();
        if (!this._decoder) {
            throw new Error('Failed to create WASM decoder');
        }
        this._initialized = true;
    }

    /**
     * Set compressed image for decoding/probing.
     * Keeps the WASM memory alive until the next setImage call or destroy(),
     * because libultrahdr stores the pointer rather than copying the data.
     * @param {Uint8Array} data - JPEG data
     */
    setImage(data) {
        if (!this._initialized) throw new Error('Decoder not initialized');

        const Module = getWasmModule();

        // Free previous image
        if (this._currentImagePtr) {
            Module._free(this._currentImagePtr);
            this._currentImagePtr = null;
        }

        const size = data.length;
        const ptr = Module._malloc(size);
        if (!ptr) throw new Error('Failed to allocate memory for image');

        const heap = new Uint8Array(Module.HEAPU8.buffer);
        heap.set(data, ptr);

        this._currentImagePtr = ptr; // Keep alive

        const result = Module._wasm_dec_set_image(this._decoder, ptr, size);
        try {
            this._checkResult(result, 'Failed to set decoder image');
        } catch (e) {
            // If set failed, free immediately
            Module._free(ptr);
            this._currentImagePtr = null;
            throw e;
        }
    }

    /**
     * Parse the bitstream to make image info available
     */
    probe() {
        if (!this._initialized) throw new Error('Decoder not initialized');
        const Module = getWasmModule();
        const result = Module._wasm_dec_probe(this._decoder);
        this._checkResult(result, 'Probe failed');
    }

    /**
     * Get gain map metadata
     * @returns {Object}
     */
    getGainMapMetadata() {
        if (!this._initialized) throw new Error('Decoder not initialized');
        const Module = getWasmModule();

        // Allocate struct for output (23 floats = 92 bytes, + int = 96 bytes)
        // struct WasmGainMapMetadata is:
        // float max[3], min[3], gamma[3], offSdr[3], offHdr[3] (15 floats)
        // float capMin, capMax (2 floats)
        // int useBaseCg (1 int)
        // Total: 17 floats + 1 int = 18 * 4 = 72 bytes.

        const metaPtr = Module._malloc(128); // Safe margin
        if (!metaPtr) throw new Error('Failed to allocate memory for metadata');

        try {
            const result = Module._wasm_dec_get_gainmap_metadata(this._decoder, metaPtr);
            this._checkResult(result, 'Failed to get gainmap metadata');

            // Read values
            // Layout matches struct WasmGainMapMetadata
            // float arrays are contiguous
            const floatData = new Float32Array(Module.HEAPU8.buffer, metaPtr, 17);
            const intData = new Int32Array(Module.HEAPU8.buffer, metaPtr + 17 * 4, 1);

            return {
                gainMapMax: [floatData[0], floatData[1], floatData[2]],
                gainMapMin: [floatData[3], floatData[4], floatData[5]],
                gamma: [floatData[6], floatData[7], floatData[8]],
                offsetSdr: [floatData[9], floatData[10], floatData[11]],
                offsetHdr: [floatData[12], floatData[13], floatData[14]],
                hdrCapacityMin: floatData[15],
                hdrCapacityMax: floatData[16],
                useBaseCg: intData[0] !== 0
            };
        } finally {
            Module._free(metaPtr);
        }
    }

    /**
     * Get the compressed gain map image (JPEG bytes) from a probed UltraHDR image.
     * @returns {Uint8Array} - Copy of the compressed gain map JPEG
     */
    getGainMapImage() {
        if (!this._initialized) throw new Error('Decoder not initialized');
        const Module = getWasmModule();

        const sizePtr = Module._malloc(4);
        if (!sizePtr) throw new Error('Failed to allocate memory for size');

        try {
            const dataPtr = Module._wasm_dec_get_gainmap_image(this._decoder, sizePtr);
            const size = Module.getValue(sizePtr, 'i32');

            if (!dataPtr || size <= 0) {
                throw new Error('No gain map image available');
            }

            // Copy the data out of WASM memory (the decoder owns the original)
            return new Uint8Array(Module.HEAPU8.buffer.slice(dataPtr, dataPtr + size));
        } finally {
            Module._free(sizePtr);
        }
    }

    /**
     * Get the compressed base (SDR) image (JPEG bytes) from a probed UltraHDR image.
     * @returns {Uint8Array} - Copy of the compressed base JPEG
     */
    getBaseImage() {
        if (!this._initialized) throw new Error('Decoder not initialized');
        const Module = getWasmModule();

        const sizePtr = Module._malloc(4);
        if (!sizePtr) throw new Error('Failed to allocate memory for size');

        try {
            const dataPtr = Module._wasm_dec_get_base_image(this._decoder, sizePtr);
            const size = Module.getValue(sizePtr, 'i32');

            if (!dataPtr || size <= 0) {
                throw new Error('No base image available');
            }

            return new Uint8Array(Module.HEAPU8.buffer.slice(dataPtr, dataPtr + size));
        } finally {
            Module._free(sizePtr);
        }
    }

    /**
     * Get the gain map dimensions from a probed UltraHDR image.
     * @returns {{ width: number, height: number }}
     */
    getGainMapDimensions() {
        if (!this._initialized) throw new Error('Decoder not initialized');
        const Module = getWasmModule();

        const wPtr = Module._malloc(4);
        const hPtr = Module._malloc(4);
        if (!wPtr || !hPtr) throw new Error('Failed to allocate memory for dimensions');

        try {
            const result = Module._wasm_dec_get_gainmap_dimensions(this._decoder, wPtr, hPtr);
            this._checkResult(result, 'Failed to get gainmap dimensions');

            return {
                width: Module.getValue(wPtr, 'i32'),
                height: Module.getValue(hPtr, 'i32')
            };
        } finally {
            Module._free(wPtr);
            Module._free(hPtr);
        }
    }

    /**
     * Add rotation effect to the decoder.
     * @param {number} degrees - Rotation in degrees (90, 180, 270)
     */
    addEffectRotate(degrees) {
        if (!this._initialized) {
            throw new Error('Decoder not initialized. Call init() first.');
        }
        const Module = getWasmModule();
        const result = Module._wasm_dec_add_effect_rotate(this._decoder, degrees);
        this._checkResult(result, 'Failed to add rotate effect');
    }

    /**
     * Check result code
     */
    _checkResult(result, message) {
        if (result === 0) return;

        const Module = getWasmModule();
        const msgPtr = Module._wasm_dec_get_error_message(this._decoder);
        const errorMsg = msgPtr ? Module.UTF8ToString(msgPtr) : 'Unknown error';
        throw new Error(`${message}: ${errorMsg} (code ${result})`);
    }

    /**
     * Destroy decoder
     */
    destroy() {
        const Module = getWasmModule();
        if (this._currentImagePtr) {
            Module._free(this._currentImagePtr);
            this._currentImagePtr = null;
        }
        if (this._decoder) {
            Module._wasm_release_decoder(this._decoder);
            this._decoder = null;
        }
        this._initialized = false;
    }
}

/**
 * Clean up WASM module (for testing)
 * @returns {void}
 */
export function cleanup() {
    _wasmLoaded = false;
    _wasmModule = null;
    _wasmLoadError = null;
}
