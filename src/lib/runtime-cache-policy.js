import { normalizeExecutionProvider } from './runtime-contract.js';

export const STARTUP_CAPABILITY_CACHE_KEY = 'ultrahdr:runtime-startup-cache:v1';
export const STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS = 86_400_000;

export function normalizeStartupCapabilityCacheTtlMs(
  value,
  defaultTtlMs = STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS,
) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return defaultTtlMs;
  }
  return Math.floor(numeric);
}

export function buildStartupCapabilityCacheEntry(resolvedExecutionProvider, nowMs, context) {
  const provider = normalizeExecutionProvider(resolvedExecutionProvider);
  if (!provider) {
    return null;
  }
  return {
    updatedAtMs: nowMs,
    resolvedExecutionProvider: provider,
    ...context,
  };
}

export function parseStartupCapabilityCacheEntry(
  raw,
  {
    nowMs = Date.now(),
    ttlMs = STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS,
    expectedContext,
  } = {},
) {
  if (ttlMs <= 0) {
    return null;
  }
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const updatedAtMs = Number(parsed.updatedAtMs);
    if (!Number.isFinite(updatedAtMs)) {
      return null;
    }
    if ((nowMs - updatedAtMs) > ttlMs) {
      return null;
    }

    if (
      expectedContext
      && (
        parsed.userAgent !== expectedContext.userAgent
        || parsed.appVersion !== expectedContext.appVersion
        || parsed.assetVersion !== expectedContext.assetVersion
        || parsed.wasmAssetVersion !== expectedContext.wasmAssetVersion
      )
    ) {
      return null;
    }

    const provider = normalizeExecutionProvider(parsed.resolvedExecutionProvider);
    if (!provider) {
      return null;
    }

    return {
      provider,
      updatedAtMs,
    };
  } catch {
    return null;
  }
}

export function readStartupCapabilityCache(
  runtime = globalThis,
  {
    ttlMs = STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS,
    cacheKey = STARTUP_CAPABILITY_CACHE_KEY,
    expectedContext,
  } = {},
) {
  if (ttlMs <= 0) {
    return null;
  }
  const storage = runtime?.localStorage;
  if (!storage || typeof storage.getItem !== 'function') {
    return null;
  }
  const raw = storage.getItem(cacheKey);
  return parseStartupCapabilityCacheEntry(raw, {
    nowMs: Date.now(),
    ttlMs,
    expectedContext,
  });
}

export function writeStartupCapabilityCache(
  resolvedExecutionProvider,
  runtime = globalThis,
  {
    ttlMs = STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS,
    cacheKey = STARTUP_CAPABILITY_CACHE_KEY,
    context,
    nowMs = Date.now(),
  } = {},
) {
  if (ttlMs <= 0) {
    return;
  }
  const storage = runtime?.localStorage;
  if (!storage || typeof storage.setItem !== 'function') {
    return;
  }

  const entry = buildStartupCapabilityCacheEntry(resolvedExecutionProvider, nowMs, context);
  if (!entry) {
    return;
  }

  try {
    storage.setItem(cacheKey, JSON.stringify(entry));
  } catch {
    // Best-effort persistence only.
  }
}
