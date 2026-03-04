import {
  getStorageBudget,
  requestPersistentStorage,
  shouldCheckpoint,
} from './storage-diagnostics.js';

const DB_NAME = "ultrahdr-share-store";
const DB_VERSION = 2;
const SHARED_FILES_STORE = "shared-files";
const QUEUE_STATE_STORE = "queue-state";
const QUEUE_STATE_KEY = "latest";
const MEMORY_STORE_KEY = "__ultrahdrShareStoreMemory";

let openDbPromise = null;

function getMemoryStore() {
  if (!globalThis[MEMORY_STORE_KEY]) {
    globalThis[MEMORY_STORE_KEY] = {
      sharedFiles: [],
      queueState: null,
    };
  }
  return globalThis[MEMORY_STORE_KEY];
}

function canUseIndexedDb() {
  return typeof indexedDB !== "undefined" && typeof indexedDB.open === "function";
}

function resetCachedDb() {
  openDbPromise = null;
}

function openDb() {
  if (!canUseIndexedDb()) {
    return null;
  }

  if (openDbPromise) {
    return openDbPromise;
  }

  openDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SHARED_FILES_STORE)) {
        db.createObjectStore(SHARED_FILES_STORE, { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(QUEUE_STATE_STORE)) {
        db.createObjectStore(QUEUE_STATE_STORE);
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

function cloneFiles(files) {
  return Array.from(files || []).filter((file) => file instanceof Blob);
}

export async function storeSharedFiles(files) {
  const normalizedFiles = cloneFiles(files);
  const totalBytes = normalizedFiles.reduce(
    (sum, file) => sum + (Number(file?.size) || 0),
    0,
  );

  await requestPersistentStorage(globalThis);
  const storageBudget = await getStorageBudget(globalThis);
  if (
    storageBudget?.supported
    && !shouldCheckpoint(totalBytes, storageBudget, {
      reserveBytes: 8 * 1024 * 1024,
      minFreeRatio: 0.05,
    })
  ) {
    const memory = getMemoryStore();
    memory.sharedFiles = normalizedFiles;
    return;
  }

  if (!canUseIndexedDb()) {
    const memory = getMemoryStore();
    memory.sharedFiles = normalizedFiles;
    return;
  }

  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction([SHARED_FILES_STORE], "readwrite");
      const store = transaction.objectStore(SHARED_FILES_STORE);
      store.clear();

      normalizedFiles.forEach((file) => {
        store.add(file);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    const memory = getMemoryStore();
    memory.sharedFiles = normalizedFiles;
  }
}

export async function consumeSharedFiles() {
  if (!canUseIndexedDb()) {
    const memory = getMemoryStore();
    const files = memory.sharedFiles;
    memory.sharedFiles = [];
    return files;
  }

  const db = await openDb();
  return await new Promise((resolve, reject) => {
    const transaction = db.transaction([SHARED_FILES_STORE], "readwrite");
    const store = transaction.objectStore(SHARED_FILES_STORE);
    const getAllRequest = store.getAll();
    let files = [];

    getAllRequest.onsuccess = () => {
      files = getAllRequest.result || [];
      store.clear();
    };
    getAllRequest.onerror = () => reject(getAllRequest.error);

    transaction.oncomplete = () => resolve(files);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function clearSharedFiles() {
  if (!canUseIndexedDb()) {
    getMemoryStore().sharedFiles = [];
    return;
  }

  const db = await openDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction([SHARED_FILES_STORE], "readwrite");
    transaction.objectStore(SHARED_FILES_STORE).clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function storeQueueState(queueState) {
  if (!canUseIndexedDb()) {
    getMemoryStore().queueState = queueState;
    return;
  }

  const db = await openDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STATE_STORE], "readwrite");
    transaction.objectStore(QUEUE_STATE_STORE).put(queueState, QUEUE_STATE_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function loadQueueState() {
  if (!canUseIndexedDb()) {
    return getMemoryStore().queueState;
  }

  const db = await openDb();
  return await new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STATE_STORE], "readonly");
    const request = transaction.objectStore(QUEUE_STATE_STORE).get(QUEUE_STATE_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function clearQueueState() {
  if (!canUseIndexedDb()) {
    getMemoryStore().queueState = null;
    return;
  }

  const db = await openDb();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STATE_STORE], "readwrite");
    transaction.objectStore(QUEUE_STATE_STORE).delete(QUEUE_STATE_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export function __resetShareStoreForTests() {
  delete globalThis[MEMORY_STORE_KEY];
  resetCachedDb();
}
