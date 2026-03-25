import { normalizeExecutionProvider } from './runtime-contract.js';

const DEFAULT_INFERENCE_TIMEOUT_MS = 180_000;
const FIREFOX_INFERENCE_TIMEOUT_MS = 600_000;
const WASM_INFERENCE_TIMEOUT_MS = 600_000;
const DEFAULT_WORKER_INIT_TIMEOUT_MS = 240_000;
const FIREFOX_WORKER_INIT_TIMEOUT_MS = 300_000;

type RuntimeLike = Partial<typeof globalThis> & {
  navigator?: Partial<Navigator> & { userAgent?: string };
};

type InferenceTimeoutOptions = {
  defaultTimeoutMs?: number;
  firefoxTimeoutMs?: number;
  wasmTimeoutMs?: number;
};

type WorkerInitTimeoutOptions = {
  defaultTimeoutMs?: number;
  firefoxTimeoutMs?: number;
};

function isFirefoxRuntime(runtime: RuntimeLike = globalThis): boolean {
  const userAgent = String(runtime?.navigator?.userAgent || '');
  return /firefox\//i.test(userAgent);
}

export function canUseProcessingWorker(runtime: RuntimeLike = globalThis): boolean {
  return (
    typeof runtime?.Worker === 'function' &&
    typeof runtime?.createImageBitmap === 'function' &&
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
    wasmTimeoutMs = WASM_INFERENCE_TIMEOUT_MS,
  }: InferenceTimeoutOptions = {},
): number {
  if (normalizeExecutionProvider(executionProvider) === 'wasm') {
    return wasmTimeoutMs;
  }
  return isFirefoxRuntime(runtime) ? firefoxTimeoutMs : defaultTimeoutMs;
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
