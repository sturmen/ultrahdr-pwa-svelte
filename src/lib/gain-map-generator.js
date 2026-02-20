import {
  GMNET_FALLBACK_EXECUTION_PROVIDER,
  GMNetInferenceSession,
  REQUIRED_GMNET_EXECUTION_PROVIDER,
} from './gmnet-session.js';

const DEFAULT_MAX_CONTENT_BOOST = 2.3;
const INFERENCE_START_NOTE = 'Starting inference; application may appear hung while AI model executes.';
const WEBGL_FALLBACK_RETRY_NOTE = 'WebGPU produced an invalid gain map; retrying with WebGL.';
const WEBGL_FALLBACK_ERROR_RETRY_NOTE = 'WebGPU inference failed; retrying with WebGL.';
const MIN_GAIN_MAP_DYNAMIC_RANGE = 2;
const MIN_GAIN_MAP_STD_DEV = 0.25;

function normalizeExecutionProviderName(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim().toLowerCase();
  return trimmed || null;
}

function isChromiumRuntime(runtime = globalThis) {
  const userAgent = String(runtime?.navigator?.userAgent || '');
  return /chrom(e|ium)|edg\//i.test(userAgent);
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
  }

  getSession() {
    if (!this.session) {
      this.session = this.sessionFactory();
    }
    return this.session;
  }

  async generate(imageData, options = {}) {
    if (options?.useGmnet === false) {
      throw new Error('GMNet is required; heuristic gain map generation has been removed.');
    }

    if (!this.isSupported(this.runtime)) {
      throw new Error('GMNet runtime is not supported in this environment.');
    }

    const session = this.getSession();
    const onStageProgress =
      typeof options.onStageProgress === 'function' ? options.onStageProgress : null;

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
        const gainMapRgba = await session.run(imageData, {
          gmnetModelVariant: options.gmnetModelVariant,
          ...runOptions,
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
        { gmnetExecutionProvider: runtimeExecutionProvider },
      );
      const runWebglFallback = async (note) => {
        onStageProgress?.(
          2,
          note,
          { gmnetExecutionProvider: GMNET_FALLBACK_EXECUTION_PROVIDER },
        );
        return runInference({
          forceExecutionProviders: [GMNET_FALLBACK_EXECUTION_PROVIDER],
        });
      };

      const canRetryWithWebgl = () =>
        isChromiumRuntime(this.runtime)
        && resolveCurrentExecutionProvider(runtimeExecutionProvider, session)
          === REQUIRED_GMNET_EXECUTION_PROVIDER;

      let inferenceResult;
      try {
        inferenceResult = await runInference();
      } catch (error) {
        if (!canRetryWithWebgl()) {
          throw error;
        }
        inferenceResult = await runWebglFallback(WEBGL_FALLBACK_ERROR_RETRY_NOTE);
      }

      let { gainMapRgba, gainMapStats } = inferenceResult;
      if (isNearFlatGainMap(gainMapStats) && canRetryWithWebgl()) {
        const fallbackResult = await runWebglFallback(WEBGL_FALLBACK_RETRY_NOTE);
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
        { gmnetExecutionProvider: resolveCurrentExecutionProvider(runtimeExecutionProvider, session) },
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
