import { GMNetInferenceSession } from './gmnet-session.js';

const DEFAULT_MAX_CONTENT_BOOST = 2.3;
const INFERENCE_START_NOTE = 'Starting inference; application may appear hung while AI model executes.';

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
      onStageProgress?.(
        0,
        INFERENCE_START_NOTE,
        { gmnetExecutionProvider: runtimeExecutionProvider },
      );
      const gainMapRgba = await session.run(imageData, {
        gmnetModelVariant: options.gmnetModelVariant,
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

      onStageProgress?.(
        100,
        'AI Inference Complete',
        { gmnetExecutionProvider: runtimeExecutionProvider },
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
