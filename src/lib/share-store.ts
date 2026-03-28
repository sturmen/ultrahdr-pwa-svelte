import {
  getStorageBudget,
  requestPersistentStorage,
  shouldCheckpoint,
  type StorageBudget,
} from './storage-diagnostics.ts';

const DB_NAME = 'ultrahdr-share-store';
const DB_VERSION = 3;
const SHARED_FILES_STORE = 'shared-files';
const QUEUE_STATE_STORE = 'queue-state';
const QUEUE_INPUT_STORE = 'queue-inputs';
const QUEUE_OUTPUT_STORE = 'queue-outputs';
const QUEUE_PREVIEW_STORE = 'queue-previews';
const QUEUE_STATE_KEY = 'latest';
const MEMORY_STORE_KEY = '__ultrahdrShareStoreMemory';

interface ShareStoreMemory {
  sharedFiles: Blob[];
  queueState: unknown;
  queueInputs: Map<number, File>;
  queueOutputs: Map<number, Blob>;
  queuePreviews: Map<number, Blob>;
}

interface QueuePayloadDeleteOptions {
  deleteInput?: boolean;
  deleteOutput?: boolean;
  deletePreview?: boolean;
}

export type PersistedQueueStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'stale';

export type PersistedWorkflowState =
  | 'EMPTY'
  | 'QUEUE_READY'
  | 'PROCESSING_ACTIVE'
  | 'PROCESSING_PAUSING'
  | 'PROCESSING_PAUSED'
  | 'PROCESSING_DONE'
  | 'ERROR_RECOVERABLE';

export type PersistedProcessingPath = 'unknown' | 'generated' | 'preserved';

export interface PersistedQueueSnapshotItem {
  id: number;
  name: string;
  status: PersistedQueueStatus;
  settingsVersion: number;
  error: string | null;
  processingPath: PersistedProcessingPath;
}

export interface PersistedQueueSnapshot {
  workflowState: PersistedWorkflowState;
  settingsVersion: number;
  launchSource: string;
  hasPending: boolean;
  queue: PersistedQueueSnapshotItem[];
  updatedAt: number;
}

interface StorageWriteDecisionOptions {
  getStorageBudget?: (runtime?: typeof globalThis) => Promise<StorageBudget>;
  reserveBytes?: number;
  minFreeRatio?: number;
  runtime?: typeof globalThis;
}

export interface StorageWriteDecision {
  pause: boolean;
  remaining: number | null;
  requiredBytes: number;
}

let openDbPromise: Promise<IDBDatabase> | null = null;
const VALID_WORKFLOW_STATES = new Set<PersistedWorkflowState>([
  'EMPTY',
  'QUEUE_READY',
  'PROCESSING_ACTIVE',
  'PROCESSING_PAUSING',
  'PROCESSING_PAUSED',
  'PROCESSING_DONE',
  'ERROR_RECOVERABLE',
]);
const VALID_QUEUE_STATUSES = new Set<PersistedQueueStatus>([
  'queued',
  'processing',
  'completed',
  'failed',
  'cancelled',
  'stale',
]);
const VALID_PROCESSING_PATHS = new Set<PersistedProcessingPath>([
  'unknown',
  'generated',
  'preserved',
]);

function getMemoryStore(): ShareStoreMemory {
  const runtime = globalThis as typeof globalThis & {
    [MEMORY_STORE_KEY]?: ShareStoreMemory;
  };
  if (!runtime[MEMORY_STORE_KEY]) {
    runtime[MEMORY_STORE_KEY] = {
      sharedFiles: [],
      queueState: null,
      queueInputs: new Map<number, File>(),
      queueOutputs: new Map<number, Blob>(),
      queuePreviews: new Map<number, Blob>(),
    };
  }
  return runtime[MEMORY_STORE_KEY] as ShareStoreMemory;
}

function canUseIndexedDb(): boolean {
  if (/jsdom/i.test(globalThis?.navigator?.userAgent || '')) {
    return false;
  }
  return typeof indexedDB !== 'undefined' && typeof indexedDB.open === 'function';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeQueueSnapshotItem(
  value: unknown,
): PersistedQueueSnapshotItem | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const id = Number(value.id);
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const status =
    typeof value.status === 'string' && VALID_QUEUE_STATUSES.has(value.status as PersistedQueueStatus)
      ? (value.status as PersistedQueueStatus)
      : null;
  const settingsVersion = Number(value.settingsVersion);
  const error =
    value.error === null || typeof value.error === 'string' ? value.error : null;
  const processingPath =
    typeof value.processingPath === 'string' &&
    VALID_PROCESSING_PATHS.has(value.processingPath as PersistedProcessingPath)
      ? (value.processingPath as PersistedProcessingPath)
      : 'unknown';

  if (!Number.isInteger(id) || id < 0 || name.length === 0 || !status) {
    return null;
  }

  return {
    id,
    name,
    status,
    settingsVersion:
      Number.isInteger(settingsVersion) && settingsVersion > 0
        ? settingsVersion
        : 1,
    error,
    processingPath,
  };
}

export function normalizePersistedQueueState(
  value: unknown,
): PersistedQueueSnapshot | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const workflowState =
    typeof value.workflowState === 'string' &&
    VALID_WORKFLOW_STATES.has(value.workflowState as PersistedWorkflowState)
      ? (value.workflowState as PersistedWorkflowState)
      : null;
  const queue = Array.isArray(value.queue)
    ? value.queue
        .map((item) => normalizeQueueSnapshotItem(item))
        .filter((item): item is PersistedQueueSnapshotItem => item !== null)
    : null;
  const settingsVersion = Number(value.settingsVersion);
  const updatedAt = Number(value.updatedAt);

  if (
    !workflowState ||
    !queue ||
    queue.length !== value.queue.length ||
    !Number.isInteger(settingsVersion) ||
    settingsVersion < 1 ||
    !Number.isFinite(updatedAt)
  ) {
    return null;
  }

  return {
    workflowState,
    settingsVersion,
    launchSource:
      typeof value.launchSource === 'string' ? value.launchSource : 'regular',
    hasPending: Boolean(value.hasPending),
    queue,
    updatedAt,
  };
}

function resetCachedDb(): void {
  openDbPromise = null;
}

function openDb(): Promise<IDBDatabase> | null {
  if (!canUseIndexedDb()) {
    return null;
  }

  if (openDbPromise) {
    return openDbPromise;
  }

  openDbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SHARED_FILES_STORE)) {
        db.createObjectStore(SHARED_FILES_STORE, { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(QUEUE_STATE_STORE)) {
        db.createObjectStore(QUEUE_STATE_STORE);
      }
      if (!db.objectStoreNames.contains(QUEUE_INPUT_STORE)) {
        db.createObjectStore(QUEUE_INPUT_STORE);
      }
      if (!db.objectStoreNames.contains(QUEUE_OUTPUT_STORE)) {
        db.createObjectStore(QUEUE_OUTPUT_STORE);
      }
      if (!db.objectStoreNames.contains(QUEUE_PREVIEW_STORE)) {
        db.createObjectStore(QUEUE_PREVIEW_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      resetCachedDb();
      reject(request.error);
    };
  });

  return openDbPromise;
}

function cloneFiles(files: Blob[]): Blob[] {
  return Array.from(files || []).filter((file) => file instanceof Blob);
}

async function withObjectStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => void,
  fallback: () => T | Promise<T>,
): Promise<T> {
  if (!canUseIndexedDb()) {
    return fallback();
  }

  try {
    const db = await openDb();
    if (!db) {
      return fallback();
    }
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      let settled = false;
      let result: T;

      const finalize = (value: T) => {
        result = value;
      };

      transaction.oncomplete = () => {
        if (!settled) {
          settled = true;
          resolve(result);
        }
      };
      transaction.onerror = () => {
        if (!settled) {
          settled = true;
          reject(transaction.error);
        }
      };

      try {
        run(
          new Proxy(store, {
            get(target, property, receiver) {
              if (property === '__finalize') {
                return finalize;
              }
              return Reflect.get(target, property, receiver);
            },
          }) as IDBObjectStore,
        );
      } catch (error) {
        if (!settled) {
          settled = true;
          reject(error);
        }
      }
    });
  } catch {
    return fallback();
  }
}

type FinalizableStore = IDBObjectStore & { __finalize?: <T>(value: T) => void };

async function putBlobRecord(storeName: string, queueId: number, value: Blob): Promise<void> {
  const memory = getMemoryStore();
  await withObjectStore<void>(
    storeName,
    'readwrite',
    (rawStore) => {
      rawStore.put(value, queueId);
      (rawStore as FinalizableStore).__finalize?.(undefined);
    },
    () => {
      if (storeName === QUEUE_OUTPUT_STORE) {
        memory.queueOutputs.set(queueId, value);
      } else if (storeName === QUEUE_PREVIEW_STORE) {
        memory.queuePreviews.set(queueId, value);
      }
    },
  );
  if (storeName === QUEUE_OUTPUT_STORE) {
    memory.queueOutputs.set(queueId, value);
  } else if (storeName === QUEUE_PREVIEW_STORE) {
    memory.queuePreviews.set(queueId, value);
  }
}

async function getBlobRecord(storeName: string, queueId: number): Promise<Blob | null> {
  const memory = getMemoryStore();
  return withObjectStore<Blob | null>(
    storeName,
    'readonly',
    (rawStore) => {
      const request = rawStore.get(queueId);
      request.onsuccess = () => {
        (rawStore as FinalizableStore).__finalize?.((request.result as Blob | undefined) ?? null);
      };
      request.onerror = () => {
        (rawStore as FinalizableStore).__finalize?.(null);
      };
    },
    () => {
      if (storeName === QUEUE_OUTPUT_STORE) {
        return memory.queueOutputs.get(queueId) ?? null;
      }
      if (storeName === QUEUE_PREVIEW_STORE) {
        return memory.queuePreviews.get(queueId) ?? null;
      }
      return null;
    },
  );
}

async function putFileRecord(queueId: number, file: File): Promise<void> {
  const memory = getMemoryStore();
  await withObjectStore<void>(
    QUEUE_INPUT_STORE,
    'readwrite',
    (rawStore) => {
      rawStore.put(file, queueId);
      (rawStore as FinalizableStore).__finalize?.(undefined);
    },
    () => {
      memory.queueInputs.set(queueId, file);
    },
  );
  memory.queueInputs.set(queueId, file);
}

async function getFileRecord(queueId: number): Promise<File | null> {
  const memory = getMemoryStore();
  return withObjectStore<File | null>(
    QUEUE_INPUT_STORE,
    'readonly',
    (rawStore) => {
      const request = rawStore.get(queueId);
      request.onsuccess = () => {
        (rawStore as FinalizableStore).__finalize?.((request.result as File | undefined) ?? null);
      };
      request.onerror = () => {
        (rawStore as FinalizableStore).__finalize?.(null);
      };
    },
    () => memory.queueInputs.get(queueId) ?? null,
  );
}

async function clearStore(storeName: string): Promise<void> {
  const memory = getMemoryStore();
  await withObjectStore<void>(
    storeName,
    'readwrite',
    (rawStore) => {
      rawStore.clear();
      (rawStore as FinalizableStore).__finalize?.(undefined);
    },
    () => undefined,
  );

  if (storeName === QUEUE_INPUT_STORE) {
    memory.queueInputs.clear();
  } else if (storeName === QUEUE_OUTPUT_STORE) {
    memory.queueOutputs.clear();
  } else if (storeName === QUEUE_PREVIEW_STORE) {
    memory.queuePreviews.clear();
  } else if (storeName === SHARED_FILES_STORE) {
    memory.sharedFiles = [];
  } else if (storeName === QUEUE_STATE_STORE) {
    memory.queueState = null;
  }
}

async function deleteQueuePayloadRecords(
  queueId: number,
  options: QueuePayloadDeleteOptions = {},
): Promise<void> {
  const memory = getMemoryStore();
  const deleteInput = options.deleteInput !== false;
  const deleteOutput = options.deleteOutput !== false;
  const deletePreview = options.deletePreview !== false;

  const stores: string[] = [];
  if (deleteInput) stores.push(QUEUE_INPUT_STORE);
  if (deleteOutput) stores.push(QUEUE_OUTPUT_STORE);
  if (deletePreview) stores.push(QUEUE_PREVIEW_STORE);

  if (canUseIndexedDb()) {
    try {
      const db = await openDb();
      if (db && stores.length > 0) {
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(stores, 'readwrite');
          stores.forEach((storeName) => {
            transaction.objectStore(storeName).delete(queueId);
          });
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error);
        });
      }
    } catch {
      // Fall through to memory cleanup.
    }
  }

  if (deleteInput) memory.queueInputs.delete(queueId);
  if (deleteOutput) memory.queueOutputs.delete(queueId);
  if (deletePreview) memory.queuePreviews.delete(queueId);
}

export async function storeSharedFiles(files: Blob[]): Promise<void> {
  const normalizedFiles = cloneFiles(files);
  const totalBytes = normalizedFiles.reduce(
    (sum, file) => sum + (Number(file?.size) || 0),
    0,
  );

  await requestPersistentStorage(globalThis);
  const storageBudget = await getStorageBudget(globalThis);
  if (
    storageBudget?.supported &&
    !shouldCheckpoint(totalBytes, storageBudget, {
      reserveBytes: 8 * 1024 * 1024,
      minFreeRatio: 0.05,
    })
  ) {
    getMemoryStore().sharedFiles = normalizedFiles;
    return;
  }

  const memory = getMemoryStore();
  memory.sharedFiles = normalizedFiles;

  await withObjectStore<void>(
    SHARED_FILES_STORE,
    'readwrite',
    (rawStore) => {
      rawStore.clear();
      normalizedFiles.forEach((file) => {
        rawStore.add(file);
      });
      (rawStore as FinalizableStore).__finalize?.(undefined);
    },
    () => undefined,
  );
}

export async function consumeSharedFiles(): Promise<Blob[]> {
  const memory = getMemoryStore();
  if (!canUseIndexedDb()) {
    const files = memory.sharedFiles;
    memory.sharedFiles = [];
    return files;
  }

  try {
    const db = await openDb();
    if (!db) {
      const files = memory.sharedFiles;
      memory.sharedFiles = [];
      return files;
    }
    return await new Promise<Blob[]>((resolve, reject) => {
      const transaction = db.transaction([SHARED_FILES_STORE], 'readwrite');
      const store = transaction.objectStore(SHARED_FILES_STORE);
      const getAllRequest = store.getAll();
      let files: Blob[] = [];

      getAllRequest.onsuccess = () => {
        files = (getAllRequest.result as Blob[] | undefined) ?? [];
        store.clear();
      };
      getAllRequest.onerror = () => reject(getAllRequest.error);
      transaction.oncomplete = () => {
        memory.sharedFiles = [];
        resolve(files);
      };
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    const files = memory.sharedFiles;
    memory.sharedFiles = [];
    return files;
  }
}

export async function clearSharedFiles(): Promise<void> {
  await clearStore(SHARED_FILES_STORE);
}

export async function storeQueueState(queueState: unknown): Promise<void> {
  getMemoryStore().queueState = queueState;
  await withObjectStore<void>(
    QUEUE_STATE_STORE,
    'readwrite',
    (rawStore) => {
      rawStore.put(queueState, QUEUE_STATE_KEY);
      (rawStore as FinalizableStore).__finalize?.(undefined);
    },
    () => undefined,
  );
}

export async function loadQueueState<T = unknown>(): Promise<T | null> {
  return withObjectStore<T | null>(
    QUEUE_STATE_STORE,
    'readonly',
    (rawStore) => {
      const request = rawStore.get(QUEUE_STATE_KEY);
      request.onsuccess = () => {
        (rawStore as FinalizableStore).__finalize?.((request.result as T | undefined) ?? null);
      };
      request.onerror = () => {
        (rawStore as FinalizableStore).__finalize?.(null);
      };
    },
    () => (getMemoryStore().queueState as T | null) ?? null,
  );
}

export async function clearQueueState(): Promise<void> {
  getMemoryStore().queueState = null;
  await withObjectStore<void>(
    QUEUE_STATE_STORE,
    'readwrite',
    (rawStore) => {
      rawStore.delete(QUEUE_STATE_KEY);
      (rawStore as FinalizableStore).__finalize?.(undefined);
    },
    () => undefined,
  );
}

export async function storeQueueInputFile(queueId: number, file: File): Promise<void> {
  await putFileRecord(queueId, file);
}

export async function getQueueInputFile(queueId: number): Promise<File | null> {
  return getFileRecord(queueId);
}

export async function storeQueueOutputBlob(queueId: number, blob: Blob): Promise<void> {
  await putBlobRecord(QUEUE_OUTPUT_STORE, queueId, blob);
}

export async function getQueueOutputBlob(queueId: number): Promise<Blob | null> {
  return getBlobRecord(QUEUE_OUTPUT_STORE, queueId);
}

export async function storeQueuePreviewBlob(queueId: number, blob: Blob): Promise<void> {
  await putBlobRecord(QUEUE_PREVIEW_STORE, queueId, blob);
}

export async function getQueuePreviewBlob(queueId: number): Promise<Blob | null> {
  return getBlobRecord(QUEUE_PREVIEW_STORE, queueId);
}

export async function deleteQueuePayloads(
  queueId: number,
  options: QueuePayloadDeleteOptions = {},
): Promise<void> {
  await deleteQueuePayloadRecords(queueId, options);
}

export async function clearSessionQueuePayloads(): Promise<void> {
  await Promise.all([
    clearStore(QUEUE_INPUT_STORE),
    clearStore(QUEUE_OUTPUT_STORE),
    clearStore(QUEUE_PREVIEW_STORE),
  ]);
}

export async function shouldPauseForStorageWrite(
  requiredBytes: number,
  options: StorageWriteDecisionOptions = {},
): Promise<StorageWriteDecision> {
  const loadBudget = options.getStorageBudget ?? getStorageBudget;
  const budget = await loadBudget(options.runtime ?? globalThis);
  const pause = !shouldCheckpoint(requiredBytes, budget, {
    reserveBytes: options.reserveBytes,
    minFreeRatio: options.minFreeRatio,
  });

  return {
    pause,
    remaining: budget?.remaining ?? null,
    requiredBytes: Math.max(0, Math.floor(Number(requiredBytes) || 0)),
  };
}

export function __resetShareStoreForTests(): void {
  const runtime = globalThis as typeof globalThis & {
    [MEMORY_STORE_KEY]?: ShareStoreMemory;
  };
  delete runtime[MEMORY_STORE_KEY];
  resetCachedDb();
}
