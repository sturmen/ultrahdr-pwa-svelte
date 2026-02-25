import * as ortWebGpu from 'onnxruntime-web/webgpu';
import { createCanvasWithContext as createRuntimeCanvasWithContext } from './canvas-runtime.js';

export const REQUIRED_GMNET_EXECUTION_PROVIDER = 'webgpu';
export const GMNET_FALLBACK_EXECUTION_PROVIDER = 'webgl';
export const GMNET_WASM_EXECUTION_PROVIDER = 'wasm';
export const SUPPORTED_GMNET_EXECUTION_PROVIDERS = Object.freeze([
    REQUIRED_GMNET_EXECUTION_PROVIDER,
    GMNET_FALLBACK_EXECUTION_PROVIDER,
    GMNET_WASM_EXECUTION_PROVIDER,
]);

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

function isWebKitRuntime(runtime = globalThis) {
    const userAgent = String(runtime?.navigator?.userAgent || '').toLowerCase();
    if (!userAgent.includes('applewebkit')) {
        return false;
    }
    return !userAgent.includes('chrome')
        && !userAgent.includes('chromium')
        && !userAgent.includes('edg/');
}

function isFirefoxRuntime(runtime = globalThis) {
    const userAgent = String(runtime?.navigator?.userAgent || '').toLowerCase();
    return userAgent.includes('firefox/');
}

const DEFAULT_WASM_THREAD_COUNT = 1;
const MAX_WASM_THREAD_COUNT = 4;
const DEFAULT_PROBE_MIN_LONG_EDGE = 128;
const DEFAULT_PROBE_MAX_LONG_EDGE = 4096;
const DEFAULT_PROBE_TIMEOUT_MS = 12_000;
const PROBE_MIN_DYNAMIC_RANGE = 2;
const PROBE_MIN_STD_DEV = 0.25;
const PROBE_STATE_STORAGE_KEY = 'ultrahdr:probe-state:v1';
let ortAllModulePromise = null;
const configuredOrtModules = new WeakSet();

export class ProbeStateManager {
    constructor({ storage = null } = {}) {
        this.storage = storage;
    }

    writeBeforeProbe(candidateLongEdge, provider) {
        const state = {
            candidate: candidateLongEdge,
            provider,
            phase: 'running',
            timestamp: Date.now(),
        };
        console.log(`[GMNet probe state] before probe: candidate=${candidateLongEdge}, provider=${provider}`);
        this._write(state);
    }

    writeAfterProbe(candidateLongEdge, provider, status) {
        const state = {
            candidate: candidateLongEdge,
            provider,
            phase: status,
            timestamp: Date.now(),
        };
        console.log(`[GMNet probe state] after probe: candidate=${candidateLongEdge}, provider=${provider}, status=${status}`);
        this._write(state);
    }

    detectCrash() {
        const state = this._read();
        if (!state || typeof state !== 'object') {
            return null;
        }
        if (state.phase === 'running') {
            return state;
        }
        return null;
    }

    clearState() {
        try {
            if (this.storage && typeof this.storage.removeItem === 'function') {
                this.storage.removeItem(PROBE_STATE_STORAGE_KEY);
            }
        } catch (_error) {
            // Best-effort removal.
        }
    }

    _write(state) {
        try {
            if (this.storage && typeof this.storage.setItem === 'function') {
                this.storage.setItem(PROBE_STATE_STORAGE_KEY, JSON.stringify(state));
            }
        } catch (_error) {
            // Best-effort write.
        }
    }

    _read() {
        try {
            if (!this.storage || typeof this.storage.getItem !== 'function') {
                return null;
            }
            const raw = this.storage.getItem(PROBE_STATE_STORAGE_KEY);
            if (!raw) {
                return null;
            }
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') {
                return null;
            }
            return parsed;
        } catch (_error) {
            return null;
        }
    }
}

export function isMobileDevice(runtime = globalThis) {
    const navigatorRef = runtime?.navigator;
    const userAgent = String(navigatorRef?.userAgent || '').toLowerCase();
    const maxTouchPoints = Number(navigatorRef?.maxTouchPoints || 0) || 0;

    if (/android|iphone|ipod|mobile/.test(userAgent)) {
        return true;
    }
    // iPad reports as macOS but has touch
    if (/(macintosh|mac os x)/.test(userAgent) && maxTouchPoints > 1) {
        return true;
    }
    return false;
}

export async function gallopingSearchUpperBound(min, max, evaluate) {
    let candidate = min;
    let lastPass = null;
    let firstFail = null;

    while (candidate <= max) {
        const passed = await evaluate(candidate);
        if (passed) {
            lastPass = candidate;
            candidate = candidate * 2;
        } else {
            firstFail = candidate;
            break;
        }
    }

    // If we galloped past max without failure, test max explicitly
    if (firstFail === null && lastPass !== null && lastPass < max) {
        const passed = await evaluate(max);
        if (passed) {
            lastPass = max;
        } else {
            firstFail = max;
        }
    } else if (firstFail === null && lastPass !== null && lastPass >= max) {
        // lastPass already equals or exceeds max; clamp it
        lastPass = max;
    }

    return { lastPass, firstFail };
}

export async function binarySearchMaxCapability(low, high, evaluate) {
    let best = null;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const passed = await evaluate(mid);
        if (passed) {
            best = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return best;
}


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
    // WebKit workers are still unreliable with threaded ORT startup in our startup-gate path.
    if (isWebKitRuntime(runtime)) {
        return DEFAULT_WASM_THREAD_COUNT;
    }
    if (!supportsWasmThreading(runtime)) {
        return DEFAULT_WASM_THREAD_COUNT;
    }
    const hardwareConcurrency = resolveHardwareConcurrency(runtime);
    const boundedCount = Math.min(MAX_WASM_THREAD_COUNT, hardwareConcurrency);
    return Math.max(2, boundedCount);
}

function configureOrtRuntime(ortModule, runtime = globalThis) {
    if (!ortModule || typeof ortModule !== 'object') {
        return;
    }
    if (configuredOrtModules.has(ortModule)) {
        return;
    }

    if (!ortModule.env || typeof ortModule.env !== 'object') {
        return;
    }

    if (!ortModule.env.wasm || typeof ortModule.env.wasm !== 'object') {
        ortModule.env.wasm = {};
    }

    ortModule.env.wasm.numThreads = resolveWasmThreadCount(runtime);
    ortModule.env.wasm.simd = !isWebKitRuntime(runtime);
    const ortAssetBasePath = resolveOrtAssetBasePath();
    ortModule.env.wasm.wasmPaths = {
        'ort-wasm.wasm': `${ortAssetBasePath}ort-wasm.wasm`,
        'ort-wasm-simd.wasm': `${ortAssetBasePath}ort-wasm-simd.wasm`,
        'ort-wasm-threaded.wasm': `${ortAssetBasePath}ort-wasm-threaded.wasm`,
        'ort-wasm-simd-threaded.wasm': `${ortAssetBasePath}ort-wasm-simd-threaded.wasm`,
        'ort-wasm-simd-threaded.jsep.wasm': `${ortAssetBasePath}ort-wasm-simd-threaded.jsep.wasm`,
        'ort-wasm-simd-threaded.asyncify.wasm': `${ortAssetBasePath}ort-wasm-simd-threaded.asyncify.wasm`,
        'ort-wasm-simd-threaded.jspi.wasm': `${ortAssetBasePath}ort-wasm-simd-threaded.jspi.wasm`
    };
    // Disable proxy to prevent ONNX from trying to spawn another worker or check for document.
    ortModule.env.wasm.proxy = false;

    if (!ortModule.env.webgpu || typeof ortModule.env.webgpu !== 'object') {
        ortModule.env.webgpu = {};
    }
    // Prefer the high-performance adapter for GMNet inference when WebGPU is available.
    // Skip this hint on Windows where Chromium currently ignores it and emits noisy warnings.
    if (!isWindowsRuntime(runtime)) {
        ortModule.env.webgpu.powerPreference = 'high-performance';
    }

    configuredOrtModules.add(ortModule);
}

async function loadOrtAllModule(runtime = globalThis) {
    if (!ortAllModulePromise) {
        ortAllModulePromise = import('onnxruntime-web/all');
    }
    const ortAllModule = await ortAllModulePromise;
    configureOrtRuntime(ortAllModule, runtime);
    return ortAllModule;
}

async function resolveOrtModuleForProvider(provider, runtime = globalThis) {
    if (provider === GMNET_FALLBACK_EXECUTION_PROVIDER || provider === GMNET_WASM_EXECUTION_PROVIDER) {
        return loadOrtAllModule(runtime);
    }
    configureOrtRuntime(ortWebGpu, runtime);
    return ortWebGpu;
}

configureOrtRuntime(ortWebGpu);

export const DEFAULT_GMNET_MODEL_VARIANT = 'realworld';
const SUPPORTED_MODEL_VARIANTS = Object.freeze(['realworld', 'synthetic']);
const MODEL_VARIANT_CONFIG = Object.freeze({
    realworld: {
        modelFilename: 'gmnet-realworld.onnx',
        modelDataFilename: 'gmnet-realworld.onnx.data',
        inlineModelFilename: 'gmnet-realworld-inline.onnx',
        webglModelFilename: 'gmnet-realworld-inline-webgl.onnx'
    },
    synthetic: {
        modelFilename: 'gmnet-synthetic.onnx',
        modelDataFilename: 'gmnet-synthetic.onnx.data',
        inlineModelFilename: 'gmnet-synthetic-inline.onnx',
        webglModelFilename: 'gmnet-synthetic-inline-webgl.onnx'
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

function hasWebGlSupport(runtime = globalThis) {
    try {
        if (typeof runtime?.OffscreenCanvas !== 'undefined') {
            const canvas = new runtime.OffscreenCanvas(1, 1);
            const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (context) {
                return true;
            }
        }
    } catch (_error) {
        // Fall through to DOM canvas probing.
    }

    try {
        if (typeof runtime?.document?.createElement === 'function') {
            const canvas = runtime.document.createElement('canvas');
            if (canvas && typeof canvas.getContext === 'function') {
                const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (context) {
                    return true;
                }
            }
        }
    } catch (_error) {
        // No-op.
    }

    return false;
}

function resolveExecutionProviders(runtime = globalThis) {
    if (hasWebGpuSupport(runtime)) {
        return [REQUIRED_GMNET_EXECUTION_PROVIDER];
    }
    if (hasWebGlSupport(runtime)) {
        return [GMNET_FALLBACK_EXECUTION_PROVIDER];
    }
    return [];
}

function normalizeExecutionProvider(value) {
    if (typeof value !== 'string') {
        return null;
    }
    const normalized = value.trim().toLowerCase();
    return normalized || null;
}

async function loadBinaryAsset(runtime, assetUrl, assetLabel) {
    const fetchFn = runtime?.fetch || globalThis.fetch;
    if (typeof fetchFn !== 'function') {
        throw new Error(`Fetch API is unavailable for ${assetLabel} loading.`);
    }

    const response = await fetchFn.call(runtime, assetUrl, { credentials: 'same-origin' });
    if (!response?.ok) {
        throw new Error(
            `Failed to load ${assetLabel}: ${response?.status || 'unknown status'}.`
        );
    }

    if (typeof response.arrayBuffer !== 'function') {
        throw new Error(`${assetLabel} response does not support arrayBuffer().`);
    }

    const buffer = await response.arrayBuffer();
    if (!(buffer instanceof ArrayBuffer) || buffer.byteLength === 0) {
        throw new Error(`${assetLabel} response was empty.`);
    }

    return new Uint8Array(buffer);
}

async function resolveModelAndExternalDataPayloads(runtime, provider, modelUrl, externalDataUrl) {
    if (provider === GMNET_FALLBACK_EXECUTION_PROVIDER) {
        const modelPayload = await loadBinaryAsset(runtime, modelUrl, 'GMNet ONNX model');
        return {
            modelPayload,
            externalDataPayload: null,
            includeExternalData: false,
        };
    }

    if (provider === GMNET_WASM_EXECUTION_PROVIDER) {
        const modelPayload = await loadBinaryAsset(runtime, modelUrl, 'GMNet ONNX model');
        const externalDataPayload = await loadBinaryAsset(runtime, externalDataUrl, 'GMNet ONNX model external data');
        return {
            modelPayload,
            externalDataPayload,
            includeExternalData: true,
        };
    }

    return {
        modelPayload: modelUrl,
        externalDataPayload: externalDataUrl,
        includeExternalData: true,
    };
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

    return requestedExecutionProviders[0] || 'unknown';
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

function createSessionCacheKey(modelVariant, provider) {
    const normalizedVariant = normalizeModelVariant(modelVariant);
    const normalizedProvider = normalizeExecutionProvider(provider) || 'unknown';
    return `${normalizedVariant}:${normalizedProvider}`;
}

function normalizeLongEdgeLimit(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 1) {
        return fallback;
    }
    return Math.floor(numeric);
}

function resolveScaledDimensionsForLongEdge(width, height, maxLongEdge) {
    const sourceWidth = Math.max(1, Math.floor(Number(width) || 1));
    const sourceHeight = Math.max(1, Math.floor(Number(height) || 1));
    const normalizedMax = normalizeLongEdgeLimit(maxLongEdge, 0);
    if (normalizedMax <= 0) {
        return { width: sourceWidth, height: sourceHeight, changed: false };
    }
    const sourceLongEdge = Math.max(sourceWidth, sourceHeight);
    if (sourceLongEdge <= normalizedMax) {
        return { width: sourceWidth, height: sourceHeight, changed: false };
    }
    const scale = normalizedMax / sourceLongEdge;
    const nextWidth = Math.max(1, Math.floor(sourceWidth * scale));
    const nextHeight = Math.max(1, Math.floor(sourceHeight * scale));
    return {
        width: nextWidth,
        height: nextHeight,
        changed: nextWidth !== sourceWidth || nextHeight !== sourceHeight,
    };
}

function analyzeRgbaOutputStats(rgba) {
    const pixelCount = Math.floor((rgba?.length || 0) / 4);
    if (pixelCount <= 0) {
        return {
            pixelCount: 0,
            min: 0,
            max: 0,
            mean: 0,
            stdDev: 0,
            dynamicRange: 0,
        };
    }

    let min = 255;
    let max = 0;
    let sum = 0;
    let sumSq = 0;

    for (let index = 0; index < pixelCount; index += 1) {
        const value = rgba[index * 4];
        if (value < min) {
            min = value;
        }
        if (value > max) {
            max = value;
        }
        sum += value;
        sumSq += value * value;
    }

    const mean = sum / pixelCount;
    const variance = Math.max(0, (sumSq / pixelCount) - (mean * mean));
    const stdDev = Math.sqrt(variance);
    return {
        pixelCount,
        min,
        max,
        mean,
        stdDev,
        dynamicRange: max - min,
    };
}

function isProbeOutputNearFlat(stats) {
    if (!stats || typeof stats !== 'object') {
        return true;
    }
    if (
        !Number.isFinite(stats.dynamicRange)
        || !Number.isFinite(stats.stdDev)
    ) {
        return true;
    }
    return stats.dynamicRange < PROBE_MIN_DYNAMIC_RANGE || stats.stdDev < PROBE_MIN_STD_DEV;
}

function createCapabilityProbeError(message, diagnostics = {}, cause = null) {
    const error = new Error(message || 'Failed to resolve GMNet gain-map capability.');
    error.name = 'GmnetCapabilityProbeError';
    error.diagnostics = diagnostics;
    if (cause) {
        error.cause = cause;
    }
    return error;
}

function yieldToEventLoop() {
    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

function runWithTimeout(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
    const normalizedTimeoutMs = Number(timeoutMs);
    if (!Number.isFinite(normalizedTimeoutMs) || normalizedTimeoutMs <= 0) {
        return promise;
    }
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            const timeoutError = new Error(timeoutMessage);
            timeoutError.name = 'GmnetCapabilityProbeTimeoutError';
            reject(timeoutError);
        }, normalizedTimeoutMs);
        promise.then(
            (value) => {
                clearTimeout(timeoutId);
                resolve(value);
            },
            (error) => {
                clearTimeout(timeoutId);
                reject(error);
            },
        );
    });
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
        this.sessionsByVariantAndProvider = new Map();
        this.executionProviderByVariantAndProvider = new Map();
        this.activeModelVariant = DEFAULT_GMNET_MODEL_VARIANT;
        this.activeExecutionProvider = null;
        this.activeOrtModule = ortWebGpu;
        this.downloadProgress = 0;
        this.eventListeners = Object.create(null);
        this.eventListeners.progress = [];
        this.eventListeners.complete = [];
        this.eventListeners.error = [];
        this.eventListeners.runtime = [];
        this.eventListeners['capability-probe'] = [];
    }

    on(event, callback) {
        if (typeof event !== 'string' || event.length === 0 || typeof callback !== 'function') return;
        if (!Array.isArray(this.eventListeners[event])) this.eventListeners[event] = [];
        this.eventListeners[event].push(callback);
    }

    off(event, callback) {
        if (typeof event !== 'string' || event.length === 0 || typeof callback !== 'function') return;
        if (!Array.isArray(this.eventListeners[event])) return;
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (typeof event !== 'string' || event.length === 0) return;
        if (!Array.isArray(this.eventListeners[event])) return;
        const listeners = [...this.eventListeners[event]];
        listeners.forEach((callback) => callback(data));
    }

    async init(modelVariant = DEFAULT_GMNET_MODEL_VARIANT, options = {}) {
        const normalizedVariant = normalizeModelVariant(modelVariant);
        const requestedExecutionProvidersRaw = Array.isArray(options.forceExecutionProviders)
            && options.forceExecutionProviders.length > 0
            ? options.forceExecutionProviders
            : resolveExecutionProviders(this.runtime);
        const requestedExecutionProviders = requestedExecutionProvidersRaw
            .map((provider) => (typeof provider === 'string' ? provider.trim().toLowerCase() : ''))
            .filter((provider) => SUPPORTED_GMNET_EXECUTION_PROVIDERS.includes(provider));

        if (requestedExecutionProviders.length !== 1) {
            const providerError = new Error(
                `GMNet requires exactly one GPU execution provider from [${SUPPORTED_GMNET_EXECUTION_PROVIDERS.join(', ')}].`
            );
            providerError.name = 'GmnetExecutionProviderConfigurationError';
            throw providerError;
        }
        const requestedProvider = requestedExecutionProviders[0];

        if (requestedProvider === REQUIRED_GMNET_EXECUTION_PROVIDER && !hasWebGpuSupport(this.runtime)) {
            const unavailableError = new Error('WebGPU runtime is not available in this environment.');
            unavailableError.name = 'GmnetWebGpuUnavailableError';
            throw unavailableError;
        }

        if (requestedProvider === GMNET_FALLBACK_EXECUTION_PROVIDER && !hasWebGlSupport(this.runtime)) {
            const unavailableError = new Error('WebGL runtime is not available in this environment.');
            unavailableError.name = 'GmnetWebGlUnavailableError';
            throw unavailableError;
        }

        // WASM is universally available — no runtime check needed.

        const ortModule = await resolveOrtModuleForProvider(requestedProvider, this.runtime);
        const sessionCacheKey = createSessionCacheKey(normalizedVariant, requestedProvider);
        const forceReload = Boolean(options.forceReload);
        if (!forceReload && this.sessionsByVariantAndProvider.has(sessionCacheKey)) {
            this.session = this.sessionsByVariantAndProvider.get(sessionCacheKey);
            this.activeModelVariant = normalizedVariant;
            this.activeExecutionProvider = normalizeExecutionProvider(
                this.executionProviderByVariantAndProvider.get(sessionCacheKey)
                || resolveActiveExecutionProvider(this.session, requestedExecutionProviders)
            );
            this.activeOrtModule = ortModule;
            if (this.activeExecutionProvider !== requestedProvider) {
                const cachedProviderError = new Error(
                    `GMNet requires "${requestedProvider}" execution provider; cached provider is "${this.activeExecutionProvider || 'unknown'}".`
                );
                cachedProviderError.name = 'GmnetExecutionProviderMismatchError';
                cachedProviderError.requestedExecutionProviders = requestedExecutionProviders;
                cachedProviderError.resolvedExecutionProvider = this.activeExecutionProvider || null;
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
            if (this.activeExecutionProvider !== requestedProvider) {
                const providerError = new Error(
                    `GMNet requires "${requestedProvider}" execution provider; active provider is "${this.activeExecutionProvider || 'unknown'}".`
                );
                providerError.name = 'GmnetExecutionProviderMismatchError';
                providerError.requestedExecutionProviders = requestedExecutionProviders;
                providerError.resolvedExecutionProvider = this.activeExecutionProvider || null;
                throw providerError;
            }
            this.activeOrtModule = ortModule;
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
            const useInlineModel = requestedProvider === GMNET_FALLBACK_EXECUTION_PROVIDER;
            const useCompatibilityWebGlModel = requestedProvider === GMNET_FALLBACK_EXECUTION_PROVIDER
                && typeof variantConfig.webglModelFilename === 'string'
                && variantConfig.webglModelFilename.length > 0;
            const modelFilename = useInlineModel
                ? (useCompatibilityWebGlModel
                    ? variantConfig.webglModelFilename
                    : variantConfig.inlineModelFilename)
                : variantConfig.modelFilename;
            const modelUrl = `${MODEL_BASE_PATH}${modelFilename}?v=${version}`;
            const externalDataUrl = `${MODEL_BASE_PATH}${variantConfig.modelDataFilename}?v=${version}`;
            const { modelPayload, externalDataPayload, includeExternalData } = await resolveModelAndExternalDataPayloads(
                this.runtime,
                requestedProvider,
                modelUrl,
                externalDataUrl
            );
            this.emit('progress', { loaded: 0, total: 1 });
            console.log(`[GMNet] Loading ${normalizedVariant} model from ${modelUrl}...`);

            // Use URL payloads for WebGPU and explicit binary payloads for WebGL compatibility.
            const sessionOptions = {
                executionProviders: requestedExecutionProviders,
            };
            if (includeExternalData) {
                sessionOptions.externalData = [
                    {
                        path: MODEL_EXTERNAL_DATA_PATH,
                        data: externalDataPayload
                    }
                ];
            }
            const createdSession = await ortModule.InferenceSession.create(modelPayload, sessionOptions);
            const resolvedExecutionProvider = normalizeExecutionProvider(resolveActiveExecutionProvider(
                createdSession,
                requestedExecutionProviders,
            ));
            if (resolvedExecutionProvider !== requestedProvider) {
                const providerMismatchError = new Error(
                    `GMNet requires "${requestedProvider}" execution provider; resolved "${resolvedExecutionProvider || 'unknown'}".`
                );
                providerMismatchError.name = 'GmnetExecutionProviderMismatchError';
                providerMismatchError.requestedExecutionProviders = requestedExecutionProviders;
                providerMismatchError.resolvedExecutionProvider = resolvedExecutionProvider || null;
                throw providerMismatchError;
            }

            this.sessionsByVariantAndProvider.set(sessionCacheKey, createdSession);
            this.session = createdSession;
            this.activeModelVariant = normalizedVariant;
            this.activeExecutionProvider = resolvedExecutionProvider;
            this.activeOrtModule = ortModule;
            this.executionProviderByVariantAndProvider.set(sessionCacheKey, this.activeExecutionProvider);
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

    createProbeImageData(size) {
        const normalizedSize = Math.max(1, Math.floor(Number(size) || 1));
        const data = new Uint8ClampedArray(normalizedSize * normalizedSize * 4);
        for (let y = 0; y < normalizedSize; y += 1) {
            for (let x = 0; x < normalizedSize; x += 1) {
                const index = (y * normalizedSize + x) * 4;
                const horizontal = normalizedSize > 1 ? Math.floor((x / (normalizedSize - 1)) * 255) : 127;
                const vertical = normalizedSize > 1 ? Math.floor((y / (normalizedSize - 1)) * 255) : 127;
                const checker = ((x >> 4) + (y >> 4)) % 2 === 0 ? 32 : -32;
                const value = Math.max(0, Math.min(255, Math.floor((horizontal + vertical) / 2 + checker)));
                data[index] = value;
                data[index + 1] = value;
                data[index + 2] = value;
                data[index + 3] = 255;
            }
        }
        return new ImageData(data, normalizedSize, normalizedSize);
    }

    async resolveGainMapCapability(options = {}) {
        const requestedVariant = normalizeModelVariant(options?.gmnetModelVariant);
        const requestedProviders = Array.isArray(options?.forceExecutionProviders)
            ? options.forceExecutionProviders
            : undefined;
        const normalizedRequestedProviders = Array.isArray(requestedProviders)
            ? requestedProviders
                .map((provider) => normalizeExecutionProvider(provider))
                .filter((provider) => SUPPORTED_GMNET_EXECUTION_PROVIDERS.includes(provider))
            : [];
        const requestedProvider = normalizedRequestedProviders.length === 1
            ? normalizedRequestedProviders[0]
            : null;
        const shouldForceReload = Boolean(requestedProvider)
            && normalizeExecutionProvider(this.activeExecutionProvider) !== requestedProvider;
        if (!this.session || this.activeModelVariant !== requestedVariant || shouldForceReload) {
            await this.init(requestedVariant, {
                forceExecutionProviders: requestedProviders,
                forceReload: shouldForceReload,
            });
        }

        const provider = normalizeExecutionProvider(
            this.activeExecutionProvider || resolveActiveExecutionProvider(this.session)
        );
        if (!provider) {
            throw createCapabilityProbeError(
                'GMNet provider must be initialized before probing capability.',
                { provider: null, attempts: [] },
            );
        }

        // WASM runs on CPU — no GPU texture limits. Skip probing entirely.
        if (provider === GMNET_WASM_EXECUTION_PROVIDER) {
            return {
                provider,
                gainMapMaxLongEdge: 16384,
                outputMaxLongEdge: 32768,
                source: 'wasm-unlimited',
                attempts: [],
            };
        }

        const timeoutMs = normalizeLongEdgeLimit(options.timeoutMs, DEFAULT_PROBE_TIMEOUT_MS);
        const attempts = [];
        const attemptedCandidates = new Set();

        // --- Crash detection via persistent state ---
        const storageRef = this.runtime?.localStorage ?? null;
        const probeState = new ProbeStateManager({ storage: storageRef });
        const crashedCandidates = new Set();
        const crashInfo = probeState.detectCrash();
        if (crashInfo && crashInfo.provider === provider) {
            console.warn(
                `[GMNet capability probe] Detected previous crash at candidate=${crashInfo.candidate}, provider=${crashInfo.provider}. Marking as failed.`,
            );
            crashedCandidates.add(crashInfo.candidate);
            attempts.push({
                candidateLongEdge: crashInfo.candidate,
                status: 'failed',
                durationMs: 0,
                error: {
                    name: 'CrashDetected',
                    message: `Previous probe at ${crashInfo.candidate}px crashed (detected on recovery).`,
                },
            });
        }

        const evaluateCandidate = async (candidateLongEdge) => {
            if (crashedCandidates.has(candidateLongEdge)) {
                const crashAttempt = {
                    candidateLongEdge,
                    status: 'failed',
                    durationMs: 0,
                    error: {
                        name: 'CrashSkipped',
                        message: `Skipped ${candidateLongEdge}px: previously crashed.`,
                    },
                };
                attempts.push(crashAttempt);
                attemptedCandidates.add(candidateLongEdge);
                this.emit('capability-probe', {
                    candidate: candidateLongEdge,
                    provider,
                    phase: 'failed',
                    error: crashAttempt.error,
                    durationMs: 0,
                });
                return crashAttempt;
            }

            const startedAtMs = Date.now();
            const candidateResolution = `${candidateLongEdge}x${candidateLongEdge}`;
            const attempt = {
                candidateLongEdge,
                status: 'running',
                durationMs: 0,
            };
            try {
                this.emit('capability-probe', { candidate: candidateLongEdge, provider, phase: 'testing' });
                await yieldToEventLoop();
                console.log(
                    `[GMNet capability probe] Testing ${candidateResolution} (${provider})...`,
                );
                probeState.writeBeforeProbe(candidateLongEdge, provider);
                const probeImage = this.createProbeImageData(candidateLongEdge);
                const output = await runWithTimeout(
                    this.run(probeImage, {
                        gmnetModelVariant: requestedVariant,
                        forceExecutionProviders: [provider],
                        probeMode: true,
                    }),
                    timeoutMs,
                    `GMNet capability probe timed out at ${candidateLongEdge}px.`,
                );
                if (!(output instanceof Uint8ClampedArray)) {
                    attempt.status = 'failed';
                    attempt.error = {
                        name: 'InvalidOutputType',
                        message: `Capability probe expected Uint8ClampedArray output, received "${output?.constructor?.name || typeof output}".`,
                    };
                    console.warn(`[GMNet capability probe] Failed ${candidateResolution} (${provider}): ${attempt.error.message}`);
                    probeState.writeAfterProbe(candidateLongEdge, provider, 'failed');
                    return attempt;
                }
                const expectedLength = candidateLongEdge * candidateLongEdge * 4;
                if (output.length !== expectedLength) {
                    attempt.status = 'failed';
                    attempt.error = {
                        name: 'LengthMismatch',
                        message: `Capability probe output length mismatch for ${candidateLongEdge}px: expected ${expectedLength}, got ${output.length}.`,
                    };
                    console.warn(`[GMNet capability probe] Failed ${candidateResolution} (${provider}): ${attempt.error.message}`);
                    probeState.writeAfterProbe(candidateLongEdge, provider, 'failed');
                    return attempt;
                }
                const stats = analyzeRgbaOutputStats(output);
                if (isProbeOutputNearFlat(stats)) {
                    attempt.status = 'failed';
                    attempt.error = {
                        name: 'NearFlatOutput',
                        message: `Capability probe output near-flat at ${candidateLongEdge}px (range=${stats.dynamicRange}, std=${stats.stdDev.toFixed(3)}).`,
                    };
                    console.warn(`[GMNet capability probe] Failed ${candidateResolution} (${provider}): ${attempt.error.message}`);
                    probeState.writeAfterProbe(candidateLongEdge, provider, 'failed');
                    return attempt;
                }
                attempt.status = 'passed';
                attempt.stats = stats;
                console.log(
                    `[GMNet capability probe] Passed ${candidateResolution} (${provider}).`,
                );
                probeState.writeAfterProbe(candidateLongEdge, provider, 'passed');
                return attempt;
            } catch (error) {
                attempt.status = 'failed';
                attempt.error = {
                    name: error?.name || 'Error',
                    message: error?.message || String(error),
                };
                console.warn(
                    `[GMNet capability probe] Failed ${candidateResolution} (${provider}): ${attempt.error.message}`,
                );
                probeState.writeAfterProbe(candidateLongEdge, provider, 'failed');

                try {
                    console.warn(`[GMNet capability probe] Re-initializing session to recover from candidate crash...`);
                    if (typeof this.session?.release === 'function') {
                        await this.session.release();
                    }
                } catch (e) {
                    // Ignore release errors on a crashed session
                }
                this.session = null;
                try {
                    await this.init(requestedVariant, {
                        forceExecutionProviders: [provider],
                        forceReload: true,
                    });
                } catch (initError) {
                    console.error(`[GMNet capability probe] Fatal error attempting to recover session:`, initError);
                }

                return attempt;
            } finally {
                attempt.durationMs = Math.max(0, Date.now() - startedAtMs);
                attempts.push(attempt);
                attemptedCandidates.add(candidateLongEdge);
                this.emit('capability-probe', {
                    candidate: candidateLongEdge,
                    provider,
                    phase: attempt.status,
                    error: attempt.error,
                    durationMs: attempt.durationMs,
                });
                await yieldToEventLoop();
            }
        };

        if (provider === GMNET_FALLBACK_EXECUTION_PROVIDER) {
            const fixedCandidateLongEdge = DEFAULT_PROBE_MIN_LONG_EDGE;
            const fixedAttempt = await evaluateCandidate(fixedCandidateLongEdge);
            probeState.clearState();
            if (fixedAttempt.status !== 'passed') {
                throw createCapabilityProbeError(
                    `Failed to verify fixed ${provider} GMNet capability at ${fixedCandidateLongEdge}px.`,
                    {
                        provider,
                        source: 'fixed-model',
                        minLongEdge: fixedCandidateLongEdge,
                        maxLongEdge: fixedCandidateLongEdge,
                        attempts,
                    },
                );
            }
            return {
                provider,
                gainMapMaxLongEdge: fixedCandidateLongEdge,
                outputMaxLongEdge: fixedCandidateLongEdge * 2,
                source: 'fixed-model',
                attempts,
            };
        }

        let probeMinLongEdge = normalizeLongEdgeLimit(options.minLongEdge, DEFAULT_PROBE_MIN_LONG_EDGE);
        let probeMaxLongEdge = normalizeLongEdgeLimit(options.maxLongEdge, DEFAULT_PROBE_MAX_LONG_EDGE);
        if (probeMinLongEdge > probeMaxLongEdge) {
            const temp = probeMinLongEdge;
            probeMinLongEdge = probeMaxLongEdge;
            probeMaxLongEdge = temp;
        }

        const requestedMaxAttempts = Number(options.maxAttempts);
        const binarySearchRangeSize = Math.max(1, probeMaxLongEdge - probeMinLongEdge + 1);
        const maxTotalAttempts = Number.isFinite(requestedMaxAttempts) && requestedMaxAttempts > 0
            ? Math.max(1, Math.floor(requestedMaxAttempts))
            : Math.ceil(Math.log2(binarySearchRangeSize)) + 6;

        // --- Evaluate helper: returns boolean for search algorithms ---
        // Must be defined after maxTotalAttempts so the budget check works.
        const evaluateBool = async (candidateLongEdge) => {
            if (attemptedCandidates.has(candidateLongEdge)) {
                // Already tested this candidate — look up result
                const existing = attempts.find(
                    (a) => a.candidateLongEdge === candidateLongEdge,
                );
                return existing?.status === 'passed';
            }
            // Enforce the attempt budget so search algorithms stop gracefully
            if (attempts.length >= maxTotalAttempts) {
                return false;
            }
            const attempt = await evaluateCandidate(candidateLongEdge);
            return attempt.status === 'passed';
        };

        // --- Hot-spot candidates ---
        const hotSpots = [4094, 2048].filter(
            (hs) => hs >= probeMinLongEdge && hs <= probeMaxLongEdge,
        );

        const mobile = isMobileDevice(this.runtime);
        let best = 0;

        if (mobile) {
            // Mobile strategy: test hot-spots ascending, then gallop up, then binary refine
            const mobileHotSpots = [...hotSpots].sort((a, b) => a - b);
            for (const hs of mobileHotSpots) {
                if (attempts.length >= maxTotalAttempts) break;
                const attempt = await evaluateCandidate(hs);
                if (attempt.status === 'passed') {
                    best = Math.max(best, hs);
                }
            }

            // Galloping search from min upward (skipping already-tested)
            if (attempts.length < maxTotalAttempts) {
                const gallopResult = await gallopingSearchUpperBound(
                    probeMinLongEdge,
                    probeMaxLongEdge,
                    evaluateBool,
                );
                if (gallopResult.lastPass !== null) {
                    best = Math.max(best, gallopResult.lastPass);
                }
                // Binary search to refine between lastPass and firstFail
                if (
                    gallopResult.lastPass !== null
                    && gallopResult.firstFail !== null
                    && gallopResult.firstFail - gallopResult.lastPass > 1
                    && attempts.length < maxTotalAttempts
                ) {
                    const refined = await binarySearchMaxCapability(
                        gallopResult.lastPass + 1,
                        gallopResult.firstFail - 1,
                        evaluateBool,
                    );
                    if (refined !== null) {
                        best = Math.max(best, refined);
                    }
                }
            }
        } else {
            // Desktop strategy: test hot-spots descending, then binary refine
            const desktopHotSpots = [...hotSpots].sort((a, b) => b - a);
            let hotSpotPassedMax = 0;
            let hotSpotFailedMin = probeMaxLongEdge + 1;

            for (const hs of desktopHotSpots) {
                if (attempts.length >= maxTotalAttempts) break;
                const attempt = await evaluateCandidate(hs);
                if (attempt.status === 'passed') {
                    hotSpotPassedMax = Math.max(hotSpotPassedMax, hs);
                    best = Math.max(best, hs);
                } else {
                    hotSpotFailedMin = Math.min(hotSpotFailedMin, hs);
                }
            }

            // If the largest hot-spot passed, try to push higher with binary search
            if (
                hotSpotPassedMax > 0
                && hotSpotPassedMax < probeMaxLongEdge
                && attempts.length < maxTotalAttempts
            ) {
                const refined = await binarySearchMaxCapability(
                    hotSpotPassedMax + 1,
                    probeMaxLongEdge,
                    evaluateBool,
                );
                if (refined !== null) {
                    best = Math.max(best, refined);
                }
            }

            // If no hot-spot passed, binary search the whole range
            if (hotSpotPassedMax === 0 && attempts.length < maxTotalAttempts) {
                const refined = await binarySearchMaxCapability(
                    probeMinLongEdge,
                    Math.min(hotSpotFailedMin - 1, probeMaxLongEdge),
                    evaluateBool,
                );
                if (refined !== null) {
                    best = refined;
                }
            }
        }

        // --- Clean up probe state ---
        probeState.clearState();

        if (attempts.length >= maxTotalAttempts && best < probeMinLongEdge) {
            throw createCapabilityProbeError(
                `GMNet capability probe exceeded ${maxTotalAttempts} attempts.`,
                {
                    provider,
                    source: 'probe',
                    minLongEdge: probeMinLongEdge,
                    maxLongEdge: probeMaxLongEdge,
                    attempts,
                },
            );
        }

        if (best < probeMinLongEdge) {
            throw createCapabilityProbeError(
                `Failed to find a valid ${provider} GMNet capability candidate.`,
                {
                    provider,
                    source: 'probe',
                    minLongEdge: probeMinLongEdge,
                    maxLongEdge: probeMaxLongEdge,
                    attempts,
                },
            );
        }

        // Determine source tag
        const source = best === probeMaxLongEdge ? 'probe-optimistic' : 'probe';

        return {
            provider,
            gainMapMaxLongEdge: best,
            outputMaxLongEdge: best * 2,
            source,
            attempts,
        };
    }


    async run(imageData, options = {}) {
        console.log('[GMNet session] run called');
        const requestedVariant = normalizeModelVariant(options?.gmnetModelVariant);
        const forceExecutionProviders = Array.isArray(options?.forceExecutionProviders)
            ? options.forceExecutionProviders
            : undefined;
        const normalizedForcedProviders = Array.isArray(forceExecutionProviders)
            ? forceExecutionProviders
                .map((provider) => normalizeExecutionProvider(provider))
                .filter((provider) => SUPPORTED_GMNET_EXECUTION_PROVIDERS.includes(provider))
            : [];
        const forcedProvider = normalizedForcedProviders.length === 1
            ? normalizedForcedProviders[0]
            : null;
        const shouldForceReload = Boolean(forcedProvider)
            && normalizeExecutionProvider(this.activeExecutionProvider) !== forcedProvider;
        if (!this.session || this.activeModelVariant !== requestedVariant || shouldForceReload) {
            await this.init(requestedVariant, {
                forceExecutionProviders,
                forceReload: shouldForceReload,
            });
        }

        // imageData is RGBA Uint8ClampedArray
        const sourceWidth = imageData.width;
        const sourceHeight = imageData.height;
        const probeMode = options?.probeMode === true;
        const localInputMaxLongEdge = normalizeLongEdgeLimit(options?.localInputMaxLongEdge, 0);
        const activeProvider = normalizeExecutionProvider(
            this.activeExecutionProvider || resolveActiveExecutionProvider(this.session)
        );
        let inferenceImageData = imageData;
        let inferenceWidth = sourceWidth;
        let inferenceHeight = sourceHeight;
        if (!probeMode && activeProvider === GMNET_FALLBACK_EXECUTION_PROVIDER) {
            const fixedLongEdge = DEFAULT_PROBE_MIN_LONG_EDGE;
            inferenceWidth = fixedLongEdge;
            inferenceHeight = fixedLongEdge;
            if (sourceWidth !== fixedLongEdge || sourceHeight !== fixedLongEdge) {
                inferenceImageData = resizeImageData(
                    imageData,
                    inferenceWidth,
                    inferenceHeight,
                );
            }
        } else if (!probeMode && localInputMaxLongEdge > 0) {
            const constrainedDims = resolveScaledDimensionsForLongEdge(
                sourceWidth,
                sourceHeight,
                localInputMaxLongEdge,
            );
            if (constrainedDims.changed) {
                inferenceWidth = constrainedDims.width;
                inferenceHeight = constrainedDims.height;
                inferenceImageData = resizeImageData(
                    imageData,
                    inferenceWidth,
                    inferenceHeight,
                );
            }
        }

        // 1. Preprocess
        // Global Input: Resize to 256x256
        console.log('[GMNet session] Starting preprocessGlobal');
        const globalTensor = await this.preprocessGlobal(imageData);

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
        console.log(
            `[GMNet session] Executing inference (provider: ${inferenceProvider})...`
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
        if (inferenceWidth !== sourceWidth || inferenceHeight !== sourceHeight) {
            inferenceOutput = resizeRgbaBuffer(
                inferenceOutput,
                inferenceWidth,
                inferenceHeight,
                sourceWidth,
                sourceHeight
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

        const ortModule = this.activeOrtModule || ortWebGpu;
        return new ortModule.Tensor('float32', float32Data, [1, 3, height, width]);
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
