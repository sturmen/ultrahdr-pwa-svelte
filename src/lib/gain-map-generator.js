import {
  GMNET_FALLBACK_EXECUTION_PROVIDER,
  GMNetInferenceSession,
  GMNET_WASM_EXECUTION_PROVIDER,
  REQUIRED_GMNET_EXECUTION_PROVIDER,
} from './gmnet-session.js';

const DEFAULT_MAX_CONTENT_BOOST = 2.3;
const INFERENCE_START_NOTE = 'Starting inference; application may appear hung while AI model executes.';
const WEBGL_FALLBACK_RETRY_NOTE = 'WebGPU produced an invalid gain map; retrying with WebGL.';
const WEBGL_FALLBACK_ERROR_RETRY_NOTE = 'WebGPU inference failed; retrying with WebGL.';
const WASM_FALLBACK_RETRY_NOTE = 'GPU fallback produced an invalid gain map; retrying with WASM.';
const WASM_FALLBACK_ERROR_RETRY_NOTE = 'GPU fallback failed; retrying with WASM.';
const MIN_GAIN_MAP_DYNAMIC_RANGE = 2;
const MIN_GAIN_MAP_STD_DEV = 0.25;

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

function normalizeCapabilityRecord(input) {
  if (!input || typeof input !== 'object') {
    return null;
  }
  const provider = normalizeExecutionProviderName(input.provider);
  const gainMapMaxLongEdge = Number(input.gainMapMaxLongEdge);
  const outputMaxLongEdge = Number(input.outputMaxLongEdge);
  if (!provider || !Number.isFinite(gainMapMaxLongEdge) || gainMapMaxLongEdge < 1) {
    return null;
  }
  const normalizedOutputMaxLongEdge = Number.isFinite(outputMaxLongEdge) && outputMaxLongEdge > 0
    ? Math.floor(outputMaxLongEdge)
    : Math.floor(gainMapMaxLongEdge * 2);
  return {
    provider,
    gainMapMaxLongEdge: Math.floor(gainMapMaxLongEdge),
    outputMaxLongEdge: normalizedOutputMaxLongEdge,
    source: typeof input.source === 'string' && input.source.length > 0
      ? input.source
      : 'probe',
    attempts: Array.isArray(input.attempts) ? input.attempts : [],
  };
}

export class GmnetGainMapGenerator {
  constructor({
    sessionFactory = () => new GMNetInferenceSession(),
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
    if (typeof isSupported !== 'function') {
      throw new Error('GmnetGainMapGenerator requires an isSupported function.');
    }

    this.sessionFactory = sessionFactory;
    this.buildMetadata = buildMetadata;
    this.runtime = runtime;
    this.isSupported = isSupported;
    this.session = null;
    this.capabilityByProvider = new Map();
  }

  getSession() {
    if (!this.session) {
      this.session = this.sessionFactory();
    }
    return this.session;
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
    const hintCapability = normalizeCapabilityRecord(options?.capabilityHint);
    if (hintCapability && (!requestedProvider || hintCapability.provider === requestedProvider)) {
      this.capabilityByProvider.set(hintCapability.provider, hintCapability);
      return hintCapability;
    }
    if (requestedProvider && this.capabilityByProvider.has(requestedProvider)) {
      return this.capabilityByProvider.get(requestedProvider);
    }
    if (!requestedProvider && this.capabilityByProvider.size === 1) {
      return Array.from(this.capabilityByProvider.values())[0];
    }

    if (typeof session.resolveGainMapCapability !== 'function') {
      const fallbackProvider = requestedProvider
        || normalizeExecutionProviderName(session?.activeExecutionProvider)
        || REQUIRED_GMNET_EXECUTION_PROVIDER;
      const fallbackCapability = {
        provider: fallbackProvider,
        gainMapMaxLongEdge: fallbackProvider === GMNET_FALLBACK_EXECUTION_PROVIDER ? 128 : 4096,
        outputMaxLongEdge: fallbackProvider === GMNET_FALLBACK_EXECUTION_PROVIDER ? 256 : 8192,
        source: fallbackProvider === GMNET_FALLBACK_EXECUTION_PROVIDER ? 'fixed-model' : 'legacy-default',
        attempts: [],
      };
      this.capabilityByProvider.set(fallbackCapability.provider, fallbackCapability);
      return fallbackCapability;
    }

    const resolvedCapability = normalizeCapabilityRecord(
      await session.resolveGainMapCapability({
        gmnetModelVariant: options?.gmnetModelVariant,
        forceExecutionProviders: options?.forceExecutionProviders,
      }),
    );
    if (!resolvedCapability) {
      throw new Error('GMNet capability probe returned an invalid response.');
    }
    this.capabilityByProvider.set(resolvedCapability.provider, resolvedCapability);
    return resolvedCapability;
  }

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
    onStageProgress?.(
      0,
      `GMNet capability resolved (${capability.provider}, gain-map max ${capability.gainMapMaxLongEdge}px).`,
      {
        gmnetCapability: capability,
        gmnetCapabilitySource: capability.source,
        gmnetExecutionProvider: capability.provider,
      },
    );

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
        if (capability?.gainMapMaxLongEdge) {
          sessionRunOptions.localInputMaxLongEdge = forcedProvider === GMNET_WASM_EXECUTION_PROVIDER
            ? Math.min(capability.gainMapMaxLongEdge, 8192)
            : capability.gainMapMaxLongEdge;
        }
        const gainMapRgba = await session.run(imageData, {
          ...sessionRunOptions,
        });
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
          gmnetExecutionProvider: runtimeExecutionProvider,
          gmnetCapability: capability,
          gmnetCapabilitySource: capability?.source || null,
        },
      );
      const runWebglFallback = async (note) => {
        onStageProgress?.(
          2,
          note,
          {
            gmnetExecutionProvider: GMNET_FALLBACK_EXECUTION_PROVIDER,
            gmnetCapability: capability,
            gmnetCapabilitySource: capability?.source || null,
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
            gmnetCapability: capability,
            gmnetCapabilitySource: capability?.source || null,
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
          gmnetCapability: capability,
          gmnetCapabilitySource: capability?.source || null,
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
