import {
  GMNET_FALLBACK_EXECUTION_PROVIDER,
  GMNetInferenceSession,
  GMNET_WASM_EXECUTION_PROVIDER,
  REQUIRED_GMNET_EXECUTION_PROVIDER,
  type GmnetModelVariant,
  type GmnetTiledContext,
} from './gmnet-session.ts';
import { GMNetCheckpointStore } from './gmnet-checkpoint-store.js';
import { IMAGE_MAX_LONG_EDGE } from './constants.js';
import { DEFAULT_MAX_CONTENT_BOOST } from './max-content-boost.js';
import type { GainMapMetadata } from './gain-map-metadata.js';

type GmnetExecutionProvider = string | null;
type GainMapStats = {
  pixelCount: number;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  dynamicRange: number;
};
type GainMapCompareStats = {
  maxAbsDiff: number;
  meanAbsDiff: number;
  pixelCount: number;
};
type GmnetParityCacheEntry = true | { ok: false; stats: GainMapCompareStats };
type GmnetProgressCallback = (progress: number, note?: string, metadata?: Record<string, unknown>) => void;
type GmnetRuntime = typeof globalThis & {
  navigator?: Navigator;
  fetch?: typeof fetch;
  performance?: Performance;
  crossOriginIsolated?: boolean;
  SharedArrayBuffer?: typeof SharedArrayBuffer;
  ImageData?: typeof ImageData;
};
type GmnetGenerateOptions = {
  gmnetModelVariant?: GmnetModelVariant;
  gmnetCheckpointing?: 'off' | 'auto' | 'force';
  forceExecutionProviders?: string[];
  useGmnet?: boolean;
  gmnetCapabilityHint?: string | null;
  validationProbe?: boolean;
  onStageProgress?: GmnetProgressCallback;
  maxContentBoost?: number;
  imageData?: ImageData;
} & Record<string, unknown>;
type GmnetRunOptions = GmnetGenerateOptions & { imageData?: ImageData };
type GmnetCheckpointMetadataInput = {
  checkpointingEnabled: boolean;
  checkpointResumed: boolean;
  tileCompleted: Uint8Array | null | undefined;
  tileTotal: number;
  fallbackCompletedTileCount: number | null | undefined;
};
type GmnetSessionLike = {
  activeExecutionProvider?: string | null;
  on: GMNetInferenceSession['on'];
  off: GMNetInferenceSession['off'];
  prepareTiledInference?: GMNetInferenceSession['prepareTiledInference'];
  runTileStep?: GMNetInferenceSession['runTileStep'];
  finalizeTiledInference?: (context: GmnetTiledContext, options?: Record<string, unknown>) => Uint8ClampedArray;
  run: GMNetInferenceSession['run'];
};
type GmnetErrorWithDiagnostics = Error & { diagnostics?: Record<string, unknown> };
type GmnetCheckpointSnapshot = {
  accumIngm: Float32Array;
  tileCompleted: Uint8Array;
  sourceWidth: number;
  sourceHeight: number;
};
const INFERENCE_START_NOTE = 'Starting inference; application may appear hung while AI model executes.';
const WEBGL_FALLBACK_RETRY_NOTE = 'WebGPU produced an invalid gain map; retrying with WebGL.';
const WEBGL_FALLBACK_ERROR_RETRY_NOTE = 'WebGPU inference failed; retrying with WebGL.';
const WEBGL_PARITY_RETRY_NOTE = 'WebGL parity check failed; retrying with WASM.';
const WASM_FALLBACK_RETRY_NOTE = 'GPU fallback produced an invalid gain map; retrying with WASM.';
const WASM_FALLBACK_ERROR_RETRY_NOTE = 'GPU fallback failed; retrying with WASM.';
const MIN_GAIN_MAP_DYNAMIC_RANGE = 2;
const MIN_GAIN_MAP_STD_DEV = 0.25;
const WEBGL_PARITY_MAX_ABS_DIFF = 2;
const WEBGL_PARITY_MEAN_ABS_DIFF = 0.25;
const WEBGL_PARITY_PROBE_SIZE = 128;
const GMNET_CHECKPOINTING_OFF = 'off';
const GMNET_CHECKPOINTING_AUTO = 'auto';
const GMNET_CHECKPOINTING_FORCE = 'force';

function normalizeExecutionProviderName(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  return trimmed || null;
}

function formatExecutionProviderNote(provider: unknown): string {
  const normalizedProvider = normalizeExecutionProviderName(provider);
  if (!normalizedProvider) {
    return INFERENCE_START_NOTE;
  }
  return `${INFERENCE_START_NOTE} Runtime: ${normalizedProvider}.`;
}

function normalizeMaxContentBoost(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return DEFAULT_MAX_CONTENT_BOOST;
  }
  return Math.max(1.0, numeric);
}

function analyzeGainMapRgba(rgba: ArrayLike<number> | null | undefined): GainMapStats {
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
  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const value = source[pixelIndex * 4] ?? 0;
    min = Math.min(min, value);
    max = Math.max(max, value);
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

function createDeterministicParityProbeImageData(width = WEBGL_PARITY_PROBE_SIZE, height = WEBGL_PARITY_PROBE_SIZE): ImageData {
  const normalizedWidth = Math.max(32, Math.floor(Number(width) || WEBGL_PARITY_PROBE_SIZE));
  const normalizedHeight = Math.max(32, Math.floor(Number(height) || WEBGL_PARITY_PROBE_SIZE));
  const data = new Uint8ClampedArray(normalizedWidth * normalizedHeight * 4);
  for (let y = 0; y < normalizedHeight; y += 1) {
    for (let x = 0; x < normalizedWidth; x += 1) {
      const pixelIndex = (y * normalizedWidth + x) * 4;
      const horizontal = normalizedWidth > 1 ? Math.round((x / (normalizedWidth - 1)) * 255) : 127;
      const vertical = normalizedHeight > 1 ? Math.round((y / (normalizedHeight - 1)) * 255) : 127;
      const checker = (((x >> 4) + (y >> 4)) & 1) === 0 ? 24 : -24;
      const red = Math.max(0, Math.min(255, horizontal + checker));
      const green = Math.max(0, Math.min(255, vertical - checker));
      const blue = Math.max(0, Math.min(255, Math.round((horizontal + vertical) / 2)));
      data[pixelIndex] = red;
      data[pixelIndex + 1] = green;
      data[pixelIndex + 2] = blue;
      data[pixelIndex + 3] = 255;
    }
  }
  return new ImageData(data, normalizedWidth, normalizedHeight);
}

function compareGainMapRgba(leftRgba: ArrayLike<number> | null | undefined, rightRgba: ArrayLike<number> | null | undefined): GainMapCompareStats {
  const left = leftRgba ?? [];
  const right = rightRgba ?? [];
  const leftLength = left.length || 0;
  const rightLength = right.length || 0;
  if (leftLength !== rightLength || leftLength % 4 !== 0) {
    return {
      maxAbsDiff: Number.POSITIVE_INFINITY,
      meanAbsDiff: Number.POSITIVE_INFINITY,
      pixelCount: 0,
    };
  }

  const pixelCount = leftLength / 4;
  let maxAbsDiff = 0;
  let sumAbsDiff = 0;
  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const rgbaOffset = pixelIndex * 4;
    const absDiff = Math.abs((left[rgbaOffset] ?? 0) - (right[rgbaOffset] ?? 0));
    if (absDiff > maxAbsDiff) {
      maxAbsDiff = absDiff;
    }
    sumAbsDiff += absDiff;
  }

  return {
    maxAbsDiff,
    meanAbsDiff: pixelCount > 0 ? sumAbsDiff / pixelCount : 0,
    pixelCount,
  };
}

function isWithinWebglParityTolerance(stats: GainMapCompareStats): boolean {
  return stats.maxAbsDiff <= WEBGL_PARITY_MAX_ABS_DIFF
    && stats.meanAbsDiff <= WEBGL_PARITY_MEAN_ABS_DIFF;
}

function createWebglParityError(stats: GainMapCompareStats, provider: string = GMNET_FALLBACK_EXECUTION_PROVIDER): GmnetErrorWithDiagnostics {
  const error = new Error(
    `GMNet ${provider} parity check failed (max_abs_diff=${stats.maxAbsDiff}, mean_abs_diff=${stats.meanAbsDiff}).`,
  ) as GmnetErrorWithDiagnostics;
  error.name = 'GmnetWebGlParityError';
  error.diagnostics = {
    provider,
    ...stats,
    tolerance: {
      maxAbsDiff: WEBGL_PARITY_MAX_ABS_DIFF,
      meanAbsDiff: WEBGL_PARITY_MEAN_ABS_DIFF,
    },
  };
  return error;
}

function isNearFlatGainMap(stats: GainMapStats | null | undefined): boolean {
  if (!stats || typeof stats !== 'object') {
    return true;
  }
  // A single pixel has no meaningful variance; skip flatness checks for this edge case.
  if (Number.isFinite(stats.pixelCount) && stats.pixelCount <= 1) {
    return false;
  }
  return (
    !Number.isFinite(stats.dynamicRange)
    || !Number.isFinite(stats.stdDev)
    || stats.dynamicRange < MIN_GAIN_MAP_DYNAMIC_RANGE
    || stats.stdDev < MIN_GAIN_MAP_STD_DEV
  );
}

function resolveCurrentExecutionProvider(runtimeExecutionProvider: unknown, session: GmnetSessionLike | null | undefined): string | null {
  return (
    normalizeExecutionProviderName(runtimeExecutionProvider)
    || normalizeExecutionProviderName(session?.activeExecutionProvider)
    || null
  );
}

function normalizeCheckpointingMode(value: unknown): 'off' | 'auto' | 'force' {
  if (typeof value !== 'string') {
    return GMNET_CHECKPOINTING_OFF;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === GMNET_CHECKPOINTING_AUTO || normalized === GMNET_CHECKPOINTING_FORCE) {
    return normalized;
  }
  return GMNET_CHECKPOINTING_OFF;
}

function shouldUseCheckpointing(mode: 'off' | 'auto' | 'force'): boolean {
  return mode === GMNET_CHECKPOINTING_AUTO || mode === GMNET_CHECKPOINTING_FORCE;
}

function buildCheckpointKey({
  modelVariant,
  provider,
  width,
  height,
}: {
  modelVariant: unknown;
  provider: unknown;
  width: number;
  height: number;
}): string {
  const variant = typeof modelVariant === 'string' && modelVariant.trim().length > 0
    ? modelVariant.trim().toLowerCase()
    : 'realworld';
  const resolvedProvider = normalizeExecutionProviderName(provider) || 'auto';
  return `gmnet:v1:${variant}:${resolvedProvider}:${width}x${height}`;
}

function countCompletedTiles(tileCompleted: Uint8Array | null | undefined, tileTotal: number): number {
  if (!(tileCompleted instanceof Uint8Array)) {
    return 0;
  }
  const total = Math.max(0, Math.floor(Number(tileTotal) || tileCompleted.length));
  let completed = 0;
  for (let tileIndex = 0; tileIndex < total; tileIndex += 1) {
    if (tileCompleted[tileIndex]) {
      completed += 1;
    }
  }
  return completed;
}

function canRestoreCheckpointSnapshot(snapshot: unknown, context: GmnetTiledContext | GmnetCheckpointSnapshot | null | undefined, tileTotal: number): snapshot is GmnetCheckpointSnapshot {
  if (!snapshot || typeof snapshot !== 'object' || !context || typeof context !== 'object') {
    return false;
  }
  const snapshotRecord = snapshot as Partial<GmnetCheckpointSnapshot> & { [key: string]: unknown };
  const contextRecord = context as Partial<GmnetTiledContext> & { [key: string]: unknown };
  if (!(contextRecord.accumIngm instanceof Float32Array) || !(contextRecord.tileCompleted instanceof Uint8Array)) {
    return false;
  }
  if (!(snapshotRecord.accumIngm instanceof Float32Array) || !(snapshotRecord.tileCompleted instanceof Uint8Array)) {
    return false;
  }
  if (snapshotRecord.accumIngm.length !== contextRecord.accumIngm.length) {
    return false;
  }
  if (snapshotRecord.tileCompleted.length < tileTotal) {
    return false;
  }
  if (Number(snapshotRecord.sourceWidth) !== Number(contextRecord.sourceWidth)) {
    return false;
  }
  if (Number(snapshotRecord.sourceHeight) !== Number(contextRecord.sourceHeight)) {
    return false;
  }
  return true;
}

function buildCheckpointMetadata({
  checkpointingEnabled,
  checkpointResumed,
  tileCompleted,
  tileTotal,
  fallbackCompletedTileCount,
}: GmnetCheckpointMetadataInput): Record<string, unknown> {
  const checkpointTilesTotal = Math.max(0, Math.floor(Number(tileTotal) || 0));
  const derivedCompleted = countCompletedTiles(tileCompleted, checkpointTilesTotal);
  const normalizedFallbackCount = Math.max(0, Math.floor(Number(fallbackCompletedTileCount) || 0));
  const checkpointTilesCompleted = Math.min(
    checkpointTilesTotal,
    Math.max(derivedCompleted, normalizedFallbackCount),
  );
  return checkpointingEnabled
    ? {
      gmnetMemoryMode: 'checkpointed',
      gmnetCheckpointTilesCompleted: checkpointTilesCompleted,
      gmnetCheckpointTilesTotal: checkpointTilesTotal,
      gmnetCheckpointResumed: checkpointResumed,
    }
    : {
      gmnetMemoryMode: 'in-memory',
    };
}

export function isGmnetRuntimeSupported(runtime: GmnetRuntime = globalThis): boolean {
  return (
    typeof runtime?.fetch === 'function' &&
    typeof runtime?.ImageData !== 'undefined'
  );
}

export class GmnetGainMapGenerator {
  sessionFactory: () => GmnetSessionLike;
  checkpointStoreFactory: ({ runtime }: { runtime: GmnetRuntime }) => GMNetCheckpointStore;
  buildMetadata: (maxContentBoost?: number) => GainMapMetadata;
  runtime: GmnetRuntime;
  isSupported: (runtime?: GmnetRuntime) => boolean;
  session: GmnetSessionLike | null;
  checkpointStore: GMNetCheckpointStore | null;
  webglParityCache: Map<string, GmnetParityCacheEntry>;

  constructor({
    sessionFactory = () => new GMNetInferenceSession(),
    checkpointStoreFactory = ({ runtime }: { runtime: GmnetRuntime }) => new GMNetCheckpointStore({ runtime }),
    buildMetadata,
    runtime = globalThis,
    isSupported = isGmnetRuntimeSupported,
  }: {
    sessionFactory?: () => GmnetSessionLike;
    checkpointStoreFactory?: ({ runtime }: { runtime: GmnetRuntime }) => GMNetCheckpointStore;
    buildMetadata: (maxContentBoost?: number) => GainMapMetadata;
    runtime?: GmnetRuntime;
    isSupported?: (runtime?: GmnetRuntime) => boolean;
  }) {
    if (typeof sessionFactory !== 'function') {
      throw new Error('GmnetGainMapGenerator requires a sessionFactory function.');
    }
    if (typeof buildMetadata !== 'function') {
      throw new Error('GmnetGainMapGenerator requires a buildMetadata function.');
    }
    if (typeof checkpointStoreFactory !== 'function') {
      throw new Error('GmnetGainMapGenerator requires a checkpointStoreFactory function.');
    }
    if (typeof isSupported !== 'function') {
      throw new Error('GmnetGainMapGenerator requires an isSupported function.');
    }

    this.sessionFactory = sessionFactory;
    this.checkpointStoreFactory = checkpointStoreFactory;
    this.buildMetadata = buildMetadata;
    this.runtime = runtime;
    this.isSupported = isSupported;
    this.session = null;
    this.checkpointStore = null;
    this.webglParityCache = new Map();
  }

  getSession(): GmnetSessionLike {
    if (!this.session) {
      this.session = this.sessionFactory();
    }
    return this.session;
  }

  getCheckpointStore(): GMNetCheckpointStore {
    if (!this.checkpointStore) {
      this.checkpointStore = this.checkpointStoreFactory({ runtime: this.runtime });
    }
    return this.checkpointStore;
  }

  async resolveCapability(options: GmnetGenerateOptions = {}): Promise<{
    provider: string;
    gainMapMaxLongEdge: number;
    outputMaxLongEdge: number;
    source: string;
    attempts: unknown[];
  }> {
    const session = this.getSession();
    const normalizedForcedProviders = Array.isArray(options?.forceExecutionProviders)
      ? options.forceExecutionProviders
        .map((provider) => normalizeExecutionProviderName(provider))
        .filter((provider): provider is string => Boolean(provider))
      : [];
    const requestedProvider = normalizedForcedProviders.length === 1
      ? normalizedForcedProviders[0]
      : null;
    const provider = requestedProvider
      || normalizeExecutionProviderName(session?.activeExecutionProvider)
      || REQUIRED_GMNET_EXECUTION_PROVIDER;
    return {
      provider,
      gainMapMaxLongEdge: IMAGE_MAX_LONG_EDGE,
      outputMaxLongEdge: IMAGE_MAX_LONG_EDGE,
      source: provider === GMNET_WASM_EXECUTION_PROVIDER ? 'wasm-unlimited' : 'smoke-validated',
      attempts: [],
    };
  }

  /**
   * Generate gain-map pixels from SDR input with split-layer tiled GMNet inference.
   * @param {ImageData} imageData
   * @param {Object} [options]
   * @param {"realworld" | "synthetic"} [options.gmnetModelVariant]
   * @param {"off" | "auto" | "force"} [options.gmnetCheckpointing]
   * @param {string[]} [options.forceExecutionProviders]
   * @param {(progress: number, note?: string, metadata?: Object) => void} [options.onStageProgress]
   * @returns {Promise<{gainMapImageData: ImageData, metadata: Object}>}
   */
  async generate(imageData: ImageData, options: GmnetGenerateOptions = {}): Promise<{
    gainMapImageData: ImageData;
    metadata: GainMapMetadata;
  }> {
    if (options?.useGmnet === false) {
      throw new Error('GMNet is required; heuristic gain map generation has been removed.');
    }

    if (!this.isSupported(this.runtime)) {
      throw new Error('GMNet runtime is not supported in this environment.');
    }

    const session = this.getSession();
    const normalizedForcedProviders = Array.isArray(options?.forceExecutionProviders)
      ? options.forceExecutionProviders
        .map((provider) => normalizeExecutionProviderName(provider))
        .filter((provider): provider is string => Boolean(provider))
      : [];
    const requestedProvider = normalizedForcedProviders.length === 1
      ? normalizedForcedProviders[0]
      : null;
    const hasExplicitBackendSelection = Boolean(requestedProvider);
    const onStageProgress =
      typeof options.onStageProgress === 'function' ? options.onStageProgress : null;
    const capability = await this.resolveCapability({
      gmnetModelVariant: options.gmnetModelVariant,
      forceExecutionProviders: hasExplicitBackendSelection && requestedProvider
        ? [requestedProvider]
        : options.forceExecutionProviders,
      capabilityHint: options.gmnetCapabilityHint,
    });

    let progressHandler = null;
    let runtimeHandler = null;
    let runtimeExecutionProvider: string | null = null;
    if (onStageProgress) {
      progressHandler = (event: { loaded?: number; total?: number }) => {
        const total = Number(event.total ?? 0);
        const loaded = Number(event.loaded ?? 0);
        if (total > 0) {
          onStageProgress((loaded / total) * 100, 'Downloading AI Model...');
        } else {
          onStageProgress(0, 'Initializing AI...');
        }
      };
      session.on('progress', progressHandler);

      runtimeHandler = (event: { executionProvider?: string | null }) => {
        runtimeExecutionProvider = normalizeExecutionProviderName(event?.executionProvider);
        onStageProgress(
          1,
          formatExecutionProviderNote(runtimeExecutionProvider),
          {
            gmnetExecutionProvider: runtimeExecutionProvider,
          },
        );
      };
      session.on('runtime', runtimeHandler);
    }

    try {
      const executeInference = async (runOptions: GmnetRunOptions = {}) => {
        const sourceImageData = runOptions.imageData instanceof ImageData
          ? runOptions.imageData
          : imageData;
        const forceExecutionProviders = Array.isArray(runOptions.forceExecutionProviders)
          ? runOptions.forceExecutionProviders
          : [];
        const forcedProvider = forceExecutionProviders.length === 1
          ? normalizeExecutionProviderName(forceExecutionProviders[0])
          : null;
        const sessionRunOptions = {
          gmnetModelVariant: options.gmnetModelVariant,
          ...runOptions,
        };
        const supportsTileStepApi = typeof session.prepareTiledInference === 'function'
          && typeof session.runTileStep === 'function'
          && typeof session.finalizeTiledInference === 'function';
        let gainMapRgba: Uint8ClampedArray;
        if (supportsTileStepApi) {
          const prepareTiledInference = session.prepareTiledInference!;
          const runTileStep = session.runTileStep!;
          const finalizeTiledInference = session.finalizeTiledInference!;
          const tiledContext = await prepareTiledInference(sourceImageData, {
            ...sessionRunOptions,
          }) as GmnetTiledContext;
          const tileTotal = Math.max(0, Number(tiledContext?.tiles?.length) || 0);
          const checkpointingMode = normalizeCheckpointingMode(options.gmnetCheckpointing);
          const checkpointingEnabled = shouldUseCheckpointing(checkpointingMode);
          const checkpointStore = checkpointingEnabled ? this.getCheckpointStore() : null;
          const checkpointProvider = forcedProvider
            || resolveCurrentExecutionProvider(runtimeExecutionProvider, session)
            || capability.provider
            || REQUIRED_GMNET_EXECUTION_PROVIDER;
          const checkpointKey = checkpointingEnabled
            ? buildCheckpointKey({
              modelVariant: options.gmnetModelVariant,
              provider: checkpointProvider,
              width: sourceImageData.width,
              height: sourceImageData.height,
            })
            : null;
          let checkpointResumed = false;

          if (checkpointStore && checkpointKey) {
            const snapshot = await checkpointStore.loadSnapshot(checkpointKey);
            if (canRestoreCheckpointSnapshot(snapshot, tiledContext, tileTotal)) {
              tiledContext.accumIngm!.set(snapshot.accumIngm);
              tiledContext.tileCompleted!.set(snapshot.tileCompleted.subarray(0, tileTotal));
              tiledContext.completedTileCount = countCompletedTiles(tiledContext.tileCompleted, tileTotal);
              checkpointResumed = tiledContext.completedTileCount > 0;
            }
          }

          for (let tileIndex = 0; tileIndex < tileTotal; tileIndex += 1) {
            if (checkpointingEnabled && tiledContext?.tileCompleted?.[tileIndex]) {
              continue;
            }
            const tileMetadata = await runTileStep(tiledContext, tileIndex);
            if (tiledContext?.tileCompleted instanceof Uint8Array && !tiledContext.tileCompleted[tileIndex]) {
              tiledContext.tileCompleted[tileIndex] = 1;
            }
            tiledContext.completedTileCount = countCompletedTiles(tiledContext?.tileCompleted, tileTotal);
            if (checkpointStore && checkpointKey) {
              await checkpointStore.saveSnapshot(checkpointKey, {
                sourceWidth: tiledContext?.sourceWidth || sourceImageData.width,
                sourceHeight: tiledContext?.sourceHeight || sourceImageData.height,
                tileTotal,
                completedTileCount: tiledContext?.completedTileCount || 0,
                tileCompleted: tiledContext?.tileCompleted,
                accumIngm: tiledContext?.accumIngm,
              });
            }
            const normalizedTileIndex = Number(tileMetadata?.gmnetTileIndex ?? tileMetadata?.tileIndex ?? tileIndex);
            const normalizedTileTotal = Number(tileMetadata?.gmnetTileTotal ?? tileMetadata?.tileTotal ?? tileTotal);
            const tileProgress = normalizedTileTotal > 0
              ? Math.min(95, Math.max(1, Math.floor(((normalizedTileIndex + 1) / normalizedTileTotal) * 95)))
              : 5;
            if (runOptions.validationProbe !== true) {
              onStageProgress?.(
                tileProgress,
                `Running tile ${normalizedTileIndex + 1}/${Math.max(1, normalizedTileTotal)}`,
                {
                  gmnetExecutionProvider: forcedProvider || runtimeExecutionProvider,
                  ...buildCheckpointMetadata({
                    checkpointingEnabled,
                    checkpointResumed,
                    tileCompleted: tiledContext?.tileCompleted,
                    tileTotal,
                    fallbackCompletedTileCount: tiledContext?.completedTileCount,
                  }),
                  ...(tileMetadata && typeof tileMetadata === 'object' ? tileMetadata : {}),
                },
              );
            }
          }
          gainMapRgba = finalizeTiledInference(tiledContext, {
            ...sessionRunOptions,
          });
          if (checkpointStore && checkpointKey) {
            await checkpointStore.clearSnapshot(checkpointKey);
          }
        } else {
          gainMapRgba = await session.run(sourceImageData, {
            ...sessionRunOptions,
          });
        }
        const expectedLength = sourceImageData.width * sourceImageData.height * 4;
        if (!(gainMapRgba instanceof Uint8ClampedArray)) {
          throw new Error('GMNet output must be Uint8ClampedArray RGBA pixels.');
        }
        if (gainMapRgba.length !== expectedLength) {
          throw new Error(
            `GMNet output size mismatch: expected ${expectedLength}, received ${gainMapRgba.length}.`
          );
        }
        return {
          gainMapRgba,
          gainMapStats: analyzeGainMapRgba(gainMapRgba),
          sourceImageData,
        };
      };

      const ensureWebglParity = async (runOptions: GmnetRunOptions = {}) => {
        const modelVariant = typeof runOptions.gmnetModelVariant === 'string' && runOptions.gmnetModelVariant.trim().length > 0
          ? runOptions.gmnetModelVariant.trim().toLowerCase()
          : 'realworld';
        const cachedParity = this.webglParityCache.get(modelVariant);
        if (cachedParity === true) {
          return;
        }
        if (cachedParity && cachedParity.ok === false) {
          throw createWebglParityError(cachedParity.stats);
        }

        const parityProbeImageData = createDeterministicParityProbeImageData();
        const webglProbe = await executeInference({
          ...runOptions,
          imageData: parityProbeImageData,
          forceExecutionProviders: [GMNET_FALLBACK_EXECUTION_PROVIDER],
          validationProbe: true,
        });
        const wasmProbe = await executeInference({
          ...runOptions,
          imageData: parityProbeImageData,
          forceExecutionProviders: [GMNET_WASM_EXECUTION_PROVIDER],
          validationProbe: true,
        });
        const parityStats = compareGainMapRgba(webglProbe.gainMapRgba, wasmProbe.gainMapRgba);
        if (!isWithinWebglParityTolerance(parityStats)) {
          this.webglParityCache.set(modelVariant, {
            ok: false,
            stats: parityStats,
          });
          throw createWebglParityError(parityStats);
        }
        this.webglParityCache.set(modelVariant, true);
      };

      const runInference = async (runOptions: GmnetRunOptions = {}) => {
        const forcedProviders = Array.isArray(runOptions.forceExecutionProviders)
          ? runOptions.forceExecutionProviders
          : [];
        const forcedProvider = forcedProviders.length === 1
          ? normalizeExecutionProviderName(forcedProviders[0])
          : null;
        if (
          forcedProvider === GMNET_FALLBACK_EXECUTION_PROVIDER
          && runOptions.validationProbe !== true
        ) {
          await ensureWebglParity(runOptions);
        }
        return executeInference(runOptions);
      };

      onStageProgress?.(
        0,
        INFERENCE_START_NOTE,
        {
          gmnetExecutionProvider: runtimeExecutionProvider || capability.provider || null,
        },
      );
      const runWebglFallback = async (note: string) => {
        onStageProgress?.(
          2,
          note,
          {
              gmnetExecutionProvider: GMNET_FALLBACK_EXECUTION_PROVIDER,
          },
        );
        return runInference({
          forceExecutionProviders: [GMNET_FALLBACK_EXECUTION_PROVIDER],
        });
      };

      const runWasmFallback = async (note: string) => {
        onStageProgress?.(
          2,
          note,
          {
              gmnetExecutionProvider: GMNET_WASM_EXECUTION_PROVIDER,
          },
        );
        return runInference({
          forceExecutionProviders: [GMNET_WASM_EXECUTION_PROVIDER],
        });
      };

      const resolveAutoFallbackProviders = (reason = 'error') => {
        if (hasExplicitBackendSelection) {
          if (requestedProvider === GMNET_FALLBACK_EXECUTION_PROVIDER) {
            return [GMNET_WASM_EXECUTION_PROVIDER];
          }
          return [];
        }
        const currentProvider = resolveCurrentExecutionProvider(runtimeExecutionProvider, session);
        if (currentProvider === REQUIRED_GMNET_EXECUTION_PROVIDER) {
          return [GMNET_FALLBACK_EXECUTION_PROVIDER, GMNET_WASM_EXECUTION_PROVIDER];
        }
        if (currentProvider === GMNET_FALLBACK_EXECUTION_PROVIDER) {
          return [GMNET_WASM_EXECUTION_PROVIDER];
        }
        if (currentProvider === GMNET_WASM_EXECUTION_PROVIDER) {
          return [];
        }
        return [GMNET_FALLBACK_EXECUTION_PROVIDER, GMNET_WASM_EXECUTION_PROVIDER];
      };

      const attemptedFallbackProviders = new Set<string>();
      const runNextFallback = async (reason = 'error') => {
        const fallbackProviders = resolveAutoFallbackProviders(reason).filter(
          (provider) => !attemptedFallbackProviders.has(provider),
        );
        if (fallbackProviders.length === 0) {
          return null;
        }
        for (const provider of fallbackProviders) {
          attemptedFallbackProviders.add(provider);
          const isNearFlatReason = reason === 'near-flat';
          try {
            if (provider === GMNET_FALLBACK_EXECUTION_PROVIDER) {
              return await runWebglFallback(
                isNearFlatReason ? WEBGL_FALLBACK_RETRY_NOTE : WEBGL_FALLBACK_ERROR_RETRY_NOTE,
              );
            }
            if (provider === GMNET_WASM_EXECUTION_PROVIDER) {
              return await runWasmFallback(
                reason === 'webgl-parity'
                  ? WEBGL_PARITY_RETRY_NOTE
                  : (isNearFlatReason ? WASM_FALLBACK_RETRY_NOTE : WASM_FALLBACK_ERROR_RETRY_NOTE),
              );
            }
          } catch (fallbackError) {
            if (provider === fallbackProviders[fallbackProviders.length - 1]) {
              throw fallbackError;
            }
            reason = 'error';
          }
        }
        return null;
      };

      let inferenceResult;
      try {
        inferenceResult = await runInference(
          hasExplicitBackendSelection
            ? (requestedProvider ? { forceExecutionProviders: [requestedProvider] } : {})
            : {},
        );
      } catch (error) {
        const fallbackReason = error instanceof Error && error.name === 'GmnetWebGlParityError'
          ? 'webgl-parity'
          : 'error';
        const fallbackResult = await runNextFallback(fallbackReason);
        if (!fallbackResult) {
          throw error;
        }
        inferenceResult = fallbackResult;
      }

      let { gainMapRgba, gainMapStats } = inferenceResult;
      while (isNearFlatGainMap(gainMapStats)) {
        const fallbackResult = await runNextFallback('near-flat');
        if (!fallbackResult) {
          break;
        }
        gainMapRgba = fallbackResult.gainMapRgba;
        gainMapStats = fallbackResult.gainMapStats;
      }
      if (isNearFlatGainMap(gainMapStats)) {
        throw new Error(
          `GMNet output appears near-flat (range=${gainMapStats.dynamicRange}, std=${gainMapStats.stdDev.toFixed(3)}).`
        );
      }

      onStageProgress?.(
        100,
        'AI Inference Complete',
        {
          gmnetExecutionProvider: resolveCurrentExecutionProvider(runtimeExecutionProvider, session),
        },
      );

      return {
        gainMapImageData: new ImageData(new Uint8ClampedArray(gainMapRgba), imageData.width, imageData.height),
        metadata: this.buildMetadata(normalizeMaxContentBoost(options.maxContentBoost)),
      };
    } finally {
      if (progressHandler) {
        session.off('progress', progressHandler);
      }
      if (runtimeHandler) {
        session.off('runtime', runtimeHandler);
      }
    }
  }
}
