import {
  DEFAULT_GMNET_MODEL_VARIANT,
  GMNetInferenceSession,
  REQUIRED_GMNET_EXECUTION_PROVIDER,
} from './gmnet-session.js';

const DEFAULT_SMOKE_ASSET_PATH = 'models/gmnet-smoke-128.png';
const DEFAULT_SMOKE_IMAGE_WIDTH = 128;
const DEFAULT_SMOKE_IMAGE_HEIGHT = 128;

export const RUNTIME_INIT_STEP_ORDER = Object.freeze([
  'onnx-load',
  'webgpu-check',
  'gmnet-session-init',
  'gmnet-provider-verify',
  'gmnet-smoke-run',
  'startup-ready',
]);

export const RUNTIME_INIT_STEP_LABELS = Object.freeze({
  'onnx-load': 'Load ONNX Runtime',
  'webgpu-check': 'Check WebGPU availability',
  'gmnet-session-init': 'Initialize GMNet session',
  'gmnet-provider-verify': 'Verify GMNet execution provider',
  'gmnet-smoke-run': 'Run GMNet smoke test (128x128)',
  'startup-ready': 'Finalize startup readiness',
});

export const RUNTIME_INIT_ERROR_CODES = Object.freeze({
  ONNX_FAILED: 'RUNTIME_INIT_ONNX_FAILED',
  WEBGPU_UNAVAILABLE: 'RUNTIME_INIT_WEBGPU_UNAVAILABLE',
  PROVIDER_MISMATCH: 'RUNTIME_INIT_PROVIDER_MISMATCH',
  SMOKE_ASSET_FAILED: 'RUNTIME_INIT_SMOKE_ASSET_FAILED',
  SMOKE_INFERENCE_FAILED: 'RUNTIME_INIT_SMOKE_INFERENCE_FAILED',
});

function normalizeExecutionProvider(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

function resolveModelBasePath() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function appendVersionQuery(url, version) {
  if (!version) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

function resolveSmokeAssetUrl(smokeAssetPath = DEFAULT_SMOKE_ASSET_PATH) {
  const normalized = String(smokeAssetPath || DEFAULT_SMOKE_ASSET_PATH).replace(/^\/+/, '');
  const appVersion = typeof import.meta.env.VITE_APP_ASSET_VERSION === 'string'
    ? import.meta.env.VITE_APP_ASSET_VERSION.trim()
    : '';
  const url = `${resolveModelBasePath()}${normalized}`;
  return appendVersionQuery(url, appVersion);
}

function toStackSnippet(stack) {
  if (typeof stack !== 'string' || stack.length === 0) {
    return null;
  }
  return stack
    .split('\n')
    .slice(0, 8)
    .join('\n');
}

function collectRuntimeFacts(runtime = globalThis, extras = {}) {
  const navigatorRef = runtime?.navigator || {};
  return {
    userAgent: String(navigatorRef.userAgent || ''),
    platform: String(navigatorRef.platform || ''),
    hardwareConcurrency: Number(navigatorRef.hardwareConcurrency || 0) || null,
    crossOriginIsolated: runtime?.crossOriginIsolated === true,
    hasNavigatorGpu: Boolean(navigatorRef.gpu),
    appVersion: import.meta.env.VITE_APP_VERSION || 'dev',
    assetVersion: import.meta.env.VITE_APP_ASSET_VERSION || 'dev-unversioned-app',
    wasmAssetVersion: import.meta.env.VITE_WASM_ASSET_VERSION || 'dev-unversioned',
    ...extras,
  };
}

function createInitializationError({
  errorCode,
  stepId,
  message,
  userMessage,
  diagnostics = {},
  cause = null,
  runtime = globalThis,
}) {
  const error = new Error(message || userMessage || 'Runtime initialization failed.');
  error.name = 'RuntimeInitializationError';
  error.code = errorCode;
  error.stepId = stepId;
  error.userMessage = userMessage || 'Runtime initialization failed.';
  error.diagnostics = {
    ...collectRuntimeFacts(runtime),
    ...diagnostics,
  };
  error.stackSnippet = toStackSnippet(error.stack);
  if (cause) {
    error.cause = cause;
  }
  return error;
}

function coerceInitializationError({
  stepId,
  cause,
  runtime,
  errorCode,
  userMessage,
  diagnostics = {},
}) {
  if (cause?.name === 'RuntimeInitializationError' && cause.code && cause.stepId) {
    if (!cause.diagnostics) {
      cause.diagnostics = collectRuntimeFacts(runtime);
    }
    cause.stackSnippet = cause.stackSnippet || toStackSnippet(cause.stack);
    return cause;
  }

  return createInitializationError({
    errorCode,
    stepId,
    message: cause?.message || userMessage,
    userMessage,
    diagnostics,
    cause,
    runtime,
  });
}

function emitStepProgress(onProgress, stepId, status, note, payload = {}) {
  if (typeof onProgress !== 'function') {
    return;
  }
  onProgress({
    stepId,
    stepLabel: RUNTIME_INIT_STEP_LABELS[stepId] || stepId,
    status,
    note,
    timestamp: Date.now(),
    ...payload,
  });
}

async function runStep({
  stepId,
  runningNote,
  successNote,
  onProgress,
  runtime,
  errorCode,
  userMessage,
  fn,
}) {
  emitStepProgress(onProgress, stepId, 'running', runningNote);
  try {
    const result = await fn();
    emitStepProgress(onProgress, stepId, 'passed', successNote || runningNote);
    return result;
  } catch (cause) {
    const error = coerceInitializationError({
      stepId,
      cause,
      runtime,
      errorCode,
      userMessage,
    });
    emitStepProgress(onProgress, stepId, 'failed', error.userMessage, {
      errorCode: error.code,
      diagnostics: error.diagnostics,
    });
    throw error;
  }
}

async function loadSmokeImageDataDefault({ runtime = globalThis, smokeAssetUrl }) {
  if (typeof runtime?.fetch !== 'function') {
    throw new Error('fetch is not available for smoke asset loading.');
  }

  const response = await runtime.fetch(smokeAssetUrl, { credentials: 'same-origin' });
  if (!response?.ok) {
    throw new Error(`Failed to fetch smoke asset: ${response?.status || 'unknown status'}`);
  }

  let blob;
  if (typeof response.blob === 'function') {
    blob = await response.blob();
  } else if (typeof response.arrayBuffer === 'function') {
    blob = new Blob([await response.arrayBuffer()], { type: 'image/png' });
  } else {
    throw new Error('Smoke asset response does not support blob() or arrayBuffer().');
  }

  let drawable = null;
  try {
    if (typeof runtime?.createImageBitmap === 'function') {
      drawable = await runtime.createImageBitmap(blob);
    } else if (typeof createImageBitmap === 'function') {
      drawable = await createImageBitmap(blob);
    }

    if (drawable) {
      const width = drawable.width;
      const height = drawable.height;
      let ctx;
      if (typeof runtime?.OffscreenCanvas !== 'undefined') {
        const canvas = new runtime.OffscreenCanvas(width, height);
        ctx = canvas.getContext('2d');
      } else if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(width, height);
        ctx = canvas.getContext('2d');
      } else if (typeof runtime?.document?.createElement === 'function') {
        const canvas = runtime.document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        ctx = canvas.getContext('2d');
      }

      if (!ctx) {
        throw new Error('Canvas context unavailable while decoding smoke asset.');
      }

      ctx.drawImage(drawable, 0, 0);
      return ctx.getImageData(0, 0, width, height);
    }
  } finally {
    if (drawable && typeof drawable.close === 'function') {
      drawable.close();
    }
  }

  throw new Error('createImageBitmap is unavailable for smoke asset decoding.');
}

export async function initializeRuntime({
  onProgress,
  runtime = globalThis,
  sessionFactory = () => new GMNetInferenceSession({ runtime }),
  loadSmokeImageData,
  smokeAssetPath = DEFAULT_SMOKE_ASSET_PATH,
  modelVariant = DEFAULT_GMNET_MODEL_VARIANT,
} = {}) {
  const requestedExecutionProviders = [REQUIRED_GMNET_EXECUTION_PROVIDER];
  const session = sessionFactory();
  const smokeAssetUrl = resolveSmokeAssetUrl(smokeAssetPath);
  const loadSmokeImageDataImpl = typeof loadSmokeImageData === 'function'
    ? loadSmokeImageData
    : (context) => loadSmokeImageDataDefault(context);

  await runStep({
    stepId: 'onnx-load',
    runningNote: 'Loading ONNX runtime dependencies...',
    successNote: 'ONNX runtime dependencies loaded.',
    onProgress,
    runtime,
    errorCode: RUNTIME_INIT_ERROR_CODES.ONNX_FAILED,
    userMessage: 'Unable to load ONNX runtime dependencies.',
    fn: async () => {
      if (!session || typeof session.init !== 'function' || typeof session.run !== 'function') {
        throw new Error('GMNet session factory returned an invalid session.');
      }
    },
  });

  await runStep({
    stepId: 'webgpu-check',
    runningNote: 'Checking WebGPU runtime support...',
    successNote: 'WebGPU runtime is available.',
    onProgress,
    runtime,
    errorCode: RUNTIME_INIT_ERROR_CODES.WEBGPU_UNAVAILABLE,
    userMessage: 'WebGPU is unavailable in this environment.',
    fn: async () => {
      if (!runtime?.navigator?.gpu) {
        throw new Error('navigator.gpu is unavailable.');
      }
      if (typeof runtime.navigator.gpu.requestAdapter === 'function') {
        const adapter = await runtime.navigator.gpu.requestAdapter();
        if (!adapter) {
          throw new Error('No WebGPU adapter was returned.');
        }
      }
    },
  });

  await runStep({
    stepId: 'gmnet-session-init',
    runningNote: 'Initializing GMNet model session...',
    successNote: 'GMNet session initialized.',
    onProgress,
    runtime,
    errorCode: RUNTIME_INIT_ERROR_CODES.ONNX_FAILED,
    userMessage: 'GMNet session initialization failed.',
    fn: async () => {
      await session.init(modelVariant, {
        forceExecutionProviders: requestedExecutionProviders,
        forceReload: true,
      });
    },
  });

  const resolvedExecutionProvider = await runStep({
    stepId: 'gmnet-provider-verify',
    runningNote: 'Verifying GMNet execution provider...',
    successNote: 'GMNet execution provider verified.',
    onProgress,
    runtime,
    errorCode: RUNTIME_INIT_ERROR_CODES.PROVIDER_MISMATCH,
    userMessage: 'GMNet did not initialize with WebGPU.',
    fn: async () => {
      const resolved = normalizeExecutionProvider(session.activeExecutionProvider);
      if (resolved !== REQUIRED_GMNET_EXECUTION_PROVIDER) {
        throw createInitializationError({
          errorCode: RUNTIME_INIT_ERROR_CODES.PROVIDER_MISMATCH,
          stepId: 'gmnet-provider-verify',
          message: `Resolved execution provider "${resolved || 'unknown'}" does not satisfy strict WebGPU mode.`,
          userMessage: 'GMNet did not initialize with the required WebGPU provider.',
          diagnostics: {
            requestedExecutionProviders,
            resolvedExecutionProvider: resolved,
          },
          runtime,
        });
      }
      return resolved;
    },
  });

  await runStep({
    stepId: 'gmnet-smoke-run',
    runningNote: 'Running GMNet smoke test on 128x128 asset...',
    successNote: 'GMNet smoke test passed.',
    onProgress,
    runtime,
    errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_INFERENCE_FAILED,
    userMessage: 'GMNet smoke test failed.',
    fn: async () => {
      let smokeImageData;
      try {
        smokeImageData = await loadSmokeImageDataImpl({
          runtime,
          smokeAssetUrl,
          width: DEFAULT_SMOKE_IMAGE_WIDTH,
          height: DEFAULT_SMOKE_IMAGE_HEIGHT,
        });
      } catch (cause) {
        throw createInitializationError({
          errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_ASSET_FAILED,
          stepId: 'gmnet-smoke-run',
          message: cause?.message || 'Failed to load smoke image asset.',
          userMessage: 'Unable to load the GMNet smoke-test asset.',
          diagnostics: {
            smokeAssetUrl,
          },
          cause,
          runtime,
        });
      }

      if (!(smokeImageData instanceof ImageData)) {
        throw createInitializationError({
          errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_ASSET_FAILED,
          stepId: 'gmnet-smoke-run',
          message: 'Smoke asset decoder did not return ImageData.',
          userMessage: 'Unable to decode the GMNet smoke-test asset.',
          diagnostics: {
            smokeAssetUrl,
            decodedType: smokeImageData?.constructor?.name || typeof smokeImageData,
          },
          runtime,
        });
      }

      if (
        smokeImageData.width !== DEFAULT_SMOKE_IMAGE_WIDTH
        || smokeImageData.height !== DEFAULT_SMOKE_IMAGE_HEIGHT
      ) {
        throw createInitializationError({
          errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_ASSET_FAILED,
          stepId: 'gmnet-smoke-run',
          message: `Smoke asset dimensions must be ${DEFAULT_SMOKE_IMAGE_WIDTH}x${DEFAULT_SMOKE_IMAGE_HEIGHT}.`,
          userMessage: 'GMNet smoke-test asset dimensions are invalid.',
          diagnostics: {
            smokeAssetUrl,
            decodedWidth: smokeImageData.width,
            decodedHeight: smokeImageData.height,
            expectedWidth: DEFAULT_SMOKE_IMAGE_WIDTH,
            expectedHeight: DEFAULT_SMOKE_IMAGE_HEIGHT,
          },
          runtime,
        });
      }

      let smokeOutput;
      try {
        smokeOutput = await session.run(smokeImageData, {
          gmnetModelVariant: modelVariant,
        });
      } catch (cause) {
        throw createInitializationError({
          errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_INFERENCE_FAILED,
          stepId: 'gmnet-smoke-run',
          message: cause?.message || 'GMNet smoke inference failed.',
          userMessage: 'GMNet failed to execute the startup smoke test.',
          diagnostics: {
            smokeAssetUrl,
            decodedWidth: smokeImageData.width,
            decodedHeight: smokeImageData.height,
            resolvedExecutionProvider,
          },
          cause,
          runtime,
        });
      }

      if (!(smokeOutput instanceof Uint8ClampedArray)) {
        throw createInitializationError({
          errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_INFERENCE_FAILED,
          stepId: 'gmnet-smoke-run',
          message: 'Smoke inference output must be Uint8ClampedArray.',
          userMessage: 'GMNet smoke test output was invalid.',
          diagnostics: {
            smokeAssetUrl,
            outputType: smokeOutput?.constructor?.name || typeof smokeOutput,
            resolvedExecutionProvider,
          },
          runtime,
        });
      }

      const expectedOutputLength =
        DEFAULT_SMOKE_IMAGE_WIDTH * DEFAULT_SMOKE_IMAGE_HEIGHT * 4;
      if (smokeOutput.length !== expectedOutputLength) {
        throw createInitializationError({
          errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_INFERENCE_FAILED,
          stepId: 'gmnet-smoke-run',
          message: `Smoke output length mismatch: expected ${expectedOutputLength}, received ${smokeOutput.length}.`,
          userMessage: 'GMNet smoke test output size was invalid.',
          diagnostics: {
            smokeAssetUrl,
            expectedOutputLength,
            actualOutputLength: smokeOutput.length,
            resolvedExecutionProvider,
          },
          runtime,
        });
      }

      return {
        smokeAssetUrl,
        decodedWidth: smokeImageData.width,
        decodedHeight: smokeImageData.height,
        outputLength: smokeOutput.length,
      };
    },
  });

  await runStep({
    stepId: 'startup-ready',
    runningNote: 'Finalizing startup checks...',
    successNote: 'Startup runtime checks complete.',
    onProgress,
    runtime,
    errorCode: RUNTIME_INIT_ERROR_CODES.ONNX_FAILED,
    userMessage: 'Startup checks did not complete successfully.',
    fn: async () => {},
  });

  return {
    requestedExecutionProviders,
    resolvedExecutionProvider,
    smokeAssetUrl,
  };
}
