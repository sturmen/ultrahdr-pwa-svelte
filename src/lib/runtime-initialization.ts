import {
  DEFAULT_GMNET_MODEL_VARIANT,
  GMNET_FALLBACK_EXECUTION_PROVIDER,
  GMNetInferenceSession,
  GMNET_WASM_EXECUTION_PROVIDER,
  preloadGmnetRuntimeDependencies,
  REQUIRED_GMNET_EXECUTION_PROVIDER,
} from './gmnet-session.ts';
import { loadImageData } from './image-utils.js';
import { isGmnetWebGlSupportedRuntime } from './runtime-browser.ts';
import {
  RUNTIME_INIT_ERROR_CODES,
  RUNTIME_INIT_STEP_LABELS,
  RUNTIME_INIT_STEP_ORDER,
  normalizeExecutionProvider,
} from './runtime-contract.ts';

const DEFAULT_SMOKE_ASSET_PATH = 'models/gmnet-smoke-128.png';
const DEFAULT_SMOKE_IMAGE_WIDTH = 128;
const DEFAULT_SMOKE_IMAGE_HEIGHT = 128;
const SMOKE_OUTPUT_MIN_DYNAMIC_RANGE = 8;
const SMOKE_OUTPUT_MIN_STD_DEV = 1.5;
const DEFAULT_GMNET_SESSION_INIT_TIMEOUT_MS = 45_000;
const DEFAULT_GMNET_SMOKE_RUN_TIMEOUT_MS = 30_000;
const OFFLINE_RUNTIME_STEP_TIMEOUT_MS = 12_000;

export { RUNTIME_INIT_ERROR_CODES, RUNTIME_INIT_STEP_LABELS, RUNTIME_INIT_STEP_ORDER } from './runtime-contract.ts';

function normalizeExecutionProviderList(values) {
  if (!Array.isArray(values)) {
    return [];
  }
  const normalizedValues = values
    .map((value) => normalizeExecutionProvider(value))
    .filter(Boolean);
  return Array.from(new Set(normalizedValues));
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

function analyzeSmokeOutputRgba(smokeOutput) {
  const pixelCount = Math.floor(smokeOutput.length / 4);
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
    const channelValue = smokeOutput[pixelIndex * 4];
    if (channelValue < min) {
      min = channelValue;
    }
    if (channelValue > max) {
      max = channelValue;
    }
    sum += channelValue;
    sumSq += channelValue * channelValue;
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

function isSmokeOutputNearFlat(smokeStats) {
  if (!smokeStats || typeof smokeStats !== 'object') {
    return true;
  }
  if (!Number.isFinite(smokeStats.dynamicRange) || !Number.isFinite(smokeStats.stdDev)) {
    return true;
  }
  return (
    smokeStats.dynamicRange < SMOKE_OUTPUT_MIN_DYNAMIC_RANGE
    || smokeStats.stdDev < SMOKE_OUTPUT_MIN_STD_DEV
  );
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

function nowMs(runtime = globalThis) {
  const performanceNow = runtime?.performance?.now;
  if (typeof performanceNow === 'function') {
    return Math.floor(performanceNow.call(runtime?.performance));
  }
  return Date.now();
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

function resolveStepTimeoutMs(timeoutMs, runtime = globalThis, defaultTimeoutMs = 0) {
  const numericTimeoutMs = Number(timeoutMs);
  if (Number.isFinite(numericTimeoutMs) && numericTimeoutMs > 0) {
    return Math.max(1, Math.floor(numericTimeoutMs));
  }

  const normalizedDefaultTimeoutMs = Number.isFinite(defaultTimeoutMs) && defaultTimeoutMs > 0
    ? Math.max(1, Math.floor(defaultTimeoutMs))
    : 0;
  if (normalizedDefaultTimeoutMs <= 0) {
    return 0;
  }

  if (runtime?.navigator?.onLine === false) {
    return Math.min(normalizedDefaultTimeoutMs, OFFLINE_RUNTIME_STEP_TIMEOUT_MS);
  }
  return normalizedDefaultTimeoutMs;
}

function runWithStepTimeout(fn, stepId, timeoutMs = 0) {
  const normalizedTimeoutMs = Number(timeoutMs);
  if (!Number.isFinite(normalizedTimeoutMs) || normalizedTimeoutMs <= 0) {
    return Promise.resolve().then(fn);
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      const timeoutError = new Error(`${stepId} timed out after ${Math.floor(normalizedTimeoutMs)}ms.`);
      timeoutError.name = 'RuntimeInitializationStepTimeoutError';
      reject(timeoutError);
    }, Math.floor(normalizedTimeoutMs));

    Promise.resolve()
      .then(fn)
      .then((result) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        reject(error);
      });
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
  timeoutMs = 0,
}) {
  const startedAtMs = nowMs(runtime);
  emitStepProgress(onProgress, stepId, 'running', runningNote, {
    startedAtMs,
  });
  try {
    const result = await runWithStepTimeout(fn, stepId, timeoutMs);
    const durationMs = Math.max(0, nowMs(runtime) - startedAtMs);
    emitStepProgress(onProgress, stepId, 'passed', successNote || runningNote, {
      startedAtMs,
      durationMs,
    });
    return result;
  } catch (cause) {
    const durationMs = Math.max(0, nowMs(runtime) - startedAtMs);
    const error = coerceInitializationError({
      stepId,
      cause,
      runtime,
      errorCode,
      userMessage,
    });
    emitStepProgress(onProgress, stepId, 'failed', error.userMessage, {
      errorCode: error.code,
      diagnostics: {
        ...error.diagnostics,
        startedAtMs,
        durationMs,
      },
      startedAtMs,
      durationMs,
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

  const { imageData } = await loadImageData(blob);
  return imageData;
}

export async function initializeRuntime({
  onProgress,
  runtime = globalThis,
  sessionFactory = () => new GMNetInferenceSession({ runtime }),
  loadSmokeImageData,
  smokeAssetPath = DEFAULT_SMOKE_ASSET_PATH,
  forceSmokeFailure = false,
  allowWasmOnly = true,
  forceExecutionProviders = [],
  preferCompatibilityStartup = false,
  smokeBypassProviders = [],
  modelVariant = DEFAULT_GMNET_MODEL_VARIANT,
  gmnetCapabilityHintsByProvider = {},
  gmnetSessionInitTimeoutMs,
  gmnetSmokeRunTimeoutMs,
} = {}) {
  void gmnetCapabilityHintsByProvider;

  const session = sessionFactory();
  const smokeAssetUrl = resolveSmokeAssetUrl(smokeAssetPath);
  const loadSmokeImageDataImpl = typeof loadSmokeImageData === 'function'
    ? loadSmokeImageData
    : (context) => loadSmokeImageDataDefault(context);
  const offlineStartup = runtime?.navigator?.onLine === false;
  const forcedExecutionProviders = normalizeExecutionProviderList(forceExecutionProviders);
  let requestedExecutionProviders = [];
  const attemptFailures = [];
  let resolvedExecutionProvider = null;
  let gmnetCapability = null;
  const smokeBypassProviderSet = new Set(normalizeExecutionProviderList(smokeBypassProviders));
  const gmnetSessionInitStepTimeoutMs = resolveStepTimeoutMs(
    gmnetSessionInitTimeoutMs,
    runtime,
    DEFAULT_GMNET_SESSION_INIT_TIMEOUT_MS,
  );
  const gmnetSmokeRunStepTimeoutMs = resolveStepTimeoutMs(
    gmnetSmokeRunTimeoutMs,
    runtime,
    DEFAULT_GMNET_SMOKE_RUN_TIMEOUT_MS,
  );

  function normalizeAttemptFailure(error, provider) {
    const normalizedStepId = typeof error?.stepId === 'string' ? error.stepId : null;
    const normalizedProvider = normalizeExecutionProvider(provider);
    return {
      provider: normalizedProvider || provider || null,
      attemptIndex: Number.isFinite(Number(error?.attemptIndex)) ? Math.floor(Number(error.attemptIndex)) : null,
      stepId: normalizedStepId,
      errorCode: typeof error?.code === 'string'
        ? error.code
        : RUNTIME_INIT_ERROR_CODES.ONNX_FAILED,
      errorName: typeof error?.name === 'string' ? error.name : 'Error',
      message: error?.message || 'Runtime initialization attempt failed.',
      userMessage: error?.userMessage || error?.message || 'Runtime initialization attempt failed.',
      startedAtMs: Number.isFinite(Number(error?.startedAtMs)) ? Math.floor(Number(error.startedAtMs)) : null,
      durationMs: Number.isFinite(Number(error?.durationMs)) ? Math.floor(Number(error.durationMs)) : null,
      causeMessage: typeof error?.cause?.message === 'string' ? error.cause.message : null,
      stackSnippet: typeof error?.stackSnippet === 'string' ? error.stackSnippet : null,
      resolvedExecutionProvider: normalizeExecutionProvider(
        error?.diagnostics?.resolvedExecutionProvider || error?.resolvedExecutionProvider || null,
      ),
    };
  }

  async function decodeAndValidateSmokeImageData(currentProvider) {
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
          requestedExecutionProviders: [currentProvider],
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
          requestedExecutionProviders: [currentProvider],
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
          requestedExecutionProviders: [currentProvider],
        },
        runtime,
      });
    }

    return smokeImageData;
  }

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
      if (forcedExecutionProviders.length > 0) {
        try {
          for (const provider of forcedExecutionProviders) {
            await preloadGmnetRuntimeDependencies({ runtime, provider });
          }
        } catch (cause) {
          throw createInitializationError({
            errorCode: RUNTIME_INIT_ERROR_CODES.ONNX_FAILED,
            stepId: 'onnx-load',
            message: cause?.message || 'Unable to preload ONNX runtime dependencies.',
            userMessage: 'Unable to load ONNX runtime dependencies.',
            diagnostics: {
              forcedExecutionProviders,
              offlineStartup,
              preferCompatibilityStartup,
            },
            cause,
            runtime,
          });
        }
      }
    },
  });

  requestedExecutionProviders = await runStep({
    stepId: 'webgpu-check',
    runningNote: 'Checking GPU runtime compatibility...',
    successNote: 'GPU runtime compatibility confirmed.',
    onProgress,
    runtime,
    errorCode: RUNTIME_INIT_ERROR_CODES.NO_COMPATIBLE_GPU_PROVIDER,
    userMessage: 'No compatible GPU runtime is available in this environment.',
    fn: async () => {
      if (forcedExecutionProviders.length > 0) {
        return forcedExecutionProviders;
      }

      const providers = [];
      const webgpuIssues = [];

      if (runtime?.navigator?.gpu) {
        if (typeof runtime.navigator.gpu.requestAdapter === 'function') {
          const adapter = await runtime.navigator.gpu.requestAdapter();
          if (adapter) {
            providers.push(REQUIRED_GMNET_EXECUTION_PROVIDER);
          } else {
            webgpuIssues.push('No WebGPU adapter was returned.');
          }
        } else {
          providers.push(REQUIRED_GMNET_EXECUTION_PROVIDER);
        }
      } else {
        webgpuIssues.push('navigator.gpu is unavailable.');
      }

      if (isGmnetWebGlSupportedRuntime(runtime)) {
        providers.push(GMNET_FALLBACK_EXECUTION_PROVIDER);
      }

      if (providers.length > 0 || allowWasmOnly) {
        providers.push(GMNET_WASM_EXECUTION_PROVIDER);
      }

      if (providers.length === 0) {
        throw createInitializationError({
          errorCode: RUNTIME_INIT_ERROR_CODES.NO_COMPATIBLE_GPU_PROVIDER,
          stepId: 'webgpu-check',
          message: webgpuIssues[0] || 'No compatible GPU runtime is available.',
          userMessage: 'No compatible GPU runtime is available in this environment.',
          diagnostics: {
            attemptFailures: [
              ...webgpuIssues.map((message) => ({
                provider: REQUIRED_GMNET_EXECUTION_PROVIDER,
                stepId: 'webgpu-check',
                errorCode: RUNTIME_INIT_ERROR_CODES.WEBGPU_UNAVAILABLE,
                message,
              })),
              {
                provider: GMNET_FALLBACK_EXECUTION_PROVIDER,
                stepId: 'webgpu-check',
                errorCode: RUNTIME_INIT_ERROR_CODES.NO_COMPATIBLE_GPU_PROVIDER,
                message: 'WebGL runtime is unavailable in this environment.',
              },
            ],
            forcedExecutionProviders,
            offlineStartup,
            preferCompatibilityStartup,
          },
          runtime,
        });
      }

      return providers;
    },
  });

  for (const provider of requestedExecutionProviders) {
    const providerRequest = [provider];
    const attemptStartAtMs = nowMs(runtime);
    const attemptIndex = attemptFailures.length + 1;

    try {
      await runStep({
        stepId: 'gmnet-session-init',
        runningNote: `Initializing GMNet model session (${provider})...`,
        successNote: `GMNet session initialized (${provider}).`,
        onProgress,
        runtime,
        errorCode: RUNTIME_INIT_ERROR_CODES.ONNX_FAILED,
        userMessage: 'GMNet session initialization failed.',
        timeoutMs: gmnetSessionInitStepTimeoutMs,
        fn: async () => {
          await session.init(modelVariant, {
            forceExecutionProviders: providerRequest,
            forceReload: true,
          });
        },
      });

      resolvedExecutionProvider = await runStep({
        stepId: 'gmnet-provider-verify',
        runningNote: `Verifying GMNet execution provider (${provider})...`,
        successNote: 'GMNet execution provider verified.',
        onProgress,
        runtime,
        errorCode: RUNTIME_INIT_ERROR_CODES.PROVIDER_MISMATCH,
        userMessage: `GMNet did not initialize with ${provider}.`,
        fn: async () => {
          const resolved = normalizeExecutionProvider(session.activeExecutionProvider);
          if (resolved !== provider) {
            throw createInitializationError({
              errorCode: RUNTIME_INIT_ERROR_CODES.PROVIDER_MISMATCH,
              stepId: 'gmnet-provider-verify',
              message: `Resolved execution provider "${resolved || 'unknown'}" does not match requested "${provider}".`,
              userMessage: `GMNet did not initialize with ${provider}.`,
              diagnostics: {
                requestedExecutionProviders: providerRequest,
                resolvedExecutionProvider: resolved,
              },
              runtime,
            });
          }
          return resolved;
        },
      });

      if (!forceSmokeFailure && smokeBypassProviderSet.has(provider)) {
        emitStepProgress(
          onProgress,
          'gmnet-smoke-run',
          'passed',
          `GMNet smoke test skipped from startup cache (${provider}).`,
        );
      } else {
        await runStep({
          stepId: 'gmnet-smoke-run',
          runningNote: `Running GMNet smoke test (${provider})...`,
          successNote: 'GMNet smoke test passed.',
          onProgress,
          runtime,
          errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_INFERENCE_FAILED,
          userMessage: 'GMNet smoke test failed.',
          timeoutMs: gmnetSmokeRunStepTimeoutMs,
          fn: async () => {
            if (forceSmokeFailure) {
              throw createInitializationError({
                errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_ASSET_FAILED,
                stepId: 'gmnet-smoke-run',
                message: 'GMNet smoke asset failure was forced for runtime validation.',
                userMessage: 'Unable to load the GMNet smoke-test asset.',
                diagnostics: {
                  smokeAssetUrl,
                  forceSmokeFailure: true,
                  requestedExecutionProviders: providerRequest,
                  resolvedExecutionProvider,
                },
                runtime,
              });
            }

            const smokeImageData = await decodeAndValidateSmokeImageData(provider);

            let smokeOutput;
            try {
              smokeOutput = await session.run(smokeImageData, {
                gmnetModelVariant: modelVariant,
                forceExecutionProviders: providerRequest,
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
                  requestedExecutionProviders: providerRequest,
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
                  requestedExecutionProviders: providerRequest,
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
                  requestedExecutionProviders: providerRequest,
                  resolvedExecutionProvider,
                },
                runtime,
              });
            }

            const smokeOutputStats = analyzeSmokeOutputRgba(smokeOutput);
            if (isSmokeOutputNearFlat(smokeOutputStats)) {
              throw createInitializationError({
                errorCode: RUNTIME_INIT_ERROR_CODES.SMOKE_INFERENCE_FAILED,
                stepId: 'gmnet-smoke-run',
                message: 'Smoke inference output appears near-flat and is likely invalid.',
                userMessage: 'GMNet startup smoke test produced an invalid gain map.',
                diagnostics: {
                  smokeAssetUrl,
                  requestedExecutionProviders: providerRequest,
                  resolvedExecutionProvider,
                  smokeOutputStats,
                },
                runtime,
              });
            }

            return {
              smokeAssetUrl,
              decodedWidth: smokeImageData.width,
              decodedHeight: smokeImageData.height,
              outputLength: smokeOutput.length,
              smokeOutputStats,
            };
          },
        });
      }

      break;
    } catch (error) {
      if (error?.code === RUNTIME_INIT_ERROR_CODES.SMOKE_ASSET_FAILED) {
        throw error;
      }

      if (error && typeof error === 'object') {
        const normalizedError = error;
        normalizedError.startedAtMs = attemptStartAtMs;
        normalizedError.durationMs = Math.max(0, nowMs(runtime) - attemptStartAtMs);
        normalizedError.attemptIndex = attemptIndex;
      }
      attemptFailures.push(normalizeAttemptFailure(error, provider));
      const isLastAttempt = attemptFailures.length >= requestedExecutionProviders.length;
      if (!isLastAttempt) {
        continue;
      }

      if (requestedExecutionProviders.length > 1) {
        throw createInitializationError({
          errorCode: RUNTIME_INIT_ERROR_CODES.PROVIDER_FALLBACK_EXHAUSTED,
          stepId: error?.stepId || 'gmnet-smoke-run',
          message: error?.message || 'GMNet startup attempts were exhausted.',
          userMessage: 'GMNet startup failed across all available runtimes.',
          diagnostics: {
            requestedExecutionProviders,
            resolvedExecutionProvider: normalizeExecutionProvider(
              error?.diagnostics?.resolvedExecutionProvider || resolvedExecutionProvider,
            ),
            attemptFailures,
            forcedExecutionProviders,
            offlineStartup,
            preferCompatibilityStartup,
          },
          cause: error,
          runtime,
        });
      }

      if (error?.name === 'RuntimeInitializationError') {
        error.diagnostics = {
          ...(error.diagnostics || {}),
          requestedExecutionProviders,
          attemptFailures,
          forcedExecutionProviders,
          offlineStartup,
          preferCompatibilityStartup,
        };
      }

      throw error;
    }
  }

  if (!resolvedExecutionProvider) {
    throw createInitializationError({
      errorCode: RUNTIME_INIT_ERROR_CODES.PROVIDER_FALLBACK_EXHAUSTED,
      stepId: 'gmnet-provider-verify',
      message: 'GMNet runtime initialization did not resolve an execution provider.',
      userMessage: 'GMNet runtime initialization failed.',
      diagnostics: {
        requestedExecutionProviders,
        attemptFailures,
        forcedExecutionProviders,
        offlineStartup,
        preferCompatibilityStartup,
      },
      runtime,
    });
  }

  await runStep({
    stepId: 'startup-ready',
    runningNote: 'Finalizing startup checks...',
    successNote: 'Startup runtime checks complete.',
    onProgress,
    runtime,
    errorCode: RUNTIME_INIT_ERROR_CODES.ONNX_FAILED,
    userMessage: 'Startup checks did not complete successfully.',
    fn: async () => { },
  });

  return {
    requestedExecutionProviders,
    resolvedExecutionProvider,
    gmnetCapability,
    smokeAssetUrl,
    attemptFailures,
    forcedExecutionProviders,
    offlineStartup,
    preferCompatibilityStartup,
  };
}
