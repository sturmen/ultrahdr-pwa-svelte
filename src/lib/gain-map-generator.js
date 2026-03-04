import {
  GMNET_FALLBACK_EXECUTION_PROVIDER,
  GMNetInferenceSession,
  GMNET_WASM_EXECUTION_PROVIDER,
  REQUIRED_GMNET_EXECUTION_PROVIDER,
} from './gmnet-session.js';
import { GMNetCheckpointStore } from './gmnet-checkpoint-store.js';
import { IMAGE_MAX_LONG_EDGE } from './constants.js';

const DEFAULT_MAX_CONTENT_BOOST = 2.3;
const INFERENCE_START_NOTE = 'Starting inference; application may appear hung while AI model executes.';
const WEBGL_FALLBACK_RETRY_NOTE = 'WebGPU produced an invalid gain map; retrying with WebGL.';
const WEBGL_FALLBACK_ERROR_RETRY_NOTE = 'WebGPU inference failed; retrying with WebGL.';
const WASM_FALLBACK_RETRY_NOTE = 'GPU fallback produced an invalid gain map; retrying with WASM.';
const WASM_FALLBACK_ERROR_RETRY_NOTE = 'GPU fallback failed; retrying with WASM.';
const MIN_GAIN_MAP_DYNAMIC_RANGE = 2;
const MIN_GAIN_MAP_STD_DEV = 0.25;
const GMNET_CHECKPOINTING_OFF = 'off';
const GMNET_CHECKPOINTING_AUTO = 'auto';
const GMNET_CHECKPOINTING_FORCE = 'force';

function normalizeExecutionProviderName(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  return trimmed || null;
}

function formatExecutionProviderNote(provider) {
  const normalizedProvider = normalizeExecutionProviderName(provider);
  if (!normalizedProvider) {
    return INFERENCE_START_NOTE;
  }
  return `${INFERENCE_START_NOTE} Runtime: ${normalizedProvider}.`;
}

function normalizeMaxContentBoost(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return DEFAULT_MAX_CONTENT_BOOST;
  }
  return Math.max(1.0, numeric);
}

function analyzeGainMapRgba(rgba) {
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
  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const value = rgba[pixelIndex * 4];
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

function isNearFlatGainMap(stats) {
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

function resolveCurrentExecutionProvider(runtimeExecutionProvider, session) {
  return (
    normalizeExecutionProviderName(runtimeExecutionProvider)
    || normalizeExecutionProviderName(session?.activeExecutionProvider)
    || null
  );
}

function normalizeCheckpointingMode(value) {
  if (typeof value !== 'string') {
    return GMNET_CHECKPOINTING_OFF;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === GMNET_CHECKPOINTING_AUTO || normalized === GMNET_CHECKPOINTING_FORCE) {
    return normalized;
  }
  return GMNET_CHECKPOINTING_OFF;
}

function shouldUseCheckpointing(mode) {
  return mode === GMNET_CHECKPOINTING_AUTO || mode === GMNET_CHECKPOINTING_FORCE;
}

function buildCheckpointKey({
  modelVariant,
  provider,
  width,
  height,
}) {
  const variant = typeof modelVariant === 'string' && modelVariant.trim().length > 0
    ? modelVariant.trim().toLowerCase()
    : 'realworld';
  const resolvedProvider = normalizeExecutionProviderName(provider) || 'auto';
  return `gmnet:v1:${variant}:${resolvedProvider}:${width}x${height}`;
}

function countCompletedTiles(tileCompleted, tileTotal) {
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

function canRestoreCheckpointSnapshot(snapshot, context, tileTotal) {
  if (!snapshot || typeof snapshot !== 'object' || !context || typeof context !== 'object') {
    return false;
  }
  if (!(context.accumIngm instanceof Float32Array) || !(context.tileCompleted instanceof Uint8Array)) {
    return false;
  }
  if (!(snapshot.accumIngm instanceof Float32Array) || !(snapshot.tileCompleted instanceof Uint8Array)) {
    return false;
  }
  if (snapshot.accumIngm.length !== context.accumIngm.length) {
    return false;
  }
  if (snapshot.tileCompleted.length < tileTotal) {
    return false;
  }
  if (Number(snapshot.sourceWidth) !== Number(context.sourceWidth)) {
    return false;
  }
  if (Number(snapshot.sourceHeight) !== Number(context.sourceHeight)) {
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
}) {
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

export function isGmnetRuntimeSupported(runtime = globalThis) {
  const hasCanvas =
    typeof runtime?.OffscreenCanvas !== 'undefined' ||
    (typeof runtime?.document !== 'undefined' && typeof runtime.document.createElement === 'function');

  return (
    hasCanvas &&
    typeof runtime?.fetch === 'function' &&
    typeof runtime?.ImageData !== 'undefined'
  );
}

export class GmnetGainMapGenerator {
  constructor({
    sessionFactory = () => new GMNetInferenceSession(),
    checkpointStoreFactory = ({ runtime }) => new GMNetCheckpointStore({ runtime }),
    buildMetadata,
    runtime = globalThis,
    isSupported = isGmnetRuntimeSupported,
  } = {}) {
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
  }

  getSession() {
    if (!this.session) {
      this.session = this.sessionFactory();
    }
    return this.session;
  }

  getCheckpointStore() {
    if (!this.checkpointStore) {
      this.checkpointStore = this.checkpointStoreFactory({ runtime: this.runtime });
    }
    return this.checkpointStore;
  }

  async resolveCapability(options = {}) {
    const session = this.getSession();
    const normalizedForcedProviders = Array.isArray(options?.forceExecutionProviders)
      ? options.forceExecutionProviders
        .map((provider) => normalizeExecutionProviderName(provider))
        .filter(Boolean)
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
  async generate(imageData, options = {}) {
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
        .filter(Boolean)
      : [];
    const requestedProvider = normalizedForcedProviders.length === 1
      ? normalizedForcedProviders[0]
      : null;
    const hasExplicitBackendSelection = Boolean(requestedProvider);
    const onStageProgress =
      typeof options.onStageProgress === 'function' ? options.onStageProgress : null;
    const capability = await this.resolveCapability({
      gmnetModelVariant: options.gmnetModelVariant,
      forceExecutionProviders: hasExplicitBackendSelection ? [requestedProvider] : options.forceExecutionProviders,
      capabilityHint: options.gmnetCapabilityHint,
    });

    let progressHandler = null;
    let runtimeHandler = null;
    let runtimeExecutionProvider = null;
    if (onStageProgress) {
      progressHandler = (event) => {
        if (event.total > 0) {
          onStageProgress((event.loaded / event.total) * 100, 'Downloading AI Model...');
        } else {
          onStageProgress(0, 'Initializing AI...');
        }
      };
      session.on('progress', progressHandler);

      runtimeHandler = (event) => {
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
      const runInference = async (runOptions = {}) => {
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
        let gainMapRgba;
        if (supportsTileStepApi) {
          const tiledContext = await session.prepareTiledInference(imageData, {
            ...sessionRunOptions,
          });
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
              width: imageData.width,
              height: imageData.height,
            })
            : null;
          let checkpointResumed = false;

          if (checkpointStore && checkpointKey) {
            const snapshot = await checkpointStore.loadSnapshot(checkpointKey);
            if (canRestoreCheckpointSnapshot(snapshot, tiledContext, tileTotal)) {
              tiledContext.accumIngm.set(snapshot.accumIngm);
              tiledContext.tileCompleted.set(snapshot.tileCompleted.subarray(0, tileTotal));
              tiledContext.completedTileCount = countCompletedTiles(tiledContext.tileCompleted, tileTotal);
              checkpointResumed = tiledContext.completedTileCount > 0;
            }
          }

          for (let tileIndex = 0; tileIndex < tileTotal; tileIndex += 1) {
            if (checkpointingEnabled && tiledContext?.tileCompleted?.[tileIndex]) {
              continue;
            }
            const tileMetadata = await session.runTileStep(tiledContext, tileIndex);
            if (tiledContext?.tileCompleted instanceof Uint8Array && !tiledContext.tileCompleted[tileIndex]) {
              tiledContext.tileCompleted[tileIndex] = 1;
            }
            tiledContext.completedTileCount = countCompletedTiles(tiledContext?.tileCompleted, tileTotal);
            if (checkpointStore && checkpointKey) {
              await checkpointStore.saveSnapshot(checkpointKey, {
                sourceWidth: tiledContext?.sourceWidth || imageData.width,
                sourceHeight: tiledContext?.sourceHeight || imageData.height,
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
          gainMapRgba = session.finalizeTiledInference(tiledContext, {
            ...sessionRunOptions,
          });
          if (checkpointStore && checkpointKey) {
            await checkpointStore.clearSnapshot(checkpointKey);
          }
        } else {
          gainMapRgba = await session.run(imageData, {
            ...sessionRunOptions,
          });
        }
        const expectedLength = imageData.width * imageData.height * 4;
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
        };
      };

      onStageProgress?.(
        0,
        INFERENCE_START_NOTE,
        {
          gmnetExecutionProvider: runtimeExecutionProvider || capability.provider || null,
        },
      );
      const runWebglFallback = async (note) => {
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

      const runWasmFallback = async (note) => {
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

      const resolveAutoFallbackProviders = () => {
        if (hasExplicitBackendSelection) {
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

      const attemptedFallbackProviders = new Set();
      const runNextFallback = async (reason = 'error') => {
        const fallbackProviders = resolveAutoFallbackProviders().filter(
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
                isNearFlatReason ? WASM_FALLBACK_RETRY_NOTE : WASM_FALLBACK_ERROR_RETRY_NOTE,
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
            ? { forceExecutionProviders: [requestedProvider] }
            : {},
        );
      } catch (error) {
        const fallbackResult = await runNextFallback('error');
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
        gainMapImageData: new ImageData(gainMapRgba, imageData.width, imageData.height),
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
