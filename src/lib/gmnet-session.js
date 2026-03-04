import * as ortWebGpu from 'onnxruntime-web/webgpu';
import { createCanvasWithContext as createRuntimeCanvasWithContext } from './canvas-runtime.js';
import { GMNET_MAX_LONG_EDGE, IMAGE_MAX_LONG_EDGE } from './constants.js';

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
        globalModelFilename: 'gmnet-realworld-global.onnx',
        globalDataFilename: 'gmnet-realworld-global.onnx.data',
        localModelFilename: 'gmnet-realworld-local.onnx',
        localDataFilename: 'gmnet-realworld-local.onnx.data',
        globalInlineModelFilename: 'gmnet-realworld-global-inline.onnx',
        localInlineModelFilename: 'gmnet-realworld-local-inline.onnx',
        localWebglModelFilename: 'gmnet-realworld-local-inline-webgl.onnx'
    },
    synthetic: {
        globalModelFilename: 'gmnet-synthetic-global.onnx',
        globalDataFilename: 'gmnet-synthetic-global.onnx.data',
        localModelFilename: 'gmnet-synthetic-local.onnx',
        localDataFilename: 'gmnet-synthetic-local.onnx.data',
        globalInlineModelFilename: 'gmnet-synthetic-global-inline.onnx',
        localInlineModelFilename: 'gmnet-synthetic-local-inline.onnx',
        localWebglModelFilename: 'gmnet-synthetic-local-inline-webgl.onnx'
    }
});

function normalizeModelVariant(variant) {
    return SUPPORTED_MODEL_VARIANTS.includes(variant)
        ? variant
        : DEFAULT_GMNET_MODEL_VARIANT;
}

const MODEL_BASE_PATH = `${resolveModelBasePath()}models/`;
const GMNET_MEMORY_CONSERVATIVE_SESSION_OPTIONS = Object.freeze({
    enableMemPattern: false,
    enableCpuMemArena: false,
    executionMode: 'sequential',
});

export function hasWebGpuSupport(runtime = globalThis) {
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

function safeDisposeTensor(tensor) {
    if (!tensor || typeof tensor !== 'object') {
        return;
    }
    if (typeof tensor.dispose === 'function') {
        try {
            tensor.dispose();
        } catch (_error) {
            // Best-effort cleanup only.
        }
    }
}

function clearCanvasBackingStore(canvas) {
    if (!canvas || typeof canvas !== 'object') {
        return;
    }
    try {
        if (typeof canvas.width === 'number') {
            canvas.width = 0;
        }
        if (typeof canvas.height === 'number') {
            canvas.height = 0;
        }
    } catch (_error) {
        // Best-effort cleanup only.
    }
}

function createOrtSessionOptions(requestedExecutionProviders, externalDataOptions = null) {
    const sessionOptions = {
        executionProviders: requestedExecutionProviders,
        ...GMNET_MEMORY_CONSERVATIVE_SESSION_OPTIONS,
    };
    if (externalDataOptions) {
        sessionOptions.externalData = [externalDataOptions];
    }
    return sessionOptions;
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

function clampNumber(value, minValue, maxValue) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return minValue;
    }
    return Math.max(minValue, Math.min(maxValue, Math.floor(numeric)));
}

function reflectCoordinate(index, length) {
    const normalizedLength = Math.max(1, Math.floor(Number(length) || 1));
    if (normalizedLength <= 1) {
        return 0;
    }
    let cursor = Math.floor(Number(index) || 0);
    while (cursor < 0 || cursor >= normalizedLength) {
        if (cursor < 0) {
            cursor = -cursor - 1;
        } else if (cursor >= normalizedLength) {
            cursor = (2 * normalizedLength) - cursor - 1;
        }
    }
    return cursor;
}

function buildTileStarts(length, coreTileSize) {
    const normalizedLength = Math.max(1, Math.floor(Number(length) || 1));
    const normalizedCore = Math.max(1, Math.floor(Number(coreTileSize) || 1));
    const starts = [];
    let cursor = 0;
    while (cursor < normalizedLength) {
        let start = cursor;
        if (start + normalizedCore >= normalizedLength) {
            start = Math.max(0, normalizedLength - normalizedCore);
        }
        if (starts.length > 0 && starts[starts.length - 1] === start) {
            break;
        }
        starts.push(start);
        if (start + normalizedCore >= normalizedLength) {
            break;
        }
        cursor = start + normalizedCore;
    }
    return starts;
}

function buildFeatherWeights(length, overlap, atStartEdge, atEndEdge) {
    const normalizedLength = Math.max(1, Math.floor(Number(length) || 1));
    const weights = new Float32Array(normalizedLength);
    weights.fill(1);
    const normalizedOverlap = Math.max(0, Math.floor(Number(overlap) || 0));
    if (normalizedOverlap <= 0) {
        return weights;
    }

    for (let index = 0; index < normalizedLength; index += 1) {
        let weight = 1;
        if (!atStartEdge && index < normalizedOverlap) {
            weight = Math.min(weight, (index + 1) / (normalizedOverlap + 1));
        }
        if (!atEndEdge && index >= normalizedLength - normalizedOverlap) {
            const distanceToEnd = normalizedLength - index;
            weight = Math.min(weight, distanceToEnd / (normalizedOverlap + 1));
        }
        weights[index] = Math.max(0.001, weight);
    }
    return weights;
}

function createCanvasWithContext(width, height) {
    return createRuntimeCanvasWithContext(width, height, 'Canvas is not available for GMNet preprocessing');
}

export class GMNetInferenceSession {
    constructor({ runtime = globalThis } = {}) {
        this.runtime = runtime;
        this.session = null;
        this.globalSession = null;
        this.localSession = null;
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
        this.eventListeners['tile-step'] = [];
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
            const cachedSessions = this.sessionsByVariantAndProvider.get(sessionCacheKey) || {};
            this.globalSession = cachedSessions.globalSession || null;
            this.localSession = cachedSessions.localSession || null;
            this.session = this.localSession;
            this.activeModelVariant = normalizedVariant;
            this.activeExecutionProvider = normalizeExecutionProvider(
                this.executionProviderByVariantAndProvider.get(sessionCacheKey)
                || resolveActiveExecutionProvider(this.localSession, requestedExecutionProviders)
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
        if (!forceReload && this.localSession && this.globalSession && this.activeModelVariant === normalizedVariant) {
            this.session = this.localSession;
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
            const useInlineModels = requestedProvider === GMNET_FALLBACK_EXECUTION_PROVIDER;
            const globalModelFilename = useInlineModels
                ? variantConfig.globalInlineModelFilename
                : variantConfig.globalModelFilename;
            const localModelFilename = useInlineModels
                ? variantConfig.localWebglModelFilename
                : variantConfig.localModelFilename;
            const globalModelUrl = `${MODEL_BASE_PATH}${globalModelFilename}?v=${version}`;
            const localModelUrl = `${MODEL_BASE_PATH}${localModelFilename}?v=${version}`;
            const globalExternalDataUrl = `${MODEL_BASE_PATH}${variantConfig.globalDataFilename}?v=${version}`;
            const localExternalDataUrl = `${MODEL_BASE_PATH}${variantConfig.localDataFilename}?v=${version}`;

            const globalPayloads = await resolveModelAndExternalDataPayloads(
                this.runtime,
                requestedProvider,
                globalModelUrl,
                globalExternalDataUrl,
            );
            const localPayloads = await resolveModelAndExternalDataPayloads(
                this.runtime,
                requestedProvider,
                localModelUrl,
                localExternalDataUrl,
            );
            this.emit('progress', { loaded: 0, total: 2 });
            console.log(`[GMNet] Loading ${normalizedVariant} global model from ${globalModelUrl}...`);
            console.log(`[GMNet] Loading ${normalizedVariant} local model from ${localModelUrl}...`);

            const globalSessionOptions = createOrtSessionOptions(
                requestedExecutionProviders,
                globalPayloads.includeExternalData
                    ? {
                        path: variantConfig.globalDataFilename,
                        data: globalPayloads.externalDataPayload
                    }
                    : null,
            );
            const localSessionOptions = createOrtSessionOptions(
                requestedExecutionProviders,
                localPayloads.includeExternalData
                    ? {
                        path: variantConfig.localDataFilename,
                        data: localPayloads.externalDataPayload
                    }
                    : null,
            );

            const createdGlobalSession = await ortModule.InferenceSession.create(
                globalPayloads.modelPayload,
                globalSessionOptions,
            );
            this.emit('progress', { loaded: 1, total: 2 });
            const createdLocalSession = await ortModule.InferenceSession.create(
                localPayloads.modelPayload,
                localSessionOptions,
            );
            const resolvedExecutionProvider = normalizeExecutionProvider(resolveActiveExecutionProvider(
                createdLocalSession,
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

            this.sessionsByVariantAndProvider.set(sessionCacheKey, {
                globalSession: createdGlobalSession,
                localSession: createdLocalSession,
            });
            this.globalSession = createdGlobalSession;
            this.localSession = createdLocalSession;
            this.session = createdLocalSession;
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
            this.emit('progress', { loaded: 2, total: 2 });
            this.emit('complete', {});
            console.log('[GMNet] Inference session created.');

        } catch (e) {
            console.error('[GMNet] init error:', e);
            this.emit('error', e);
            throw e;
        }
    }

    createProbeImageData(size, forceSquare = false) {
        const width = Math.max(1, Math.floor(Number(size) || 1));
        // For WebGL inline models (which require square inputs), use square dimensions
        // Otherwise use 4:3 aspect ratio for more realistic testing
        const height = forceSquare ? width : Math.max(1, Math.floor(width * 3 / 4));
        const data = new Uint8ClampedArray(width * height * 4);
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const index = (y * width + x) * 4;
                const horizontal = width > 1 ? Math.floor((x / (width - 1)) * 255) : 127;
                const vertical = height > 1 ? Math.floor((y / (height - 1)) * 255) : 127;
                const checker = ((x >> 4) + (y >> 4)) % 2 === 0 ? 32 : -32;
                const value = Math.max(0, Math.min(255, Math.floor((horizontal + vertical) / 2 + checker)));
                data[index] = value;
                data[index + 1] = value;
                data[index + 2] = value;
                data[index + 3] = 255;
            }
        }
        return new ImageData(data, width, height);
    }

    hasSplitSessions() {
        return Boolean(this.globalSession && this.localSession);
    }

    resolveTileConfiguration(provider, sourceWidth, sourceHeight, options = {}) {
        const normalizedProvider = normalizeExecutionProvider(provider);
        const sourceLongEdge = Math.max(sourceWidth, sourceHeight);
        const requestedTileInputSize = normalizeLongEdgeLimit(options?.gmnetTileInputSize, 0);
        const requestedTileHalo = normalizeLongEdgeLimit(options?.gmnetTileHaloPx, 0);
        const capabilityTileLimit = normalizeLongEdgeLimit(options?.localInputMaxLongEdge, 0);
        const isWebgl = normalizedProvider === GMNET_FALLBACK_EXECUTION_PROVIDER;
        const fixedInputSize = isWebgl;

        let tileInputSize;
        if (isWebgl) {
            tileInputSize = DEFAULT_PROBE_MIN_LONG_EDGE;
        } else if (requestedTileInputSize > 0) {
            tileInputSize = requestedTileInputSize;
        } else {
            const inferredLimit = capabilityTileLimit > 0 ? capabilityTileLimit : sourceLongEdge;
            tileInputSize = Math.max(1, Math.min(inferredLimit, 1536));
        }

        let haloPx;
        if (isWebgl) {
            haloPx = 16;
        } else if (requestedTileHalo > 0) {
            haloPx = requestedTileHalo;
        } else {
            haloPx = clampNumber(Math.floor(tileInputSize * 0.125), 16, 96);
        }

        if (tileInputSize <= (haloPx * 2)) {
            haloPx = Math.max(0, Math.floor((tileInputSize - 1) / 2));
        }

        const nominalCoreSize = fixedInputSize
            ? Math.max(1, tileInputSize - (haloPx * 2))
            : Math.max(1, tileInputSize - (haloPx * 2));
        return {
            tileInputSize,
            haloPx,
            nominalCoreSize,
            fixedInputSize,
        };
    }

    createTilePlan(sourceWidth, sourceHeight, tileConfig) {
        const xStarts = buildTileStarts(sourceWidth, tileConfig.nominalCoreSize);
        const yStarts = buildTileStarts(sourceHeight, tileConfig.nominalCoreSize);
        const tiles = [];
        for (const coreY of yStarts) {
            for (const coreX of xStarts) {
                const coreWidth = Math.min(tileConfig.nominalCoreSize, sourceWidth - coreX);
                const coreHeight = Math.min(tileConfig.nominalCoreSize, sourceHeight - coreY);
                const atLeftEdge = coreX === 0;
                const atRightEdge = coreX + coreWidth >= sourceWidth;
                const atTopEdge = coreY === 0;
                const atBottomEdge = coreY + coreHeight >= sourceHeight;
                const inputWidth = tileConfig.fixedInputSize
                    ? tileConfig.tileInputSize
                    : coreWidth + (tileConfig.haloPx * 2);
                const inputHeight = tileConfig.fixedInputSize
                    ? tileConfig.tileInputSize
                    : coreHeight + (tileConfig.haloPx * 2);
                tiles.push({
                    tileIndex: tiles.length,
                    coreX,
                    coreY,
                    coreWidth,
                    coreHeight,
                    inputWidth,
                    inputHeight,
                    sampleStartX: coreX - tileConfig.haloPx,
                    sampleStartY: coreY - tileConfig.haloPx,
                    coreOffsetX: tileConfig.haloPx,
                    coreOffsetY: tileConfig.haloPx,
                    haloPx: tileConfig.haloPx,
                    atLeftEdge,
                    atRightEdge,
                    atTopEdge,
                    atBottomEdge,
                    weightX: buildFeatherWeights(coreWidth, tileConfig.haloPx, atLeftEdge, atRightEdge),
                    weightY: buildFeatherWeights(coreHeight, tileConfig.haloPx, atTopEdge, atBottomEdge),
                });
            }
        }
        return tiles;
    }

    createLocalTensorFromSourceTile(sourceImageData, tile) {
        const inputWidth = tile.inputWidth;
        const inputHeight = tile.inputHeight;
        const planeSize = inputWidth * inputHeight;
        const float32Data = new Float32Array(3 * planeSize);
        const sourceWidth = sourceImageData.width;
        const sourceHeight = sourceImageData.height;
        const sourceData = sourceImageData.data;

        for (let outY = 0; outY < inputHeight; outY += 1) {
            const sampleY = reflectCoordinate(tile.sampleStartY + outY, sourceHeight);
            for (let outX = 0; outX < inputWidth; outX += 1) {
                const sampleX = reflectCoordinate(tile.sampleStartX + outX, sourceWidth);
                const sourceIndex = ((sampleY * sourceWidth) + sampleX) * 4;
                const pixelIndex = (outY * inputWidth) + outX;
                float32Data[pixelIndex] = sourceData[sourceIndex] / 255.0;
                float32Data[planeSize + pixelIndex] = sourceData[sourceIndex + 1] / 255.0;
                float32Data[(2 * planeSize) + pixelIndex] = sourceData[sourceIndex + 2] / 255.0;
            }
        }

        const ortModule = this.activeOrtModule || ortWebGpu;
        return new ortModule.Tensor('float32', float32Data, [1, 3, inputHeight, inputWidth]);
    }

    resolveQmaxScalar(tensor) {
        const value = Number(tensor?.data?.[0]);
        if (!Number.isFinite(value) || value <= 0) {
            return 1;
        }
        return value;
    }

    async prepareTiledInference(imageData, options = {}) {
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
        if (!this.hasSplitSessions() || this.activeModelVariant !== requestedVariant || shouldForceReload) {
            await this.init(requestedVariant, {
                forceExecutionProviders,
                forceReload: shouldForceReload,
            });
        }

        const provider = normalizeExecutionProvider(
            this.activeExecutionProvider || resolveActiveExecutionProvider(this.localSession)
        ) || REQUIRED_GMNET_EXECUTION_PROVIDER;
        const sourceWidth = imageData.width;
        const sourceHeight = imageData.height;
        const globalTensor = await this.preprocessGlobal(imageData);
        let globalResults;
        try {
            globalResults = await this.globalSession.run({
                global_input: globalTensor,
            });
        } finally {
            safeDisposeTensor(globalTensor);
        }
        const wker = globalResults.wker;
        const wchn = globalResults.wchn;
        const qmax = globalResults.qmax;
        if (!wker || !wchn || !qmax) {
            throw new Error('GMNet global session must output wker, wchn, and qmax.');
        }

        const tileConfig = this.resolveTileConfiguration(provider, sourceWidth, sourceHeight, options);
        const tiles = this.createTilePlan(sourceWidth, sourceHeight, tileConfig);
        return {
            provider,
            sourceWidth,
            sourceHeight,
            sourceImageData: imageData,
            tileInputSize: tileConfig.tileInputSize,
            tileHaloPx: tileConfig.haloPx,
            tiles,
            tileCompleted: new Uint8Array(tiles.length),
            completedTileCount: 0,
            pendingTileCount: tiles.length,
            accumIngm: new Float32Array(sourceWidth * sourceHeight),
            global: {
                wker,
                wchn,
                qmax,
                qmaxScalar: this.resolveQmaxScalar(qmax),
            },
        };
    }

    async runTileStep(context, tileIndex) {
        if (!context || !Array.isArray(context.tiles)) {
            throw new Error('GMNet tile context is invalid.');
        }
        const normalizedTileIndex = Math.floor(Number(tileIndex));
        if (!Number.isFinite(normalizedTileIndex) || normalizedTileIndex < 0 || normalizedTileIndex >= context.tiles.length) {
            throw new Error(`GMNet tile index out of range: ${tileIndex}`);
        }
        if (context.tileCompleted[normalizedTileIndex] === 1) {
            const completedTile = context.tiles[normalizedTileIndex];
            return {
                tileIndex: normalizedTileIndex,
                tileTotal: context.tiles.length,
                gmnetTileIndex: normalizedTileIndex,
                gmnetTileTotal: context.tiles.length,
                gmnetTileX: completedTile.coreX,
                gmnetTileY: completedTile.coreY,
                gmnetTileWidth: completedTile.coreWidth,
                gmnetTileHeight: completedTile.coreHeight,
                gmnetTileHaloPx: completedTile.haloPx,
            };
        }

        const tile = context.tiles[normalizedTileIndex];
        const localTensor = this.createLocalTensorFromSourceTile(context.sourceImageData, tile);
        let outputTensor = null;
        try {
            const localResults = await this.localSession.run({
                local_input: localTensor,
                wker: context.global.wker,
                wchn: context.global.wchn,
            });
            outputTensor = localResults.ingm || localResults.gain_map;
            if (!outputTensor || !outputTensor.data) {
                throw new Error('GMNet local session must output ingm tensor data.');
            }
            const outputDims = resolveOutputDimensions(outputTensor, tile.inputWidth, tile.inputHeight);
            if (outputDims.width !== tile.inputWidth || outputDims.height !== tile.inputHeight) {
                throw new Error(
                    `GMNet local tile output shape mismatch: expected ${tile.inputWidth}x${tile.inputHeight}, `
                    + `received ${outputDims.width}x${outputDims.height}.`
                );
            }

            const outputData = outputTensor.data;
            const sourceWidth = context.sourceWidth;
            for (let coreY = 0; coreY < tile.coreHeight; coreY += 1) {
                const sampleY = tile.coreOffsetY + coreY;
                const weightY = tile.weightY[coreY];
                const outputRowOffset = sampleY * tile.inputWidth;
                const targetY = tile.coreY + coreY;
                const targetRowOffset = targetY * sourceWidth;
                for (let coreX = 0; coreX < tile.coreWidth; coreX += 1) {
                    const sampleX = tile.coreOffsetX + coreX;
                    const value = Number(outputData[outputRowOffset + sampleX]);
                    const targetX = tile.coreX + coreX;
                    const targetIndex = targetRowOffset + targetX;
                    const weight = tile.weightX[coreX] * weightY;
                    context.accumIngm[targetIndex] += value * weight;
                }
            }
        } finally {
            safeDisposeTensor(localTensor);
            safeDisposeTensor(outputTensor);
        }

        context.tileCompleted[normalizedTileIndex] = 1;
        context.completedTileCount += 1;
        context.pendingTileCount = Math.max(0, context.tiles.length - context.completedTileCount);
        const metadata = {
            tileIndex: normalizedTileIndex,
            tileTotal: context.tiles.length,
            gmnetTileIndex: normalizedTileIndex,
            gmnetTileTotal: context.tiles.length,
            gmnetTileX: tile.coreX,
            gmnetTileY: tile.coreY,
            gmnetTileWidth: tile.coreWidth,
            gmnetTileHeight: tile.coreHeight,
            gmnetTileHaloPx: tile.haloPx,
        };
        this.emit('tile-step', metadata);
        return metadata;
    }

    destroyTiledContext(context) {
        if (!context || typeof context !== 'object' || context.destroyed === true) {
            return;
        }
        context.destroyed = true;
        safeDisposeTensor(context?.global?.wker);
        safeDisposeTensor(context?.global?.wchn);
        safeDisposeTensor(context?.global?.qmax);
        context.global = null;
        context.sourceImageData = null;
        context.tiles = [];
        context.tileCompleted = null;
        context.accumIngm = null;
        context.completedTileCount = 0;
        context.pendingTileCount = 0;
    }

    finalizeTiledInference(context, options = {}) {
        if (!context || !context.accumIngm || !Array.isArray(context.tiles)) {
            throw new Error('GMNet tile context is invalid.');
        }
        const shouldDestroyContext = options?.destroyContext !== false;
        try {
            const pixelCount = context.sourceWidth * context.sourceHeight;
            const output = new Uint8ClampedArray(pixelCount * 4);
            const weightAccumulator = new Float32Array(pixelCount);
            const sourceWidth = context.sourceWidth;
            for (const tile of context.tiles) {
                for (let coreY = 0; coreY < tile.coreHeight; coreY += 1) {
                    const weightY = tile.weightY[coreY];
                    const targetY = tile.coreY + coreY;
                    const targetRowOffset = targetY * sourceWidth;
                    for (let coreX = 0; coreX < tile.coreWidth; coreX += 1) {
                        const targetX = tile.coreX + coreX;
                        const targetIndex = targetRowOffset + targetX;
                        const weight = tile.weightX[coreX] * weightY;
                        weightAccumulator[targetIndex] += weight;
                    }
                }
            }

            const qmaxScalar = Number(context?.global?.qmaxScalar) || 1;
            for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
                const weight = weightAccumulator[pixelIndex];
                const normalizedIng = weight > 0
                    ? context.accumIngm[pixelIndex] / weight
                    : 0;
                const igm = Math.max(0, Math.min(1, normalizedIng * qmaxScalar));
                const encoded = Math.floor(igm * 255);
                const outputOffset = pixelIndex * 4;
                output[outputOffset] = encoded;
                output[outputOffset + 1] = encoded;
                output[outputOffset + 2] = encoded;
                output[outputOffset + 3] = 255;
            }
            return output;
        } finally {
            if (shouldDestroyContext) {
                this.destroyTiledContext(context);
            }
        }
    }

    async runLegacyMonolithic(imageData, options = {}) {
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
        if (activeProvider === GMNET_FALLBACK_EXECUTION_PROVIDER) {
            const fixedLongEdge = DEFAULT_PROBE_MIN_LONG_EDGE;
            if (probeMode || sourceWidth !== fixedLongEdge || sourceHeight !== fixedLongEdge) {
                inferenceImageData = resizeImageData(
                    imageData,
                    fixedLongEdge,
                    fixedLongEdge,
                );
                inferenceWidth = fixedLongEdge;
                inferenceHeight = fixedLongEdge;
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

        const globalTensor = await this.preprocessGlobal(imageData);
        const localTensor = this.preprocessLocal(inferenceImageData, inferenceWidth, inferenceHeight);
        const results = await this.session.run({
            local_input: localTensor,
            global_input: globalTensor
        });
        const outputTensor = results.gain_map;
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
            this.activeExecutionProvider || resolveActiveExecutionProvider(this.localSession || this.session)
        );
        if (!provider) {
            throw createCapabilityProbeError(
                'GMNet provider must be initialized before resolving compatibility metadata.',
                { provider: null, attempts: [] },
            );
        }

        return {
            provider,
            gainMapMaxLongEdge: IMAGE_MAX_LONG_EDGE,
            outputMaxLongEdge: IMAGE_MAX_LONG_EDGE,
            source: provider === GMNET_WASM_EXECUTION_PROVIDER ? 'wasm-unlimited' : 'smoke-validated',
            attempts: [],
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
        if ((!this.localSession && !this.session) || this.activeModelVariant !== requestedVariant || shouldForceReload) {
            await this.init(requestedVariant, {
                forceExecutionProviders,
                forceReload: shouldForceReload,
            });
        }
        const inferenceProvider = this.activeExecutionProvider
            || resolveActiveExecutionProvider(this.localSession || this.session);
        console.log(
            `[GMNet session] Executing inference (provider: ${inferenceProvider})...`
        );
        if (!this.hasSplitSessions() && this.session) {
            return this.runLegacyMonolithic(imageData, options);
        }

        const context = await this.prepareTiledInference(imageData, options);
        try {
            for (let tileIndex = 0; tileIndex < context.tiles.length; tileIndex += 1) {
                await this.runTileStep(context, tileIndex);
            }
            return this.finalizeTiledInference(context);
        } catch (error) {
            this.destroyTiledContext(context);
            throw error;
        }
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

        const { canvas: targetCanvas, ctx: targetCtx } = createCanvasWithContext(targetSize, targetSize);
        try {
            targetCtx.drawImage(sourceCanvas, 0, 0, targetSize, targetSize);
            const resizedData = targetCtx.getImageData(0, 0, targetSize, targetSize);
            return this.preprocessLocal(resizedData, targetSize, targetSize);
        } finally {
            clearCanvasBackingStore(sourceCanvas);
            clearCanvasBackingStore(targetCanvas);
        }
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
