export const APP_MOUNT_COUNT_STORAGE_KEY = 'ultrahdr:app-mount-count:v1';

type RuntimeLike = typeof globalThis;

export type AppMountCounterSample = {
  mountCount: number;
  priorMountCount: number;
};

function getLocalStorage(runtime: RuntimeLike): Storage | null {
  try {
    const storage = (runtime as { localStorage?: Storage }).localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

function parsePersistedCount(raw: string | null): number {
  if (raw === null) {
    return 0;
  }
  const numeric = Number(raw);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }
  return Math.floor(numeric);
}

export function readAppMountCounter(runtime: RuntimeLike = globalThis): number {
  const storage = getLocalStorage(runtime);
  if (!storage) {
    return 0;
  }
  try {
    return parsePersistedCount(storage.getItem(APP_MOUNT_COUNT_STORAGE_KEY));
  } catch {
    return 0;
  }
}

export function bumpAppMountCounter(runtime: RuntimeLike = globalThis): AppMountCounterSample {
  const storage = getLocalStorage(runtime);
  if (!storage) {
    return { mountCount: 0, priorMountCount: 0 };
  }
  const priorMountCount = readAppMountCounter(runtime);
  const mountCount = priorMountCount + 1;
  try {
    storage.setItem(APP_MOUNT_COUNT_STORAGE_KEY, String(mountCount));
  } catch {
    // Storage write failed, but the mount still happened — surface it anyway.
  }
  return { mountCount, priorMountCount };
}
