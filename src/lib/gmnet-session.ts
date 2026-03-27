import * as ortWebGpu from 'onnxruntime-web/webgpu';
import type { Env, InferenceSession, Tensor as OrtTensor } from 'onnxruntime-common';
import { GMNET_MAX_LONG_EDGE, IMAGE_MAX_LONG_EDGE } from './constants.js';
import { hasWebGlSupport, isChromiumRuntime, isGmnetWebGlSupportedRuntime } from './runtime-browser.ts';
import { resizeRasterImageSync } from './raster-image.ts';

export const REQUIRED_GMNET_EXECUTION_PROVIDER = 'webgpu';
export const GMNET_FALLBACK_EXECUTION_PROVIDER = 'webgl';
export const GMNET_WASM_EXECUTION_PROVIDER = 'wasm';
export const SUPPORTED_GMNET_EXECUTION_PROVIDERS = Object.freeze([
    REQUIRED_GMNET_EXECUTION_PROVIDER,
    GMNET_FALLBACK_EXECUTION_PROVIDER,
    GMNET_WASM_EXECUTION_PROVIDER,
]);

type GmnetRuntime = typeof globalThis & {
    navigator?: Navigator & {
        gpu?: unknown;
    };
    fetch?: typeof fetch;
    performance?: Performance;
    crossOriginIsolated?: boolean;
    SharedArrayBuffer?: typeof SharedArrayBuffer;
    ImageData?: typeof ImageData;
};

type GmnetStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

type GmnetAssetDiagnostics = {
    assetLabel: string;
    assetUrl: string | null;
    startedAtMs: number | null;
    endedAtMs: number | null;
    durationMs: number | null;
    status: number | null;
    byteLength: number | null;
    contentType: string | null;
    attemptIndex: number | null;
};

type GmnetError = Error & {
    diagnostics?: Record<string, unknown>;
    cause?: unknown;
    requestedExecutionProviders?: string[];
    resolvedExecutionProvider?: string | null;
};

type GmnetAssetPayload = {
    payload: Uint8Array;
    diagnostics: GmnetAssetDiagnostics;
};

type GmnetModelPayloads = {
    modelPayload: ArrayBuffer | Uint8Array;
    externalDataPayload: ArrayBuffer | Uint8Array | null;
    modelLoadDiagnostics: GmnetAssetDiagnostics[];
    includeExternalData: boolean;
};

type GmnetExecutionProvider = string | null;

type GmnetSessionLike = {
    executionProviders?: string[];
    executionProvider?: string;
    handler?: { executionProvider?: string };
} & InferenceSession;

type TensorLike = OrtTensor;

type OrtModuleLike = {
    env?: {
        wasm?: Env.WebAssemblyFlags;
        webgpu?: {
            powerPreference?: string;
        };
    };
} & typeof ortWebGpu;

export type GmnetModelVariant = 'realworld' | 'synthetic';
type GmnetCheckpointingMode = 'off' | 'auto' | 'force';
type GmnetProgressEvent = { loaded?: number; total?: number };
type GmnetRuntimeEvent = {
    executionProvider?: string | null;
    requestedExecutionProviders?: string[];
    modelVariant?: string;
};
export type GmnetTileMetadata = {
    tileIndex?: number;
    tileTotal?: number;
    gmnetTileIndex?: number;
    gmnetTileTotal?: number;
    gmnetTileX?: number;
    gmnetTileY?: number;
    gmnetTileWidth?: number;
    gmnetTileHeight?: number;
    gmnetTileHaloPx?: number;
};
type GmnetEventPayloadMap = {
    progress: GmnetProgressEvent;
    runtime: GmnetRuntimeEvent;
    complete: Record<string, never>;
    error: unknown;
    'capability-probe': unknown;
    'tile-step': GmnetTileMetadata;
};
type GmnetEventName = keyof GmnetEventPayloadMap;
type GmnetEventCallback<E extends GmnetEventName = GmnetEventName> = (data: GmnetEventPayloadMap[E]) => void;
type GmnetTile = {
    tileIndex: number;
    coreX: number;
    coreY: number;
    coreWidth: number;
    coreHeight: number;
    inputWidth: number;
    inputHeight: number;
    sampleStartX: number;
    sampleStartY: number;
    coreOffsetX: number;
    coreOffsetY: number;
    haloPx: number;
    atLeftEdge: boolean;
    atRightEdge: boolean;
    atTopEdge: boolean;
    atBottomEdge: boolean;
    weightX: Float32Array;
    weightY: Float32Array;
};
type GmnetTileConfig = {
    tileInputSize: number;
    haloPx: number;
    nominalCoreSize: number;
    fixedInputSize: boolean;
};
type GmnetGlobalContext = {
    wker: TensorLike;
    wchn: TensorLike;
    qmax: TensorLike;
    qmaxScalar: number;
};
export type GmnetTiledContext = {
    provider: string;
    sourceWidth: number;
    sourceHeight: number;
    sourceImageData: ImageData | null;
    tileInputSize: number;
    tileHaloPx: number;
    tiles: GmnetTile[] | null;
    tileCompleted: Uint8Array | null;
    completedTileCount: number;
    pendingTileCount: number;
    accumIngm: Float32Array | null;
    global: GmnetGlobalContext | null;
    destroyed?: boolean;
    destroyContext?: boolean;
};

function resolveOrtAssetBasePath(): string {
    const baseUrl = import.meta.env.BASE_URL || '/';
    return baseUrl.endsWith('/') ? `${baseUrl}assets/` : `${baseUrl}/assets/`;
}

function resolveModelBasePath(): string {
    const baseUrl = import.meta.env.BASE_URL || '/';
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function isWindowsRuntime(runtime: GmnetRuntime = globalThis): boolean {
    const navigatorRef = runtime?.navigator;
    const userAgent = String(navigatorRef?.userAgent || '').toLowerCase();
    const platform = String(navigatorRef?.platform || '').toLowerCase();
    return userAgent.includes('windows') || platform.startsWith('win');
}

function isWebKitRuntime(runtime: GmnetRuntime = globalThis): boolean {
    const userAgent = String(runtime?.navigator?.userAgent || '').toLowerCase();
    if (!userAgent.includes('applewebkit')) {
        return false;
    }
    return !userAgent.includes('chrome')
        && !userAgent.includes('chromium')
        && !userAgent.includes('edg/');
}

function isFirefoxRuntime(runtime: GmnetRuntime = globalThis): boolean {
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
let ortWebGlModulePromise: Promise<unknown> | null = null;
let ortWasmModulePromise: Promise<unknown> | null = null;
const configuredOrtModules = new WeakSet<object>();

function appendAssetVersionQuery(url: string): string {
    const appAssetVersion = typeof import.meta.env.VITE_APP_ASSET_VERSION === 'string'
        ? import.meta.env.VITE_APP_ASSET_VERSION.trim()
        : '';
    if (!appAssetVersion) {
        return url;
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(appAssetVersion)}`;
}

function resolveWebglRuntimeModuleUrl(): string {
    return appendAssetVersionQuery(`${resolveOrtAssetBasePath()}ort.webgl.min.mjs`);
}

export class ProbeStateManager {
    storage: GmnetStorageLike | null;

    constructor({ storage = null }: { storage?: GmnetStorageLike | null } = {}) {
        this.storage = storage;
    }

    writeBeforeProbe(candidateLongEdge: number, provider: string): void {
        const state = {
            candidate: candidateLongEdge,
            provider,
            phase: 'running',
            timestamp: Date.now(),
        };
        console.log(`[GMNet probe state] before probe: candidate=${candidateLongEdge}, provider=${provider}`);
        this._write(state);
    }

    writeAfterProbe(candidateLongEdge: number, provider: string, status: string): void {
        const state = {
            candidate: candidateLongEdge,
            provider,
            phase: status,
            timestamp: Date.now(),
        };
        console.log(`[GMNet probe state] after probe: candidate=${candidateLongEdge}, provider=${provider}, status=${status}`);
        this._write(state);
    }

    detectCrash(): Record<string, unknown> | null {
        const state = this._read();
        if (!state || typeof state !== 'object') {
            return null;
        }
        if (state.phase === 'running') {
            return state;
        }
        return null;
    }

    clearState(): void {
        try {
            if (this.storage && typeof this.storage.removeItem === 'function') {
                this.storage.removeItem(PROBE_STATE_STORAGE_KEY);
            }
        } catch (_error) {
            // Best-effort removal.
        }
    }

    _write(state: Record<string, unknown>): void {
        try {
            if (this.storage && typeof this.storage.setItem === 'function') {
                this.storage.setItem(PROBE_STATE_STORAGE_KEY, JSON.stringify(state));
            }
        } catch (_error) {
            // Best-effort write.
        }
    }

    _read(): Record<string, unknown> | null {
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

export function isMobileDevice(runtime: GmnetRuntime = globalThis): boolean {
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

export async function binarySearchMaxCapability(
    low: number,
    high: number,
    evaluate: (candidate: number) => Promise<boolean>,
): Promise<number | null> {
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


function supportsWasmThreading(runtime: GmnetRuntime = globalThis): boolean {
    const hasIsolatedContext = runtime?.crossOriginIsolated === true;
    const hasSharedArrayBuffer = typeof runtime?.SharedArrayBuffer !== 'undefined';
    return hasIsolatedContext && hasSharedArrayBuffer;
}

function resolveHardwareConcurrency(runtime: GmnetRuntime = globalThis): number {
    const hardwareConcurrency = Number(runtime?.navigator?.hardwareConcurrency);
    if (!Number.isFinite(hardwareConcurrency) || hardwareConcurrency < 1) {
        return 1;
    }
    return Math.floor(hardwareConcurrency);
}

function resolveWasmThreadCount(runtime: GmnetRuntime = globalThis): number {
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

function configureOrtRuntime(ortModule: unknown, runtime: GmnetRuntime = globalThis): void {
    if (!ortModule || typeof ortModule !== 'object') {
        return;
    }
    const moduleRef = ortModule as {
        env?: {
            wasm?: Env.WebAssemblyFlags;
            webgpu?: {
                powerPreference?: string;
            };
        };
    };
    if (configuredOrtModules.has(moduleRef as object)) {
        return;
    }

    if (!moduleRef.env || typeof moduleRef.env !== 'object') {
        return;
    }

    if (!moduleRef.env.wasm || typeof moduleRef.env.wasm !== 'object') {
        moduleRef.env.wasm = {};
    }

    moduleRef.env.wasm.numThreads = resolveWasmThreadCount(runtime);
    moduleRef.env.wasm.simd = !isWebKitRuntime(runtime);
    moduleRef.env.wasm.wasmPaths = resolveOrtAssetBasePath();
    // Disable proxy to prevent ONNX from trying to spawn another worker or check for document.
    moduleRef.env.wasm.proxy = false;

    if (!moduleRef.env.webgpu || typeof moduleRef.env.webgpu !== 'object') {
        moduleRef.env.webgpu = {};
    }
    // Prefer the high-performance adapter for GMNet inference when WebGPU is available.
    // Skip this hint on Windows where Chromium currently ignores it and emits noisy warnings.
    if (!isWindowsRuntime(runtime)) {
        moduleRef.env.webgpu.powerPreference = 'high-performance';
    }

    configuredOrtModules.add(moduleRef as object);
}

async function loadOrtWebGlModule(runtime: GmnetRuntime = globalThis): Promise<OrtModuleLike> {
    if (!ortWebGlModulePromise) {
        const testSpecifier = ['onnxruntime-web', 'webgl'].join('/');
        ortWebGlModulePromise = import.meta.env?.VITEST
            ? import(testSpecifier)
            : import(/* @vite-ignore */ resolveWebglRuntimeModuleUrl());
    }
    const ortWebGlModule = await ortWebGlModulePromise as OrtModuleLike;
    configureOrtRuntime(ortWebGlModule, runtime);
    return ortWebGlModule as OrtModuleLike;
}

async function loadOrtWasmModule(runtime: GmnetRuntime = globalThis): Promise<OrtModuleLike> {
    if (!ortWasmModulePromise) {
        ortWasmModulePromise = import('onnxruntime-web/wasm');
    }
    const ortWasmModule = await ortWasmModulePromise as OrtModuleLike;
    configureOrtRuntime(ortWasmModule, runtime);
    return ortWasmModule as OrtModuleLike;
}

async function resolveOrtModuleForProvider(provider: string, runtime: GmnetRuntime = globalThis): Promise<OrtModuleLike> {
    if (provider === GMNET_FALLBACK_EXECUTION_PROVIDER) {
        return loadOrtWebGlModule(runtime);
    }
    if (provider === GMNET_WASM_EXECUTION_PROVIDER) {
        return loadOrtWasmModule(runtime);
    }
    configureOrtRuntime(ortWebGpu, runtime);
    return ortWebGpu;
}

export async function preloadGmnetRuntimeDependencies({
    runtime = globalThis,
    provider = REQUIRED_GMNET_EXECUTION_PROVIDER,
}: {
    runtime?: GmnetRuntime;
    provider?: string;
} = {}): Promise<{ provider: string }> {
    const normalizedProvider = normalizeExecutionProvider(provider);
    if (!normalizedProvider || !SUPPORTED_GMNET_EXECUTION_PROVIDERS.includes(normalizedProvider)) {
        throw new Error(`Unsupported GMNet execution provider: ${String(provider)}`);
    }
    await resolveOrtModuleForProvider(normalizedProvider, runtime);
    return { provider: normalizedProvider };
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

function normalizeModelVariant(variant: unknown): GmnetModelVariant {
    return SUPPORTED_MODEL_VARIANTS.includes(variant as GmnetModelVariant)
        ? (variant as GmnetModelVariant)
        : DEFAULT_GMNET_MODEL_VARIANT;
}

const MODEL_BASE_PATH = `${resolveModelBasePath()}models/`;
const GMNET_MEMORY_CONSERVATIVE_SESSION_OPTIONS = Object.freeze({
    enableMemPattern: false,
    enableCpuMemArena: false,
    executionMode: 'sequential',
});

export function hasWebGpuSupport(runtime: GmnetRuntime = globalThis): boolean {
    return typeof runtime?.navigator?.gpu !== 'undefined';
}

function resolveExecutionProviders(runtime: GmnetRuntime = globalThis): string[] {
    if (hasWebGpuSupport(runtime)) {
        return [REQUIRED_GMNET_EXECUTION_PROVIDER];
    }
    if (isGmnetWebGlSupportedRuntime(runtime)) {
        return [GMNET_FALLBACK_EXECUTION_PROVIDER];
    }
    return [];
}

function nowMs(runtime: GmnetRuntime = globalThis): number {
    const performanceNow = runtime?.performance?.now;
    if (typeof performanceNow === 'function') {
        return Math.floor(performanceNow.call(runtime?.performance));
    }
    return Date.now();
}

function buildAssetDiagnostics({
    assetLabel,
    assetUrl,
    startedAtMs,
    endedAtMs,
    fetchStatus,
    byteLength,
    contentType,
    attemptIndex,
}: {
    assetLabel: unknown;
    assetUrl: unknown;
    startedAtMs: unknown;
    endedAtMs: unknown;
    fetchStatus?: unknown;
    byteLength?: unknown;
    contentType?: unknown;
    attemptIndex: unknown;
}): GmnetAssetDiagnostics {
    const startedMs = Number.isFinite(Number(startedAtMs)) ? Math.floor(Number(startedAtMs)) : null;
    const endedMs = Number.isFinite(Number(endedAtMs)) ? Math.floor(Number(endedAtMs)) : null;
    const status = Number.isFinite(Number(fetchStatus)) ? Math.floor(Number(fetchStatus)) : null;
    return {
        assetLabel: typeof assetLabel === 'string' ? assetLabel : 'unknown',
        assetUrl: typeof assetUrl === 'string' ? assetUrl : null,
        startedAtMs: startedMs,
        endedAtMs: endedMs,
        durationMs: startedMs !== null && endedMs !== null
            ? Math.max(0, endedMs - startedMs)
            : null,
        status,
        byteLength: Number.isFinite(Number(byteLength)) ? Math.floor(Number(byteLength)) : null,
        contentType: typeof contentType === 'string' ? contentType : null,
        attemptIndex: Number.isFinite(Number(attemptIndex)) ? Math.floor(Number(attemptIndex)) : null,
    };
}

function attachAssetDiagnostics(error: GmnetError | null = null, diagnostics: Record<string, unknown> = {}): GmnetError | null {
    if (!error || typeof error !== 'object') {
        return error;
    }
    if (!error.diagnostics || typeof error.diagnostics !== 'object') {
        error.diagnostics = {};
    }
    error.diagnostics = {
        ...error.diagnostics,
        ...diagnostics,
    };
    return error;
}

function normalizeExecutionProvider(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }
    const normalized = value.trim().toLowerCase();
    return normalized || null;
}

async function loadBinaryAsset(
    runtime: GmnetRuntime,
    assetUrl: string,
    assetLabel: string,
    attemptIndex: number | null = null,
): Promise<GmnetAssetPayload> {
    const fetchFn = runtime?.fetch || globalThis.fetch;
    const startedAtMs = nowMs(runtime);
    if (typeof fetchFn !== 'function') {
        const error = new Error(`Fetch API is unavailable for ${assetLabel} loading.`);
        error.name = 'GmnetModelAssetFetchUnavailableError';
        attachAssetDiagnostics(error, {
            ...buildAssetDiagnostics({
                assetLabel,
                assetUrl,
                startedAtMs,
                attemptIndex,
                endedAtMs: nowMs(runtime),
            }),
            errorContext: 'asset_fetch_unavailable',
            errorMessage: `Fetch API is unavailable for ${assetLabel} loading.`,
        });
        throw error;
    }

    let response;
    try {
        response = await fetchFn.call(runtime, assetUrl, { credentials: 'same-origin' });
    } catch (cause) {
        const endedAtMs = nowMs(runtime);
        const error = new Error(((cause as { message?: string })?.message) || `Failed to load ${assetLabel}.`);
        error.name = 'GmnetModelAssetFetchFailedError';
        error.cause = cause;
        attachAssetDiagnostics(error, {
            ...buildAssetDiagnostics({
                assetLabel,
                assetUrl,
                startedAtMs,
                endedAtMs,
                attemptIndex,
            }),
            errorContext: 'asset_fetch_failed',
            errorMessage: ((cause as { message?: string })?.message) || `Failed to load ${assetLabel}.`,
        });
        throw error;
    }

    if (!response?.ok) {
        const endedAtMs = nowMs(runtime);
        const error = new Error(
            `Failed to load ${assetLabel}: ${response?.status || 'unknown status'}.`
        );
        error.name = 'GmnetModelAssetHttpError';
        attachAssetDiagnostics(error, {
            ...buildAssetDiagnostics({
                assetLabel,
                assetUrl,
                startedAtMs,
                endedAtMs,
                attemptIndex,
                fetchStatus: response.status,
                contentType: response?.headers?.get?.('content-type'),
            }),
            errorContext: 'asset_http_error',
            errorMessage: `Failed to load ${assetLabel}: ${response?.status || 'unknown status'}.`,
        });
        throw error;
    }

    if (typeof response.arrayBuffer !== 'function') {
        const endedAtMs = nowMs(runtime);
        const error = new Error(`${assetLabel} response does not support arrayBuffer().`);
        error.name = 'GmnetModelAssetResponseUnsupportedError';
        attachAssetDiagnostics(error, {
            ...buildAssetDiagnostics({
                assetLabel,
                assetUrl,
                startedAtMs,
                endedAtMs,
                attemptIndex,
                fetchStatus: response.status,
                contentType: response?.headers?.get?.('content-type'),
            }),
            errorContext: 'asset_array_buffer_unavailable',
            errorMessage: `${assetLabel} response does not support arrayBuffer().`,
        });
        throw error;
    }

    let buffer;
    try {
        buffer = await response.arrayBuffer();
    } catch (cause) {
        const endedAtMs = nowMs(runtime);
        const error = new Error(((cause as { message?: string })?.message) || `Failed to read ${assetLabel} payload.`);
        error.name = 'GmnetModelAssetReadFailedError';
        error.cause = cause;
        attachAssetDiagnostics(error, {
            ...buildAssetDiagnostics({
                assetLabel,
                assetUrl,
                startedAtMs,
                endedAtMs,
                attemptIndex,
                fetchStatus: response.status,
                contentType: response?.headers?.get?.('content-type'),
            }),
            errorContext: 'asset_array_buffer_failed',
            errorMessage: ((cause as { message?: string })?.message) || `Failed to read ${assetLabel} payload.`,
        });
        throw error;
    }
    if (!(buffer instanceof ArrayBuffer) || buffer.byteLength === 0) {
        const endedAtMs = nowMs(runtime);
        const error = new Error(`${assetLabel} response was empty.`);
        error.name = 'GmnetModelAssetEmptyResponseError';
        attachAssetDiagnostics(error, {
            ...buildAssetDiagnostics({
                assetLabel,
                assetUrl,
                startedAtMs,
                endedAtMs,
                attemptIndex,
                fetchStatus: response.status,
                contentType: response?.headers?.get?.('content-type'),
                byteLength: Number.isFinite(Number(buffer?.byteLength)) ? buffer.byteLength : 0,
            }),
            errorContext: 'asset_empty_payload',
            errorMessage: `${assetLabel} response was empty.`,
        });
        throw error;
    }

    const endedAtMs = nowMs(runtime);
    return {
        payload: new Uint8Array(buffer),
        diagnostics: buildAssetDiagnostics({
            assetLabel,
            assetUrl,
            startedAtMs,
            endedAtMs,
            attemptIndex,
            fetchStatus: response.status,
            contentType: response?.headers?.get?.('content-type'),
            byteLength: buffer.byteLength,
        }),
    };
}

async function resolveModelAndExternalDataPayloads(
    runtime: GmnetRuntime,
    provider: string,
    modelUrl: string,
    externalDataUrl: string,
    attemptIndex: number | null = null,
): Promise<GmnetModelPayloads> {
    const modelLoadDiagnostics: GmnetAssetDiagnostics[] = [];
    if (provider === GMNET_FALLBACK_EXECUTION_PROVIDER) {
        const modelAsset = await loadBinaryAsset(
            runtime,
            modelUrl,
            'GMNet ONNX model',
            attemptIndex,
        );
        modelLoadDiagnostics.push(modelAsset.diagnostics);
        return {
            modelPayload: modelAsset.payload,
            externalDataPayload: null,
            modelLoadDiagnostics,
            includeExternalData: false,
        };
    }

    if (provider === GMNET_WASM_EXECUTION_PROVIDER) {
        const modelAsset = await loadBinaryAsset(
            runtime,
            modelUrl,
            'GMNet ONNX model',
            attemptIndex,
        );
        const externalDataAsset = await loadBinaryAsset(
            runtime,
            externalDataUrl,
            'GMNet ONNX model external data',
            attemptIndex,
        );
        modelLoadDiagnostics.push(modelAsset.diagnostics);
        modelLoadDiagnostics.push(externalDataAsset.diagnostics);
        return {
            modelPayload: modelAsset.payload,
            externalDataPayload: externalDataAsset.payload,
            modelLoadDiagnostics,
            includeExternalData: true,
        };
    }

    const externalDataAsset = await loadBinaryAsset(
        runtime,
        externalDataUrl,
        'GMNet ONNX model external data',
        attemptIndex,
    );
    modelLoadDiagnostics.push(externalDataAsset.diagnostics);

    const modelAsset = await loadBinaryAsset(
        runtime,
        modelUrl,
        'GMNet ONNX model',
        attemptIndex,
    );
    modelLoadDiagnostics.push(modelAsset.diagnostics);

    return {
        modelPayload: modelAsset.payload,
        externalDataPayload: externalDataAsset.payload,
        modelLoadDiagnostics,
        includeExternalData: true,
    };
}

function resolveActiveExecutionProvider(session: GmnetSessionLike | null | undefined, requestedExecutionProviders: string[] = []): string {
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

function safeDisposeTensor(tensor: TensorLike | null | undefined): void {
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

type OrtSessionOptions = {
    executionProviders: string[];
    enableMemPattern: boolean;
    enableCpuMemArena: boolean;
    executionMode: 'sequential';
    externalData?: Array<{ path: string; data: Uint8Array | ArrayBuffer }>;
};

function createOrtSessionOptions(
    requestedExecutionProviders: string[],
    externalDataOptions: { path: string; data: Uint8Array | ArrayBuffer } | null = null,
): OrtSessionOptions {
    const sessionOptions: OrtSessionOptions = {
        executionProviders: requestedExecutionProviders,
        ...GMNET_MEMORY_CONSERVATIVE_SESSION_OPTIONS,
    };
    if (externalDataOptions) {
        sessionOptions.externalData = [externalDataOptions];
    }
    return sessionOptions;
}

function normalizeExternalDataPayload(payload: unknown): Uint8Array | ArrayBuffer | undefined {
    if (payload instanceof Uint8Array || payload instanceof ArrayBuffer) {
        return payload;
    }
    return undefined;
}

function normalizeModelPayload(payload: ArrayBuffer | Uint8Array): Uint8Array {
    return payload instanceof Uint8Array ? payload : new Uint8Array(payload);
}

function logExecutionProviderSelection(provider: string | null | undefined, modelVariant: string, requestedExecutionProviders: string[] = []): void {
    const normalizedProvider = typeof provider === 'string' && provider ? provider : 'unknown';
    const requestedProviders = Array.isArray(requestedExecutionProviders) && requestedExecutionProviders.length > 0
        ? requestedExecutionProviders.join(', ')
        : 'none';
    console.info(
        `[GMNet] Execution provider: ${normalizedProvider} (variant: ${modelVariant}, requested: ${requestedProviders})`
    );
}

function createSessionCacheKey(modelVariant: unknown, provider: unknown): string {
    const normalizedVariant = normalizeModelVariant(modelVariant);
    const normalizedProvider = normalizeExecutionProvider(provider) || 'unknown';
    return `${normalizedVariant}:${normalizedProvider}`;
}

function normalizeLongEdgeLimit(value: unknown, fallback: number): number {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 1) {
        return fallback;
    }
    return Math.floor(numeric);
}

function resolveScaledDimensionsForLongEdge(width: number, height: number, maxLongEdge: number): { width: number; height: number; changed: boolean } {
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

function analyzeRgbaOutputStats(rgba: ArrayLike<number> | null | undefined): {
    pixelCount: number;
    min: number;
    max: number;
    mean: number;
    stdDev: number;
    dynamicRange: number;
} {
    const source = rgba ?? [];
    const pixelCount = Math.floor((source.length || 0) / 4);
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
        const value = source[index * 4] ?? 0;
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

function isProbeOutputNearFlat(stats: { dynamicRange?: number; stdDev?: number } | null | undefined): boolean {
    if (!stats || typeof stats !== 'object') {
        return true;
    }
    if (
        !Number.isFinite(stats.dynamicRange)
        || !Number.isFinite(stats.stdDev)
    ) {
        return true;
    }
    return (stats.dynamicRange ?? 0) < PROBE_MIN_DYNAMIC_RANGE || (stats.stdDev ?? 0) < PROBE_MIN_STD_DEV;
}

function createCapabilityProbeError(message: string, diagnostics: Record<string, unknown> = {}, cause: unknown = null): GmnetError {
    const error = new Error(message || 'Failed to resolve GMNet gain-map capability.') as GmnetError;
    error.name = 'GmnetCapabilityProbeError';
    error.diagnostics = diagnostics;
    if (cause) {
        error.cause = cause;
    }
    return error;
}

function yieldToEventLoop(): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, 0);
    });
}

function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage = 'Operation timed out'): Promise<T> {
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

function resizeImageData(imageData: ImageData, targetWidth: number, targetHeight: number): ImageData {
    return resizeRasterImageSync(imageData, targetWidth, targetHeight);
}

function resizeRgbaBuffer(rgba: Uint8ClampedArray, width: number, height: number, targetWidth: number, targetHeight: number): Uint8ClampedArray {
    const sourceImageData = new ImageData(new Uint8ClampedArray(rgba), width, height);
    const resized = resizeImageData(sourceImageData, targetWidth, targetHeight);
    return resized.data;
}

function resolveOutputDimensions(tensor: TensorLike | null | undefined, fallbackWidth: number, fallbackHeight: number): { width: number; height: number } {
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

function clampNumber(value: unknown, minValue: number, maxValue: number): number {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return minValue;
    }
    return Math.max(minValue, Math.min(maxValue, Math.floor(numeric)));
}

function reflectCoordinate(index: unknown, length: number): number {
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

function buildTileStarts(length: number, coreTileSize: number): number[] {
    const normalizedLength = Math.max(1, Math.floor(Number(length) || 1));
    const normalizedCore = Math.max(1, Math.floor(Number(coreTileSize) || 1));
    const starts: number[] = [];
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

function buildFeatherWeights(length: number, overlap: number, atStartEdge: boolean, atEndEdge: boolean): Float32Array {
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

export class GMNetInferenceSession {
    runtime: GmnetRuntime;
    session: GmnetSessionLike | null;
    globalSession: GmnetSessionLike | null;
    localSession: GmnetSessionLike | null;
    sessionsByVariantAndProvider: Map<string, { globalSession: GmnetSessionLike; localSession: GmnetSessionLike }>;
    executionProviderByVariantAndProvider: Map<string, string | null>;
    activeModelVariant: GmnetModelVariant;
    activeExecutionProvider: string | null;
    activeOrtModule: OrtModuleLike;
    downloadProgress: number;
    eventListeners: {
        progress: GmnetEventCallback<'progress'>[];
        runtime: GmnetEventCallback<'runtime'>[];
        complete: GmnetEventCallback<'complete'>[];
        error: GmnetEventCallback<'error'>[];
        'capability-probe': GmnetEventCallback<'capability-probe'>[];
        'tile-step': GmnetEventCallback<'tile-step'>[];
    };

    constructor({ runtime = globalThis }: { runtime?: GmnetRuntime } = {}) {
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
        this.eventListeners = {
            progress: [],
            runtime: [],
            complete: [],
            error: [],
            'capability-probe': [],
            'tile-step': [],
        };
    }

    private getEventListeners<E extends GmnetEventName>(event: E): GmnetEventCallback<E>[] {
        switch (event) {
            case 'progress':
                return this.eventListeners.progress as GmnetEventCallback<E>[];
            case 'runtime':
                return this.eventListeners.runtime as GmnetEventCallback<E>[];
            case 'complete':
                return this.eventListeners.complete as GmnetEventCallback<E>[];
            case 'error':
                return this.eventListeners.error as GmnetEventCallback<E>[];
            case 'capability-probe':
                return this.eventListeners['capability-probe'] as GmnetEventCallback<E>[];
            case 'tile-step':
                return this.eventListeners['tile-step'] as GmnetEventCallback<E>[];
            default:
                return [];
        }
    }

    on<E extends GmnetEventName>(event: E, callback: GmnetEventCallback<E>): void {
        if (typeof event !== 'string' || event.length === 0 || typeof callback !== 'function') return;
        this.getEventListeners(event).push(callback);
    }

    off<E extends GmnetEventName>(event: E, callback: GmnetEventCallback<E>): void {
        if (typeof event !== 'string' || event.length === 0 || typeof callback !== 'function') return;
        const listeners = this.getEventListeners(event);
        const index = listeners.findIndex((listener) => listener === callback);
        if (index >= 0) {
            listeners.splice(index, 1);
        }
    }

    emit<E extends GmnetEventName>(event: E, data: GmnetEventPayloadMap[E]): void {
        if (typeof event !== 'string' || event.length === 0) return;
        const listeners = [...this.getEventListeners(event)];
        listeners.forEach((callback) => callback(data));
    }

    async init(modelVariant: GmnetModelVariant = DEFAULT_GMNET_MODEL_VARIANT, options: {
        attemptIndex?: number | null;
        forceExecutionProviders?: string[];
        forceReload?: boolean;
    } = {}): Promise<void> {
        const normalizedVariant = normalizeModelVariant(modelVariant);
        const attemptIndex = Number.isFinite(Number(options?.attemptIndex))
            ? Math.floor(Number(options.attemptIndex))
            : null;
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

        if (requestedProvider === GMNET_FALLBACK_EXECUTION_PROVIDER && !isGmnetWebGlSupportedRuntime(this.runtime)) {
            const reason = isChromiumRuntime(this.runtime)
                ? 'WebGL runtime is disabled on Chromium for GMNet.'
                : 'WebGL runtime is not available in this environment.';
            const unavailableError = new Error(reason);
            unavailableError.name = 'GmnetWebGlUnavailableError';
            throw unavailableError;
        }

        // WASM is universally available — no runtime check needed.

        const ortModule = await resolveOrtModuleForProvider(requestedProvider, this.runtime);
        const sessionCacheKey = createSessionCacheKey(normalizedVariant, requestedProvider);
        const forceReload = Boolean(options.forceReload);
        if (!forceReload && this.sessionsByVariantAndProvider.has(sessionCacheKey)) {
            const cachedSessions = this.sessionsByVariantAndProvider.get(sessionCacheKey) || { globalSession: null, localSession: null };
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
                (cachedProviderError as GmnetError).requestedExecutionProviders = requestedExecutionProviders;
                (cachedProviderError as GmnetError).resolvedExecutionProvider = this.activeExecutionProvider || null;
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
                (providerError as GmnetError).requestedExecutionProviders = requestedExecutionProviders;
                (providerError as GmnetError).resolvedExecutionProvider = this.activeExecutionProvider || null;
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
        const modelLoadDiagnostics = [];
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
                attemptIndex,
            );
            const localPayloads = await resolveModelAndExternalDataPayloads(
                this.runtime,
                requestedProvider,
                localModelUrl,
                localExternalDataUrl,
                attemptIndex,
            );
            if (Array.isArray(globalPayloads.modelLoadDiagnostics)) {
                modelLoadDiagnostics.push(...globalPayloads.modelLoadDiagnostics);
            }
            if (Array.isArray(localPayloads.modelLoadDiagnostics)) {
                modelLoadDiagnostics.push(...localPayloads.modelLoadDiagnostics);
            }
            this.emit('progress', { loaded: 0, total: 2 });
            console.log(`[GMNet] Loading ${normalizedVariant} global model from ${globalModelUrl}...`);
            console.log(`[GMNet] Loading ${normalizedVariant} local model from ${localModelUrl}...`);

            const globalSessionOptions = createOrtSessionOptions(requestedExecutionProviders);
            const globalExternalDataPayload = normalizeExternalDataPayload(globalPayloads.externalDataPayload);
            if (globalExternalDataPayload) {
                globalSessionOptions.externalData = [{
                    path: variantConfig.globalDataFilename,
                    data: globalExternalDataPayload,
                }];
            }
            const localSessionOptions = createOrtSessionOptions(requestedExecutionProviders);
            const localExternalDataPayload = normalizeExternalDataPayload(localPayloads.externalDataPayload);
            if (localExternalDataPayload) {
                localSessionOptions.externalData = [{
                    path: variantConfig.localDataFilename,
                    data: localExternalDataPayload,
                }];
            }

            const createdGlobalSession = await ortModule.InferenceSession.create(
                normalizeModelPayload(globalPayloads.modelPayload),
                globalSessionOptions,
            );
            this.emit('progress', { loaded: 1, total: 2 });
            const createdLocalSession = await ortModule.InferenceSession.create(
                normalizeModelPayload(localPayloads.modelPayload),
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
                (providerMismatchError as GmnetError).requestedExecutionProviders = requestedExecutionProviders;
                (providerMismatchError as GmnetError).resolvedExecutionProvider = resolvedExecutionProvider || null;
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
            if (e && typeof e === 'object') {
                const gmnetError = e as GmnetError;
                const existingDiagnostics = gmnetError.diagnostics && typeof gmnetError.diagnostics === 'object'
                    ? gmnetError.diagnostics
                    : {};
                gmnetError.diagnostics = {
                    ...existingDiagnostics,
                    requestedExecutionProviders,
                    resolvedExecutionProvider: normalizeExecutionProvider(requestedProvider),
                    modelVariant: normalizedVariant,
                    modelLoadDiagnostics: modelLoadDiagnostics.map((diagnostic) => (
                        diagnostic && typeof diagnostic === 'object'
                            ? { ...diagnostic }
                            : diagnostic
                    )),
                };
            }
            this.emit('error', e);
            throw e;
        }
    }

    createProbeImageData(size: number, forceSquare = false): ImageData {
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

    hasSplitSessions(): boolean {
        return Boolean(this.globalSession && this.localSession);
    }

    resolveTileConfiguration(provider: string | null, sourceWidth: number, sourceHeight: number, options: {
        gmnetTileInputSize?: number;
        gmnetTileHaloPx?: number;
        localInputMaxLongEdge?: number;
    } = {}): GmnetTileConfig {
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

    createTilePlan(sourceWidth: number, sourceHeight: number, tileConfig: GmnetTileConfig): GmnetTile[] {
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

    createLocalTensorFromSourceTile(sourceImageData: ImageData, tile: GmnetTile): TensorLike {
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

    resolveQmaxScalar(tensor: TensorLike | null | undefined): number {
        const value = Number(tensor?.data?.[0]);
        if (!Number.isFinite(value) || value <= 0) {
            return 1;
        }
        return value;
    }

    async prepareTiledInference(imageData: ImageData, options: {
        gmnetModelVariant?: GmnetModelVariant;
        forceExecutionProviders?: string[];
        localInputMaxLongEdge?: number;
        gmnetTileInputSize?: number;
        gmnetTileHaloPx?: number;
    } = {}): Promise<GmnetTiledContext> {
        const requestedVariant = normalizeModelVariant(options?.gmnetModelVariant);
        const forceExecutionProviders = Array.isArray(options?.forceExecutionProviders)
            ? options.forceExecutionProviders
            : undefined;
            const normalizedForcedProviders = Array.isArray(forceExecutionProviders)
                ? forceExecutionProviders
                    .map((provider) => normalizeExecutionProvider(provider))
                    .filter((provider): provider is string => provider !== null && SUPPORTED_GMNET_EXECUTION_PROVIDERS.includes(provider as string))
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
            globalResults = await this.globalSession!.run({
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

    async runTileStep(context: GmnetTiledContext, tileIndex: number): Promise<GmnetTileMetadata> {
        if (!context || !Array.isArray(context.tiles)) {
            throw new Error('GMNet tile context is invalid.');
        }
        const tiles = context.tiles!;
        const normalizedTileIndex = Math.floor(Number(tileIndex));
        if (!Number.isFinite(normalizedTileIndex) || normalizedTileIndex < 0 || normalizedTileIndex >= tiles.length) {
            throw new Error(`GMNet tile index out of range: ${tileIndex}`);
        }
        if (context.tileCompleted?.[normalizedTileIndex] === 1) {
            const completedTile = tiles[normalizedTileIndex];
            return {
                tileIndex: normalizedTileIndex,
                tileTotal: tiles.length,
                gmnetTileIndex: normalizedTileIndex,
                gmnetTileTotal: tiles.length,
                gmnetTileX: completedTile.coreX,
                gmnetTileY: completedTile.coreY,
                gmnetTileWidth: completedTile.coreWidth,
                gmnetTileHeight: completedTile.coreHeight,
                gmnetTileHaloPx: completedTile.haloPx,
            };
        }

        const tile = tiles[normalizedTileIndex];
        const localTensor = this.createLocalTensorFromSourceTile(context.sourceImageData!, tile);
        let outputTensor = null;
        try {
            const localResults = await this.localSession!.run({
                local_input: localTensor,
                wker: context.global!.wker,
                wchn: context.global!.wchn,
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
                    context.accumIngm![targetIndex] += value * weight;
                }
            }
        } finally {
            safeDisposeTensor(localTensor);
            safeDisposeTensor(outputTensor);
        }

        context.tileCompleted![normalizedTileIndex] = 1;
        context.completedTileCount += 1;
        context.pendingTileCount = Math.max(0, tiles.length - context.completedTileCount);
        const metadata = {
            tileIndex: normalizedTileIndex,
            tileTotal: tiles.length,
            gmnetTileIndex: normalizedTileIndex,
            gmnetTileTotal: tiles.length,
            gmnetTileX: tile.coreX,
            gmnetTileY: tile.coreY,
            gmnetTileWidth: tile.coreWidth,
            gmnetTileHeight: tile.coreHeight,
            gmnetTileHaloPx: tile.haloPx,
        };
        this.emit('tile-step', metadata);
        return metadata;
    }

    destroyTiledContext(context: Partial<GmnetTiledContext> & { destroyed?: boolean } | null | undefined): void {
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

    finalizeTiledInference(context: GmnetTiledContext, options: { destroyContext?: boolean } = {}): Uint8ClampedArray {
        if (!context || !context.accumIngm || !Array.isArray(context.tiles)) {
            throw new Error('GMNet tile context is invalid.');
        }
        const shouldDestroyContext = options?.destroyContext !== false;
        try {
            const pixelCount = context.sourceWidth * context.sourceHeight;
            const output = new Uint8ClampedArray(pixelCount * 4);
            const weightAccumulator = new Float32Array(pixelCount);
            const sourceWidth = context.sourceWidth;
            for (const tile of context.tiles!) {
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
                    ? context.accumIngm![pixelIndex] / weight
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

    async runLegacyMonolithic(imageData: ImageData, options: {
        probeMode?: boolean;
        localInputMaxLongEdge?: number;
    } & Record<string, unknown> = {}): Promise<Uint8ClampedArray> {
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
        const results = await this.session!.run({
            local_input: localTensor,
            global_input: globalTensor
        });
        const outputTensor = results.gain_map!;
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

    async resolveGainMapCapability(options: {
        gmnetModelVariant?: GmnetModelVariant;
        forceExecutionProviders?: string[];
    } = {}): Promise<{
        provider: string;
        gainMapMaxLongEdge: number;
        outputMaxLongEdge: number;
        source: string;
        attempts: unknown[];
    }> {
        const requestedVariant = normalizeModelVariant(options?.gmnetModelVariant);
        const requestedProviders = Array.isArray(options?.forceExecutionProviders)
            ? options.forceExecutionProviders
            : undefined;
        const normalizedRequestedProviders = Array.isArray(requestedProviders)
            ? requestedProviders
                .map((provider) => normalizeExecutionProvider(provider))
                .filter((provider): provider is string => provider !== null && SUPPORTED_GMNET_EXECUTION_PROVIDERS.includes(provider as string))
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


    async run(imageData: ImageData, options: {
        gmnetModelVariant?: GmnetModelVariant;
        forceExecutionProviders?: string[];
    } = {}): Promise<Uint8ClampedArray> {
        console.log('[GMNet session] run called');
        const requestedVariant = normalizeModelVariant(options?.gmnetModelVariant);
        const forceExecutionProviders = Array.isArray(options?.forceExecutionProviders)
            ? options.forceExecutionProviders
            : undefined;
        const normalizedForcedProviders = Array.isArray(forceExecutionProviders)
            ? forceExecutionProviders
                .map((provider) => normalizeExecutionProvider(provider))
                .filter((provider): provider is string => provider !== null && SUPPORTED_GMNET_EXECUTION_PROVIDERS.includes(provider as string))
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
            for (let tileIndex = 0; tileIndex < context.tiles!.length; tileIndex += 1) {
                await this.runTileStep(context, tileIndex);
            }
            return this.finalizeTiledInference(context);
        } catch (error) {
            this.destroyTiledContext(context);
            throw error;
        }
    }

    preprocessLocal(imageData: ImageData, width: number, height: number): TensorLike {
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

    async preprocessGlobal(imageData: ImageData): Promise<TensorLike> {
        // Resize to 256x256
        const targetSize = 256;
        const resizedData = resizeImageData(imageData, targetSize, targetSize);
        return this.preprocessLocal(resizedData, targetSize, targetSize);
    }

    postprocess(tensor: TensorLike, width: number, height: number): Uint8ClampedArray {
        // Tensor is 1 x 1 x H x W (Float32)
        // Convert to Uint8Array [0, 255]
        // returned as single channel? 
        // generateGainMapData in processing.js usually returns RGBA data or just the gain map pixels.
        // I need to check processing.js to see what it returns.

        const data = tensor.data ?? new Float32Array(0);
        const length = data.length; // H * W
        const expectedLength = width * height;
        if (length !== expectedLength) {
            throw new Error(`GMNet output shape mismatch: expected ${expectedLength}, got ${length}`);
        }
        const output = new Uint8ClampedArray(length * 4);

        for (let i = 0; i < length; i++) {
            const val = Number(data[i] ?? 0);
            // Clip 0-1
            const clipped = Math.max(0, Math.min(1, val));
            const encoded = Math.floor(clipped * 255);
            const idx = i * 4;
            output[idx] = encoded;
            output[idx + 1] = encoded;
            output[idx + 2] = encoded;
            output[idx + 3] = 255;
        }

        return output;
    }
}
