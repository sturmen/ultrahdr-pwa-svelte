import { normalizeExecutionProvider } from './runtime-contract.js';

const DEFAULT_INFERENCE_TIMEOUT_MS = 180_000;
const FIREFOX_INFERENCE_TIMEOUT_MS = 600_000;
const WASM_INFERENCE_TIMEOUT_MS = 600_000;
const DEFAULT_WORKER_INIT_TIMEOUT_MS = 240_000;
const FIREFOX_WORKER_INIT_TIMEOUT_MS = 300_000;

function isFirefoxRuntime(runtime = globalThis) {
  const userAgent = String(runtime?.navigator?.userAgent || '');
  return /firefox\//i.test(userAgent);
}

export function canUseProcessingWorker(runtime = globalThis) {
  return (
    typeof runtime?.Worker === 'function' &&
    typeof runtime?.OffscreenCanvas !== 'undefined' &&
    typeof runtime?.createImageBitmap === 'function' &&
    typeof runtime?.fetch === 'function' &&
    typeof runtime?.ImageData !== 'undefined'
  );
}

export function resolveInferenceTimeoutMs(
  runtime = globalThis,
  executionProvider = null,
  {
    defaultTimeoutMs = DEFAULT_INFERENCE_TIMEOUT_MS,
    firefoxTimeoutMs = FIREFOX_INFERENCE_TIMEOUT_MS,
    wasmTimeoutMs = WASM_INFERENCE_TIMEOUT_MS,
  } = {},
) {
  if (normalizeExecutionProvider(executionProvider) === 'wasm') {
    return wasmTimeoutMs;
  }
  return isFirefoxRuntime(runtime) ? firefoxTimeoutMs : defaultTimeoutMs;
}

export function resolveWorkerInitTimeoutMs(
  runtime = globalThis,
  {
    defaultTimeoutMs = DEFAULT_WORKER_INIT_TIMEOUT_MS,
    firefoxTimeoutMs = FIREFOX_WORKER_INIT_TIMEOUT_MS,
  } = {},
) {
  return isFirefoxRuntime(runtime) ? firefoxTimeoutMs : defaultTimeoutMs;
}
