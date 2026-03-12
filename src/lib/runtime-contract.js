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
  'gmnet-smoke-run': 'Run GMNet smoke test',
  'startup-ready': 'Finalize startup readiness',
});

export const RUNTIME_INIT_ERROR_CODES = Object.freeze({
  ONNX_FAILED: 'RUNTIME_INIT_ONNX_FAILED',
  WEBGPU_UNAVAILABLE: 'RUNTIME_INIT_WEBGPU_UNAVAILABLE',
  NO_COMPATIBLE_GPU_PROVIDER: 'RUNTIME_INIT_NO_COMPATIBLE_GPU_PROVIDER',
  PROVIDER_MISMATCH: 'RUNTIME_INIT_PROVIDER_MISMATCH',
  PROVIDER_FALLBACK_EXHAUSTED: 'RUNTIME_INIT_PROVIDER_FALLBACK_EXHAUSTED',
  SMOKE_ASSET_FAILED: 'RUNTIME_INIT_SMOKE_ASSET_FAILED',
  SMOKE_INFERENCE_FAILED: 'RUNTIME_INIT_SMOKE_INFERENCE_FAILED',
  OFFLINE_BUNDLE_NOT_READY: 'RUNTIME_INIT_OFFLINE_BUNDLE_NOT_READY',
  BUNDLE_VALIDATION_FAILED: 'RUNTIME_INIT_BUNDLE_VALIDATION_FAILED',
  BUNDLE_REPAIR_FAILED: 'RUNTIME_INIT_BUNDLE_REPAIR_FAILED',
});

export function normalizeExecutionProvider(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  return normalized || null;
}

export function sanitizeRuntimeInitOptions(rawOptions) {
  if (!rawOptions || typeof rawOptions !== 'object') {
    return {};
  }

  const normalized = {};

  if (rawOptions.preferCompatibilityStartup === true) {
    normalized.preferCompatibilityStartup = true;
  }

  if (typeof rawOptions.smokeAssetPath === 'string') {
    const smokeAssetPath = rawOptions.smokeAssetPath.trim();
    if (smokeAssetPath.length > 0) {
      normalized.smokeAssetPath = smokeAssetPath;
    }
  }

  if (typeof rawOptions.modelVariant === 'string') {
    const modelVariant = rawOptions.modelVariant.trim();
    if (modelVariant.length > 0) {
      normalized.modelVariant = modelVariant;
    }
  }

  const forceSmokeFailure = rawOptions.forceSmokeFailure;
  if (
    forceSmokeFailure === true
    || forceSmokeFailure === 1
    || forceSmokeFailure === '1'
    || (typeof forceSmokeFailure === 'string' && forceSmokeFailure.trim().toLowerCase() === 'true')
  ) {
    normalized.forceSmokeFailure = true;
  }

  if (rawOptions.allowWasmOnly === false) {
    normalized.allowWasmOnly = false;
  }

  if (Array.isArray(rawOptions.forceExecutionProviders) && rawOptions.forceExecutionProviders.length > 0) {
    normalized.forceExecutionProviders = rawOptions.forceExecutionProviders.filter(
      (provider) => typeof provider === 'string' && provider.trim().length > 0,
    );
  }

  if (Array.isArray(rawOptions.smokeBypassProviders) && rawOptions.smokeBypassProviders.length > 0) {
    const smokeBypassProviders = rawOptions.smokeBypassProviders
      .map((provider) => normalizeExecutionProvider(provider))
      .filter(Boolean);
    if (smokeBypassProviders.length > 0) {
      normalized.smokeBypassProviders = Array.from(new Set(smokeBypassProviders));
    }
  }

  return normalized;
}
