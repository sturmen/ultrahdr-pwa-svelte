import { normalizeExecutionProvider } from './runtime-contract.ts';

export const STARTUP_CAPABILITY_CACHE_KEY = 'ultrahdr:runtime-startup-cache:v1';
export const STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS = 86_400_000;

export interface StartupCapabilityCacheContext {
  userAgent?: string;
  appVersion?: string;
  assetVersion?: string;
  wasmAssetVersion?: string;
}

export interface StartupCapabilityCacheEntry {
  updatedAtMs: number;
  resolvedExecutionProvider: string;
  userAgent?: string;
  appVersion?: string;
  assetVersion?: string;
  wasmAssetVersion?: string;
}

export interface ParsedStartupCapabilityCacheEntry {
  provider: string;
  updatedAtMs: number;
}

export function normalizeStartupCapabilityCacheTtlMs(
  value: unknown,
  defaultTtlMs = STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS,
): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return defaultTtlMs;
  }
  return Math.floor(numeric);
}

export function buildStartupCapabilityCacheEntry(
  resolvedExecutionProvider: unknown,
  nowMs: number,
  context: StartupCapabilityCacheContext = {},
): StartupCapabilityCacheEntry | null {
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
  raw: unknown,
  {
    nowMs = Date.now(),
    ttlMs = STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS,
    expectedContext,
  }: {
    nowMs?: number;
    ttlMs?: number;
    expectedContext?: StartupCapabilityCacheContext;
  } = {},
): ParsedStartupCapabilityCacheEntry | null {
  if (ttlMs <= 0) {
    return null;
  }
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StartupCapabilityCacheEntry> | null;
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
  runtime: Pick<Window & typeof globalThis, 'localStorage'> | typeof globalThis = globalThis,
  {
    ttlMs = STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS,
    cacheKey = STARTUP_CAPABILITY_CACHE_KEY,
    expectedContext,
  }: {
    ttlMs?: number;
    cacheKey?: string;
    expectedContext?: StartupCapabilityCacheContext;
  } = {},
): ParsedStartupCapabilityCacheEntry | null {
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
  resolvedExecutionProvider: unknown,
  runtime: Pick<Window & typeof globalThis, 'localStorage'> | typeof globalThis = globalThis,
  {
    ttlMs = STARTUP_CAPABILITY_CACHE_TTL_DEFAULT_MS,
    cacheKey = STARTUP_CAPABILITY_CACHE_KEY,
    context,
    nowMs = Date.now(),
  }: {
    ttlMs?: number;
    cacheKey?: string;
    context?: StartupCapabilityCacheContext;
    nowMs?: number;
  } = {},
): void {
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
