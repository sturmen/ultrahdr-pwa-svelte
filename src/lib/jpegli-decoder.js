let jpegliWasmModule = null;

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

export async function encodeJpegli(imageData, quality = 95) {
    const wasm = await ensureJpegliLoaded();
    const { width, height, data } = imageData;
    const numChannels = 4; // RGBA from canvas/ImageData

    // Allocate memory for input pixels
    const inputSize = width * height * numChannels;

    console.log('[DEBUG] wasm keys:', Object.keys(wasm));
    console.log('[DEBUG] wasm._malloc:', typeof wasm._malloc);
    console.log('[DEBUG] wasm.HEAPU8:', typeof wasm.HEAPU8);

    const inputPointer = wasm._malloc(inputSize);

    // Copy JS pixel data to WASM heap
    wasm.HEAPU8.set(data, inputPointer);

    // Create encoder state
    const encoderState = wasm._jpegli_wasm_encoder_create();
    if (!encoderState) {
        wasm._free(inputPointer);
        throw new Error('Failed to create Jpegli encoder state');
    }

    try {
        // Try encoding
        // int jpegli_wasm_encode(JpegliEncoderState *state, const uint8_t *rgba_data, int width, int height, float quality)
        const success = wasm._jpegli_wasm_encode(
            encoderState, inputPointer, width, height, quality / 100.0 // normalize quality to 0.0-1.0
        );

        if (success !== 0) {
            throw new Error('Jpegli encoding failed');
        }

        // Read the output pointers
        const outBufferPtr = wasm._jpegli_wasm_get_output_data(encoderState);
        const outSize = wasm._jpegli_wasm_get_output_size(encoderState);

        if (!outBufferPtr || outSize === 0) {
            throw new Error('Jpegli encoding returned empty buffer');
        }

        // Copy the encoded JPEG bytes to a new JS Uint8Array
        const jpegBytes = new Uint8Array(wasm.HEAPU8.buffer, outBufferPtr, outSize);
        const resultBytes = new Uint8Array(jpegBytes); // Clone it so it survives WASM free

        return resultBytes;
    } finally {
        // Clean up
        wasm._jpegli_wasm_encoder_destroy(encoderState);
        wasm._free(inputPointer);
    }
}
