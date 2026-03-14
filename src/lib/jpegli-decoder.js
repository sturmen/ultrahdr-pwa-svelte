let jpegliWasmModule = null;

const DEFAULT_CHUNK_ROWS = 64;

function resolveWasmBaseUrl() {
    let baseUrl = import.meta.env.BASE_URL || '/';
    if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
    }
    return baseUrl;
}

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

function normalizeQualityRatio(quality) {
    const normalized = Number(quality);
    if (!Number.isFinite(normalized)) {
        return 0.95;
    }
    const clamped = Math.max(1, Math.min(100, normalized));
    return clamped / 100.0;
}

function normalizeChunkRows(chunkRows, imageHeight) {
    const requested = Math.floor(Number(chunkRows));
    const fallback = Math.max(1, Math.min(DEFAULT_CHUNK_ROWS, Math.max(1, imageHeight)));
    if (!Number.isFinite(requested) || requested <= 0) {
        return fallback;
    }
    return Math.max(1, Math.min(requested, Math.max(1, imageHeight)));
}

function invokeProgressCallback(onProgress, progress, metadata = {}) {
    if (typeof onProgress !== 'function') {
        return;
    }
    try {
        onProgress(progress, metadata);
    } catch (error) {
        console.warn('[Jpegli] Progress callback failed:', error);
    }
}

function readEncodedBytes(wasm, encoderState) {
    const outBufferPtr = wasm._jpegli_wasm_get_output_data(encoderState);
    const outSize = wasm._jpegli_wasm_get_output_size(encoderState);

    if (!outBufferPtr || outSize === 0) {
        throw new Error('Jpegli encoding returned empty buffer');
    }

    const jpegBytes = new Uint8Array(wasm.HEAPU8.buffer, outBufferPtr, outSize);
    return new Uint8Array(jpegBytes);
}

function hasChunkedEncodeApi(wasm) {
    return typeof wasm?._jpegli_wasm_encoder_start === 'function'
        && typeof wasm?._jpegli_wasm_encoder_process_rows === 'function'
        && typeof wasm?._jpegli_wasm_encoder_finish === 'function'
        && typeof wasm?._jpegli_wasm_encoder_get_next_scanline === 'function'
        && typeof wasm?._jpegli_wasm_encoder_get_image_height === 'function';
}

function configureEncoder(wasm, encoderState, options = {}) {
    if (
        options?.inputMode === 'grayscale'
        && typeof wasm?._jpegli_wasm_encoder_set_input_mode === 'function'
    ) {
        const configured = Number(wasm._jpegli_wasm_encoder_set_input_mode(encoderState, 1));
        if (configured !== 0) {
            throw new Error('Jpegli grayscale input-mode configuration failed');
        }
    }

    const iccProfile = options?.iccProfile;
    if (
        iccProfile instanceof Uint8Array
        && iccProfile.length > 0
        && typeof wasm?._jpegli_wasm_encoder_set_icc_profile === 'function'
    ) {
        const iccPointer = wasm._malloc(iccProfile.length);
        if (!iccPointer) {
            throw new Error('Failed to allocate memory for ICC profile');
        }
        try {
            wasm.HEAPU8.set(iccProfile, iccPointer);
            const configured = Number(
                wasm._jpegli_wasm_encoder_set_icc_profile(
                    encoderState,
                    iccPointer,
                    iccProfile.length,
                ),
            );
            if (configured !== 0) {
                throw new Error('Jpegli ICC profile configuration failed');
            }
        } finally {
            wasm._free(iccPointer);
        }
    }
}

async function encodeJpegliWithLegacyApi(wasm, imageData, quality = 95, options = {}) {
    const { width, height, data } = imageData;
    const numChannels = 4;
    const inputSize = width * height * numChannels;

    const inputPointer = wasm._malloc(inputSize);
    wasm.HEAPU8.set(data, inputPointer);

    const encoderState = wasm._jpegli_wasm_encoder_create();
    if (!encoderState) {
        wasm._free(inputPointer);
        throw new Error('Failed to create Jpegli encoder state');
    }

    try {
        configureEncoder(wasm, encoderState, options);
        const success = wasm._jpegli_wasm_encode(
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
        wasm._jpegli_wasm_encoder_destroy(encoderState);
        wasm._free(inputPointer);
    }
}

async function encodeJpegliWithChunkedApi(wasm, imageData, quality = 95, options = {}) {
    const { width, height, data } = imageData;
    const numChannels = 4;
    const inputSize = width * height * numChannels;
    const chunkRows = normalizeChunkRows(options?.chunkRows, height);
    const inputPointer = wasm._malloc(inputSize);
    wasm.HEAPU8.set(data, inputPointer);

    const encoderState = wasm._jpegli_wasm_encoder_create();
    if (!encoderState) {
        wasm._free(inputPointer);
        throw new Error('Failed to create Jpegli encoder state');
    }

    try {
        configureEncoder(wasm, encoderState, options);
        const started = wasm._jpegli_wasm_encoder_start(
            encoderState,
            inputPointer,
            width,
            height,
            normalizeQualityRatio(quality),
        );

        if (started !== 0) {
            throw new Error('Jpegli chunked encoding start failed');
        }

        const totalRows = Math.max(1, Number(wasm._jpegli_wasm_encoder_get_image_height(encoderState)) || height || 1);
        let emittedProgress = -1;
        invokeProgressCallback(options?.onProgress, 0, {
            jpegliRowsEncoded: 0,
            jpegliTotalRows: totalRows,
            jpegliChunkRows: chunkRows,
        });
        emittedProgress = 0;

        while (true) {
            const nextScanline = Number(wasm._jpegli_wasm_encoder_get_next_scanline(encoderState)) || 0;
            if (nextScanline >= totalRows) {
                break;
            }

            const rowsProcessed = Number(
                wasm._jpegli_wasm_encoder_process_rows(encoderState, chunkRows),
            );
            if (!Number.isFinite(rowsProcessed) || rowsProcessed < 0) {
                throw new Error('Jpegli chunked encoding failed while processing scanlines');
            }

            const updatedScanline = Number(wasm._jpegli_wasm_encoder_get_next_scanline(encoderState)) || 0;
            if (rowsProcessed === 0 && updatedScanline <= nextScanline) {
                throw new Error('Jpegli chunked encoding made no progress');
            }

            const progress = Math.max(0, Math.min(99, Math.floor((updatedScanline / totalRows) * 100)));
            if (progress > emittedProgress) {
                invokeProgressCallback(options?.onProgress, progress, {
                    jpegliRowsEncoded: Math.min(totalRows, updatedScanline),
                    jpegliTotalRows: totalRows,
                    jpegliChunkRows: chunkRows,
                });
                emittedProgress = progress;
            }
        }

        const finished = wasm._jpegli_wasm_encoder_finish(encoderState);
        if (finished !== 0) {
            throw new Error('Jpegli chunked encoding finish failed');
        }

        invokeProgressCallback(options?.onProgress, 100, {
            jpegliRowsEncoded: totalRows,
            jpegliTotalRows: totalRows,
            jpegliChunkRows: chunkRows,
        });

        return readEncodedBytes(wasm, encoderState);
    } finally {
        wasm._jpegli_wasm_encoder_destroy(encoderState);
        wasm._free(inputPointer);
    }
}

export async function ensureJpegliLoaded() {
    if (jpegliWasmModule) return jpegliWasmModule;

    const baseUrl = resolveWasmBaseUrl();

    // We expect the build script placed it in public/assets/jpegli_wasm.js
    if (typeof window !== 'undefined' && window.createJpegliWasm) {
        jpegliWasmModule = await window.createJpegliWasm({
            locateFile: (path) => appendVersionQuery(`${baseUrl}assets/${path}`)
        });
        return jpegliWasmModule;
    }

    const wasmJsPath = appendVersionQuery(`${baseUrl}assets/jpegli_wasm.js`);
    try {
        const importedModule = await import(/* @vite-ignore */ wasmJsPath);
        const createWasm = importedModule?.default || importedModule?.createJpegliWasm;
        if (createWasm) {
            jpegliWasmModule = await createWasm({
                locateFile: (path) => appendVersionQuery(`${baseUrl}assets/${path}`)
            });
            return jpegliWasmModule;
        }
        throw new Error('createJpegliWasm not found in imported module');
    } catch (e) {
        try {
            const response = await fetch(wasmJsPath);
            const source = typeof response.text === 'function' ? await response.text() : '';
            if (source) {
                const evaluateFactory = new Function(
                    `${source}\n` +
                    'return (typeof createJpegliWasm === "function" ? createJpegliWasm : ' +
                    '(typeof globalThis !== "undefined" ? globalThis.createJpegliWasm : null));'
                );
                const createWasm = evaluateFactory();
                if (createWasm) {
                    jpegliWasmModule = await createWasm({
                        locateFile: (path) => appendVersionQuery(`${baseUrl}assets/${path}`)
                    });
                    return jpegliWasmModule;
                }
            }
        } catch (fetchErr) {
            console.warn('Fallback eval failed:', fetchErr);
        }
        console.warn('Failed to load jpegli WASM dynamically:', e);
        throw new Error('Jpegli WASM module failed to load');
    }
}

export async function encodeJpegliLegacyForTests(imageData, quality = 95) {
    const wasm = await ensureJpegliLoaded();
    return encodeJpegliWithLegacyApi(wasm, imageData, quality);
}

export async function encodeJpegli(imageData, quality = 95, options = {}) {
    const wasm = await ensureJpegliLoaded();

    if (hasChunkedEncodeApi(wasm)) {
        return encodeJpegliWithChunkedApi(wasm, imageData, quality, options);
    }

    invokeProgressCallback(options?.onProgress, 0, {
        jpegliRowsEncoded: 0,
        jpegliTotalRows: Math.max(1, Number(imageData?.height) || 1),
        jpegliChunkRows: normalizeChunkRows(options?.chunkRows, imageData?.height || 1),
    });
    const result = await encodeJpegliWithLegacyApi(wasm, imageData, quality, options);
    invokeProgressCallback(options?.onProgress, 100, {
        jpegliRowsEncoded: Math.max(1, Number(imageData?.height) || 1),
        jpegliTotalRows: Math.max(1, Number(imageData?.height) || 1),
        jpegliChunkRows: normalizeChunkRows(options?.chunkRows, imageData?.height || 1),
    });
    return result;
}

export function __resetJpegliWasmModuleForTests() {
    jpegliWasmModule = null;
}
