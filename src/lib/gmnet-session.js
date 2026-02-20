import * as ort from 'onnxruntime-web/webgpu';
import { createCanvasWithContext as createRuntimeCanvasWithContext } from './canvas-runtime.js';

export const REQUIRED_GMNET_EXECUTION_PROVIDER = 'webgpu';

function resolveOrtAssetBasePath() {
    const baseUrl = import.meta.env.BASE_URL || '/';
    return baseUrl.endsWith('/') ? `${baseUrl}assets/` : `${baseUrl}/assets/`;
}

function resolveModelBasePath() {
    const baseUrl = import.meta.env.BASE_URL || '/';
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function isWindowsRuntime(runtime = globalThis) {
    const navigatorRef = runtime?.navigator;
    const userAgent = String(navigatorRef?.userAgent || '').toLowerCase();
    const platform = String(navigatorRef?.platform || '').toLowerCase();
    return userAgent.includes('windows') || platform.startsWith('win');
}

const DEFAULT_WASM_THREAD_COUNT = 1;
const MAX_WASM_THREAD_COUNT = 4;

function supportsWasmThreading(runtime = globalThis) {
    const hasIsolatedContext = runtime?.crossOriginIsolated === true;
    const hasSharedArrayBuffer = typeof runtime?.SharedArrayBuffer !== 'undefined';
    return hasIsolatedContext && hasSharedArrayBuffer;
}

function resolveHardwareConcurrency(runtime = globalThis) {
    const hardwareConcurrency = Number(runtime?.navigator?.hardwareConcurrency);
    if (!Number.isFinite(hardwareConcurrency) || hardwareConcurrency < 1) {
        return 1;
    }
    return Math.floor(hardwareConcurrency);
}

function resolveWasmThreadCount(runtime = globalThis) {
    if (!supportsWasmThreading(runtime)) {
        return DEFAULT_WASM_THREAD_COUNT;
    }
    const hardwareConcurrency = resolveHardwareConcurrency(runtime);
    const boundedCount = Math.min(MAX_WASM_THREAD_COUNT, hardwareConcurrency);
    return Math.max(2, boundedCount);
}

function resolveCpuCoreUsageForProvider(provider, runtime = globalThis) {
    const normalizedProvider = typeof provider === 'string' ? provider.toLowerCase() : 'unknown';
    const availableCores = resolveHardwareConcurrency(runtime);
    const configuredWasmThreads = Number(ort?.env?.wasm?.numThreads);
    if (
        normalizedProvider === 'wasm' &&
        Number.isFinite(configuredWasmThreads) &&
        configuredWasmThreads >= 1
    ) {
        return `${Math.min(Math.floor(configuredWasmThreads), availableCores)}/${availableCores}`;
    }
    return `n/a/${availableCores}`;
}

ort.env.wasm.numThreads = resolveWasmThreadCount();
ort.env.wasm.simd = true;
const ortAssetBasePath = resolveOrtAssetBasePath();
ort.env.wasm.wasmPaths = {
    'ort-wasm.wasm': `${ortAssetBasePath}ort-wasm.wasm`,
    'ort-wasm-simd.wasm': `${ortAssetBasePath}ort-wasm-simd.wasm`,
    'ort-wasm-threaded.wasm': `${ortAssetBasePath}ort-wasm-threaded.wasm`,
    'ort-wasm-simd-threaded.wasm': `${ortAssetBasePath}ort-wasm-simd-threaded.wasm`,
    'ort-wasm-simd-threaded.jsep.wasm': `${ortAssetBasePath}ort-wasm-simd-threaded.jsep.wasm`,
    'ort-wasm-simd-threaded.asyncify.wasm': `${ortAssetBasePath}ort-wasm-simd-threaded.asyncify.wasm`,
    'ort-wasm-simd-threaded.jspi.wasm': `${ortAssetBasePath}ort-wasm-simd-threaded.jspi.wasm`
};
// Disable proxy to prevent ONNX from trying to spawn another worker or check for document
ort.env.wasm.proxy = false;
if (!ort.env.webgpu || typeof ort.env.webgpu !== 'object') {
    ort.env.webgpu = {};
}
// Prefer the high-performance adapter for GMNet inference when WebGPU is available.
// Skip this hint on Windows where Chromium currently ignores it and emits noisy warnings.
if (!isWindowsRuntime()) {
    ort.env.webgpu.powerPreference = 'high-performance';
}

export const DEFAULT_GMNET_MODEL_VARIANT = 'realworld';
const SUPPORTED_MODEL_VARIANTS = Object.freeze(['realworld', 'synthetic']);
const MODEL_VARIANT_CONFIG = Object.freeze({
    realworld: {
        modelFilename: 'gmnet-realworld.onnx',
        modelDataFilename: 'gmnet-realworld.onnx.data'
    },
    synthetic: {
        modelFilename: 'gmnet-synthetic.onnx',
        modelDataFilename: 'gmnet-synthetic.onnx.data'
    }
});
// Current exported artifacts reference this external-data location in the ONNX graph.
const MODEL_EXTERNAL_DATA_PATH = 'gmnet.onnx.data';

function normalizeModelVariant(variant) {
    return SUPPORTED_MODEL_VARIANTS.includes(variant)
        ? variant
        : DEFAULT_GMNET_MODEL_VARIANT;
}

const MODEL_BASE_PATH = `${resolveModelBasePath()}models/`;

function hasWebGpuSupport(runtime = globalThis) {
    return typeof runtime?.navigator?.gpu !== 'undefined';
}

function resolveExecutionProviders(runtime = globalThis) {
    if (!hasWebGpuSupport(runtime)) {
        return [];
    }
    return [REQUIRED_GMNET_EXECUTION_PROVIDER];
}

function normalizeExecutionProvider(value) {
    if (typeof value !== 'string') {
        return null;
    }
    const normalized = value.trim().toLowerCase();
    return normalized || null;
}

function resolveActiveExecutionProvider(session, requestedExecutionProviders = []) {
    const sessionProviders = Array.isArray(session?.executionProviders)
        ? session.executionProviders
        : null;
    if (sessionProviders && typeof sessionProviders[0] === 'string' && sessionProviders[0]) {
        return sessionProviders[0];
    }

    if (typeof session?.executionProvider === 'string' && session.executionProvider) {
        return session.executionProvider;
    }

    if (
        typeof session?.handler?.executionProvider === 'string' &&
        session.handler.executionProvider
    ) {
        return session.handler.executionProvider;
    }

    return requestedExecutionProviders[0] || 'wasm';
}

function logExecutionProviderSelection(provider, modelVariant, requestedExecutionProviders = []) {
    const normalizedProvider = typeof provider === 'string' && provider ? provider : 'unknown';
    const requestedProviders = Array.isArray(requestedExecutionProviders) && requestedExecutionProviders.length > 0
        ? requestedExecutionProviders.join(', ')
        : 'none';
    console.info(
        `[GMNet] Execution provider: ${normalizedProvider} (variant: ${modelVariant}, requested: ${requestedProviders})`
    );
}

function resizeImageData(imageData, targetWidth, targetHeight) {
    if (imageData.width === targetWidth && imageData.height === targetHeight) {
        return imageData;
    }

    const { canvas: sourceCanvas, ctx: sourceCtx } = createCanvasWithContext(imageData.width, imageData.height);
    sourceCtx.putImageData(imageData, 0, 0);
    const { ctx: targetCtx } = createCanvasWithContext(targetWidth, targetHeight);
    targetCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    return targetCtx.getImageData(0, 0, targetWidth, targetHeight);
}

function resizeRgbaBuffer(rgba, width, height, targetWidth, targetHeight) {
    const sourceImageData = new ImageData(rgba, width, height);
    const resized = resizeImageData(sourceImageData, targetWidth, targetHeight);
    return resized.data;
}

function resolveOutputDimensions(tensor, fallbackWidth, fallbackHeight) {
    const dataLength = tensor?.data?.length ?? 0;
    const dims = tensor?.dims;
    if (Array.isArray(dims) && dims.length >= 4) {
        const height = Number(dims[dims.length - 2]);
        const width = Number(dims[dims.length - 1]);
        if (
            Number.isFinite(width) &&
            Number.isFinite(height) &&
            width > 0 &&
            height > 0 &&
            width * height === dataLength
        ) {
            return { width, height };
        }
    }

    return { width: fallbackWidth, height: fallbackHeight };
}

function createCanvasWithContext(width, height) {
    return createRuntimeCanvasWithContext(width, height, 'Canvas is not available for GMNet preprocessing');
}

export class GMNetInferenceSession {
    constructor({ runtime = globalThis } = {}) {
        this.runtime = runtime;
        this.session = null;
        this.sessionsByVariant = new Map();
        this.executionProviderByVariant = new Map();
        this.activeModelVariant = DEFAULT_GMNET_MODEL_VARIANT;
        this.activeExecutionProvider = null;
        this.downloadProgress = 0;
        this.eventListeners = {
            'progress': [],
            'complete': [],
            'error': [],
            'runtime': [],
        };
    }

    on(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(callback);
        }
    }

    off(event, callback) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(cb => cb(data));
        }
    }

    async init(modelVariant = DEFAULT_GMNET_MODEL_VARIANT, options = {}) {
        const normalizedVariant = normalizeModelVariant(modelVariant);
        const requestedExecutionProvidersRaw = Array.isArray(options.forceExecutionProviders)
            && options.forceExecutionProviders.length > 0
            ? options.forceExecutionProviders
            : resolveExecutionProviders(this.runtime);
        const requestedExecutionProviders = requestedExecutionProvidersRaw
            .map((provider) => (typeof provider === 'string' ? provider.trim().toLowerCase() : ''))
            .filter(Boolean);

        if (!hasWebGpuSupport(this.runtime)) {
            const unavailableError = new Error('WebGPU runtime is not available in this environment.');
            unavailableError.name = 'GmnetWebGpuUnavailableError';
            throw unavailableError;
        }
        if (
            requestedExecutionProviders.length !== 1
            || requestedExecutionProviders[0] !== REQUIRED_GMNET_EXECUTION_PROVIDER
        ) {
            const providerError = new Error(
                `GMNet requires executionProviders=[${REQUIRED_GMNET_EXECUTION_PROVIDER}] in strict mode.`
            );
            providerError.name = 'GmnetExecutionProviderConfigurationError';
            throw providerError;
        }

        const forceReload = Boolean(options.forceReload);
        if (!forceReload && this.sessionsByVariant.has(normalizedVariant)) {
            this.session = this.sessionsByVariant.get(normalizedVariant);
            this.activeModelVariant = normalizedVariant;
            this.activeExecutionProvider = normalizeExecutionProvider(
                this.executionProviderByVariant.get(normalizedVariant)
                || resolveActiveExecutionProvider(this.session, requestedExecutionProviders)
            );
            if (this.activeExecutionProvider !== REQUIRED_GMNET_EXECUTION_PROVIDER) {
                const cachedProviderError = new Error(
                    `GMNet requires WebGPU execution provider; cached provider is "${this.activeExecutionProvider || 'unknown'}".`
                );
                cachedProviderError.name = 'GmnetExecutionProviderMismatchError';
                throw cachedProviderError;
            }
            logExecutionProviderSelection(
                this.activeExecutionProvider,
                normalizedVariant,
                requestedExecutionProviders,
            );
            this.emit('runtime', {
                executionProvider: this.activeExecutionProvider,
                requestedExecutionProviders,
                modelVariant: normalizedVariant,
            });
            return;
        }
        if (!forceReload && this.session && this.activeModelVariant === normalizedVariant) {
            this.activeExecutionProvider = normalizeExecutionProvider(this.activeExecutionProvider);
            if (this.activeExecutionProvider !== REQUIRED_GMNET_EXECUTION_PROVIDER) {
                const providerError = new Error(
                    `GMNet requires WebGPU execution provider; active provider is "${this.activeExecutionProvider || 'unknown'}".`
                );
                providerError.name = 'GmnetExecutionProviderMismatchError';
                throw providerError;
            }
            logExecutionProviderSelection(
                this.activeExecutionProvider,
                normalizedVariant,
                requestedExecutionProviders,
            );
            this.emit('runtime', {
                executionProvider: this.activeExecutionProvider,
                requestedExecutionProviders,
                modelVariant: normalizedVariant,
            });
            return;
        }
        console.log('[GMNet] Initializing session...');

        try {
            // Note: service worker handles caching.
            // We append version query param from env.
            const version = import.meta.env.VITE_APP_ASSET_VERSION || 'dev';
            const variantConfig = MODEL_VARIANT_CONFIG[normalizedVariant];
            const modelUrl = `${MODEL_BASE_PATH}${variantConfig.modelFilename}?v=${version}`;
            const externalDataUrl = `${MODEL_BASE_PATH}${variantConfig.modelDataFilename}?v=${version}`;
            this.emit('progress', { loaded: 0, total: 1 });
            console.log(`[GMNet] Loading ${normalizedVariant} model from ${modelUrl}...`);

            // Create session from URL so ORT can resolve external tensor data files.
            const createdSession = await ort.InferenceSession.create(modelUrl, {
                executionProviders: requestedExecutionProviders,
                externalData: [
                    {
                        path: MODEL_EXTERNAL_DATA_PATH,
                        data: externalDataUrl
                    }
                ]
            });
            const resolvedExecutionProvider = normalizeExecutionProvider(resolveActiveExecutionProvider(
                createdSession,
                requestedExecutionProviders,
            ));
            if (resolvedExecutionProvider !== REQUIRED_GMNET_EXECUTION_PROVIDER) {
                const providerMismatchError = new Error(
                    `GMNet requires WebGPU execution provider; resolved "${resolvedExecutionProvider || 'unknown'}".`
                );
                providerMismatchError.name = 'GmnetExecutionProviderMismatchError';
                providerMismatchError.requestedExecutionProviders = requestedExecutionProviders;
                providerMismatchError.resolvedExecutionProvider = resolvedExecutionProvider || null;
                throw providerMismatchError;
            }

            this.sessionsByVariant.set(normalizedVariant, createdSession);
            this.session = createdSession;
            this.activeModelVariant = normalizedVariant;
            this.activeExecutionProvider = resolvedExecutionProvider;
            this.executionProviderByVariant.set(normalizedVariant, this.activeExecutionProvider);
            logExecutionProviderSelection(
                this.activeExecutionProvider,
                normalizedVariant,
                requestedExecutionProviders,
            );
            this.emit('runtime', {
                executionProvider: this.activeExecutionProvider,
                requestedExecutionProviders,
                modelVariant: normalizedVariant,
            });
            this.emit('progress', { loaded: 1, total: 1 });
            this.emit('complete', {});
            console.log('[GMNet] Inference session created.');

        } catch (e) {
            console.error('[GMNet] init error:', e);
            this.emit('error', e);
            throw e;
        }
    }

    async run(imageData, options = {}) {
        console.log('[GMNet session] run called');
        const requestedVariant = normalizeModelVariant(options?.gmnetModelVariant);
        if (!this.session || this.activeModelVariant !== requestedVariant) {
            await this.init(requestedVariant);
        }

        // imageData is RGBA Uint8ClampedArray
        const inferenceImageData = imageData;
        const inferenceWidth = inferenceImageData.width;
        const inferenceHeight = inferenceImageData.height;

        // 1. Preprocess
        // Global Input: Resize to 256x256
        console.log('[GMNet session] Starting preprocessGlobal');
        const globalTensor = await this.preprocessGlobal(inferenceImageData);

        // Local Input: Original resolution (or downscaled by half if defined)
        console.log('[GMNet session] Starting preprocessLocal');
        const localTensor = this.preprocessLocal(inferenceImageData, inferenceWidth, inferenceHeight);

        // 2. Inference
        const feeds = {
            local_input: localTensor,
            global_input: globalTensor
        };

        const inferenceProvider = this.activeExecutionProvider
            || resolveActiveExecutionProvider(this.session);
        const cpuCoreUsage = resolveCpuCoreUsageForProvider(inferenceProvider);
        console.log(
            `[GMNet session] Executing inference (provider: ${inferenceProvider}, cpu cores: ${cpuCoreUsage})...`
        );
        let results;
        results = await this.session.run(feeds);
        const outputTensor = results.gain_map;
        console.log('[GMNet session] Inference complete');

        // 3. Postprocess
        const modelOutputDimensions = resolveOutputDimensions(outputTensor, inferenceWidth, inferenceHeight);
        let inferenceOutput = this.postprocess(
            outputTensor,
            modelOutputDimensions.width,
            modelOutputDimensions.height
        );
        if (
            modelOutputDimensions.width !== inferenceWidth ||
            modelOutputDimensions.height !== inferenceHeight
        ) {
            inferenceOutput = resizeRgbaBuffer(
                inferenceOutput,
                modelOutputDimensions.width,
                modelOutputDimensions.height,
                inferenceWidth,
                inferenceHeight
            );
        }

        return inferenceOutput;
    }

    preprocessLocal(imageData, width, height) {
        // Convert RGBA URL to CHW Float32 [0,1]
        // Input: width * height * 4
        // Output: 1 * 3 * height * width
        const float32Data = new Float32Array(3 * width * height);

        // Loop is slow in JS? 
        // Basic implementation:
        for (let i = 0; i < width * height; i++) {
            const r = imageData.data[i * 4] / 255.0;
            const g = imageData.data[i * 4 + 1] / 255.0;
            const b = imageData.data[i * 4 + 2] / 255.0;

            // CHW
            float32Data[i] = r; // R
            float32Data[width * height + i] = g; // G
            float32Data[2 * width * height + i] = b; // B
        }

        return new ort.Tensor('float32', float32Data, [1, 3, height, width]);
    }

    async preprocessGlobal(imageData) {
        // Resize to 256x256
        const targetSize = 256;
        const { canvas: sourceCanvas, ctx: sourceCtx } = createCanvasWithContext(imageData.width, imageData.height);
        sourceCtx.putImageData(imageData, 0, 0);

        const { ctx: targetCtx } = createCanvasWithContext(targetSize, targetSize);
        targetCtx.drawImage(sourceCanvas, 0, 0, targetSize, targetSize);
        const resizedData = targetCtx.getImageData(0, 0, targetSize, targetSize);
        return this.preprocessLocal(resizedData, targetSize, targetSize);
    }

    postprocess(tensor, width, height) {
        // Tensor is 1 x 1 x H x W (Float32)
        // Convert to Uint8Array [0, 255]
        // returned as single channel? 
        // generateGainMapData in processing.js usually returns RGBA data or just the gain map pixels.
        // I need to check processing.js to see what it returns.

        const data = tensor.data;
        const length = data.length; // H * W
        const expectedLength = width * height;
        if (length !== expectedLength) {
            throw new Error(`GMNet output shape mismatch: expected ${expectedLength}, got ${length}`);
        }
        const output = new Uint8ClampedArray(length * 4);

        for (let i = 0; i < length; i++) {
            let val = data[i];
            // Clip 0-1
            val = Math.max(0, Math.min(1, val));
            const encoded = Math.floor(val * 255);
            const idx = i * 4;
            output[idx] = encoded;
            output[idx + 1] = encoded;
            output[idx + 2] = encoded;
            output[idx + 3] = 255;
        }

        return output;
    }
}
