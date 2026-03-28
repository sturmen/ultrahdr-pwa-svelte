const DEFAULT_RESERVE_BYTES = 16 * 1024 * 1024;
const DEFAULT_MIN_FREE_RATIO = 0.1;

export interface StorageBudget {
  supported: boolean;
  usage: number | null;
  quota: number | null;
  remaining: number | null;
  usageRatio: number | null;
  persisted: boolean | null;
}

export interface ShouldCheckpointOptions {
  reserveBytes?: number;
  minFreeRatio?: number;
}

interface StorageManagerLike {
  estimate?: () => Promise<{ usage?: number; quota?: number }>;
  persist?: () => Promise<boolean>;
  persisted?: () => Promise<boolean>;
}

interface RuntimeWithStorage {
  navigator?: {
    storage?: StorageManagerLike;
  };
}

function normalizeFiniteNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
}

function resolveStorage(runtime: RuntimeWithStorage = globalThis): StorageManagerLike | null {
  return runtime?.navigator?.storage ?? null;
}

export async function getStorageBudget(
  runtime: RuntimeWithStorage = globalThis,
): Promise<StorageBudget> {
  const storage = resolveStorage(runtime);
  if (!storage || typeof storage.estimate !== 'function') {
    return {
      supported: false,
      usage: null,
      quota: null,
      remaining: null,
      usageRatio: null,
      persisted: null,
    };
  }

  try {
    const estimate = await storage.estimate();
    const usage = normalizeFiniteNumber(estimate?.usage);
    const quota = normalizeFiniteNumber(estimate?.quota);
    const remaining =
      usage !== null && quota !== null ? Math.max(0, quota - usage) : null;
    const usageRatio = usage !== null && quota ? usage / quota : null;
    let persisted: boolean | null = null;

    if (typeof storage.persisted === 'function') {
      try {
        persisted = Boolean(await storage.persisted());
      } catch {
        persisted = null;
      }
    }

    return {
      supported: true,
      usage,
      quota,
      remaining,
      usageRatio,
      persisted,
    };
  } catch {
    return {
      supported: true,
      usage: null,
      quota: null,
      remaining: null,
      usageRatio: null,
      persisted: null,
    };
  }
}

export async function requestPersistentStorage(
  runtime: RuntimeWithStorage = globalThis,
): Promise<boolean> {
  const storage = resolveStorage(runtime);
  if (!storage || typeof storage.persist !== 'function') {
    return false;
  }

  try {
    return Boolean(await storage.persist());
  } catch {
    return false;
  }
}

export function shouldCheckpoint(
  snapshotBytes: number,
  budget: Partial<StorageBudget> | null = null,
  options: ShouldCheckpointOptions = {},
): boolean {
  const bytes = Math.max(0, Math.floor(Number(snapshotBytes) || 0));
  if (bytes === 0) {
    return true;
  }

  const usage = normalizeFiniteNumber(budget?.usage);
  const quota = normalizeFiniteNumber(budget?.quota);
  if (usage === null || quota === null || quota <= 0) {
    return true;
  }

  const remaining =
    normalizeFiniteNumber(budget?.remaining) ?? Math.max(0, quota - usage);
  const reserveBytes = Math.max(
    0,
    Math.floor(Number(options.reserveBytes) || DEFAULT_RESERVE_BYTES),
  );
  const minFreeRatio = Math.max(
    0,
    Math.min(0.95, Number(options.minFreeRatio) || DEFAULT_MIN_FREE_RATIO),
  );
  const minFreeBytes = Math.max(reserveBytes, Math.floor(quota * minFreeRatio));

  return remaining - bytes >= minFreeBytes;
}
