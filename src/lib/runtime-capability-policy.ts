import { isFirefoxRuntime, isSafariLikeRuntime } from './runtime-detection.ts';
import { normalizeExecutionProvider } from './runtime-contract.ts';

const DEFAULT_INFERENCE_TIMEOUT_MS = 180_000;
const FIREFOX_INFERENCE_TIMEOUT_MS = 600_000;
const SAFARI_LIKE_INFERENCE_TIMEOUT_MS = 600_000;
const WASM_INFERENCE_TIMEOUT_MS = 600_000;
const DEFAULT_WORKER_INIT_TIMEOUT_MS = 240_000;
const FIREFOX_WORKER_INIT_TIMEOUT_MS = 300_000;
const DEFAULT_WORKER_WASM_LOAD_TIMEOUT_MS = 20_000;
const SAFARI_LIKE_WORKER_WASM_LOAD_TIMEOUT_MS = 60_000;

type RuntimeLike = Partial<typeof globalThis> & {
  navigator?: Partial<Navigator> & { userAgent?: string };
};

type InferenceTimeoutOptions = {
  defaultTimeoutMs?: number;
  firefoxTimeoutMs?: number;
  safariLikeTimeoutMs?: number;
  wasmTimeoutMs?: number;
};

type WorkerInitTimeoutOptions = {
  defaultTimeoutMs?: number;
  firefoxTimeoutMs?: number;
};

type WorkerWasmLoadTimeoutOptions = {
  defaultTimeoutMs?: number;
  safariLikeTimeoutMs?: number;
};

export function canUseProcessingWorker(runtime: RuntimeLike = globalThis): boolean {
  return (
    typeof runtime?.Worker === 'function' &&
    typeof runtime?.fetch === 'function' &&
    typeof runtime?.ImageData !== 'undefined'
  );
}

export function resolveInferenceTimeoutMs(
  runtime: RuntimeLike = globalThis,
  executionProvider: string | null = null,
  {
    defaultTimeoutMs = DEFAULT_INFERENCE_TIMEOUT_MS,
    firefoxTimeoutMs = FIREFOX_INFERENCE_TIMEOUT_MS,
    safariLikeTimeoutMs = SAFARI_LIKE_INFERENCE_TIMEOUT_MS,
    wasmTimeoutMs = WASM_INFERENCE_TIMEOUT_MS,
  }: InferenceTimeoutOptions = {},
): number {
  if (normalizeExecutionProvider(executionProvider) === 'wasm') {
    return wasmTimeoutMs;
  }
  if (isFirefoxRuntime(runtime)) {
    return firefoxTimeoutMs;
  }
  if (isSafariLikeRuntime(runtime)) {
    return safariLikeTimeoutMs;
  }
  return defaultTimeoutMs;
}

export function resolveWorkerInitTimeoutMs(
  runtime: RuntimeLike = globalThis,
  {
    defaultTimeoutMs = DEFAULT_WORKER_INIT_TIMEOUT_MS,
    firefoxTimeoutMs = FIREFOX_WORKER_INIT_TIMEOUT_MS,
  }: WorkerInitTimeoutOptions = {},
): number {
  return isFirefoxRuntime(runtime) ? firefoxTimeoutMs : defaultTimeoutMs;
}

export function resolveWorkerWasmLoadTimeoutMs(
  runtime: RuntimeLike = globalThis,
  {
    defaultTimeoutMs = DEFAULT_WORKER_WASM_LOAD_TIMEOUT_MS,
    safariLikeTimeoutMs = SAFARI_LIKE_WORKER_WASM_LOAD_TIMEOUT_MS,
  }: WorkerWasmLoadTimeoutOptions = {},
): number {
  return isSafariLikeRuntime(runtime) ? safariLikeTimeoutMs : defaultTimeoutMs;
}
