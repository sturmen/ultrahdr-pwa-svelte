import {
  getStorageBudget,
  requestPersistentStorage,
  shouldCheckpoint,
} from './storage-diagnostics.js';

const DB_NAME = 'ultrahdr-gmnet-checkpoints';
const DB_VERSION = 1;
const STORE_NAME = 'snapshots';
const MEMORY_STORE_KEY = '__ultrahdrGmnetCheckpointStoreMemory';
const DEFAULT_CHUNK_SIZE_FLOATS = 262_144;
const DEFAULT_RETENTION_TTL_MS = 24 * 60 * 60 * 1000;

function canUseIndexedDb(runtime = globalThis) {
  return (
    typeof runtime?.indexedDB !== 'undefined'
    && typeof runtime.indexedDB?.open === 'function'
  );
}

function getMemoryStore(runtime = globalThis) {
  if (!runtime[MEMORY_STORE_KEY]) {
    runtime[MEMORY_STORE_KEY] = new Map();
  }
  return runtime[MEMORY_STORE_KEY];
}

function toUint8Array(value) {
  if (value instanceof Uint8Array) {
    return value;
  }
  if (Array.isArray(value)) {
    return new Uint8Array(value);
  }
  return new Uint8Array(0);
}

function toFloat32Array(value) {
  if (value instanceof Float32Array) {
    return value;
  }
  if (Array.isArray(value)) {
    return new Float32Array(value);
  }
  return new Float32Array(0);
}

function cloneArrayBuffer(arrayBuffer) {
  if (!(arrayBuffer instanceof ArrayBuffer)) {
    return new ArrayBuffer(0);
  }
  return arrayBuffer.slice(0);
}

export class GMNetCheckpointStore {
  constructor({
    runtime = globalThis,
    dbName = DB_NAME,
    storeName = STORE_NAME,
    chunkSizeFloats = DEFAULT_CHUNK_SIZE_FLOATS,
    retentionTtlMs = DEFAULT_RETENTION_TTL_MS,
    now = () => Date.now(),
  } = {}) {
    this.runtime = runtime;
    this.dbName = dbName;
    this.storeName = storeName;
    this.chunkSizeFloats = Math.max(1, Math.floor(Number(chunkSizeFloats) || DEFAULT_CHUNK_SIZE_FLOATS));
    this.retentionTtlMs = Math.max(0, Math.floor(Number(retentionTtlMs) || 0));
    this.now = typeof now === 'function' ? now : () => Date.now();
    this.openDbPromise = null;
  }

  async saveSnapshot(checkpointKey, snapshot) {
    if (typeof checkpointKey !== 'string' || checkpointKey.trim().length === 0) {
      throw new Error('GMNet checkpoint key is required.');
    }

    const normalizedSnapshot = snapshot && typeof snapshot === 'object' ? snapshot : {};
    const tileCompleted = toUint8Array(normalizedSnapshot.tileCompleted);
    const accumIngm = toFloat32Array(normalizedSnapshot.accumIngm);
    const chunks = [];
    let accumBytes = 0;
    for (let start = 0; start < accumIngm.length; start += this.chunkSizeFloats) {
      const end = Math.min(accumIngm.length, start + this.chunkSizeFloats);
      const chunk = accumIngm.slice(start, end);
      const chunkBuffer = cloneArrayBuffer(chunk.buffer);
      accumBytes += chunkBuffer.byteLength;
      chunks.push(chunkBuffer);
    }

    const tileCompletedBytes = tileCompleted.byteLength;
    const snapshotBytes = tileCompletedBytes + accumBytes;

    const record = {
      checkpointKey,
      sourceWidth: Number(normalizedSnapshot.sourceWidth) || 0,
      sourceHeight: Number(normalizedSnapshot.sourceHeight) || 0,
      tileTotal: Number(normalizedSnapshot.tileTotal) || 0,
      completedTileCount: Number(normalizedSnapshot.completedTileCount) || 0,
      tileCompleted: cloneArrayBuffer(tileCompleted.slice().buffer),
      accumChunks: chunks,
      chunkSizeFloats: this.chunkSizeFloats,
      savedAtMs: this.now(),
    };

    await requestPersistentStorage(this.runtime);
    const storageBudget = await getStorageBudget(this.runtime);
    if (
      storageBudget?.supported
      && !shouldCheckpoint(snapshotBytes, storageBudget, {
        reserveBytes: 16 * 1024 * 1024,
        minFreeRatio: 0.1,
      })
    ) {
      return;
    }

    await this.pruneExpiredSnapshots(record.savedAtMs);

    if (!canUseIndexedDb(this.runtime)) {
      const memoryStore = getMemoryStore(this.runtime);
      memoryStore.set(checkpointKey, record);
      return;
    }

    const db = await this.openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeName], 'readwrite');
      tx.objectStore(this.storeName).put(record, checkpointKey);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async loadSnapshot(checkpointKey) {
    if (typeof checkpointKey !== 'string' || checkpointKey.trim().length === 0) {
      return null;
    }

    let record = null;
    if (!canUseIndexedDb(this.runtime)) {
      record = getMemoryStore(this.runtime).get(checkpointKey) || null;
    } else {
      const db = await this.openDb();
      record = await new Promise((resolve, reject) => {
        const tx = db.transaction([this.storeName], 'readonly');
        const request = tx.objectStore(this.storeName).get(checkpointKey);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    }

    if (!record || typeof record !== 'object') {
      return null;
    }

    const tileCompleted = new Uint8Array(cloneArrayBuffer(record.tileCompleted));
    const chunkBuffers = Array.isArray(record.accumChunks)
      ? record.accumChunks.map((chunk) => cloneArrayBuffer(chunk))
      : [];
    const totalFloats = chunkBuffers.reduce(
      (sum, chunk) => sum + Math.floor(chunk.byteLength / Float32Array.BYTES_PER_ELEMENT),
      0,
    );
    const accumIngm = new Float32Array(totalFloats);
    let cursor = 0;
    for (const chunkBuffer of chunkBuffers) {
      const chunkArray = new Float32Array(chunkBuffer);
      accumIngm.set(chunkArray, cursor);
      cursor += chunkArray.length;
    }

    return {
      sourceWidth: Number(record.sourceWidth) || 0,
      sourceHeight: Number(record.sourceHeight) || 0,
      tileTotal: Number(record.tileTotal) || 0,
      completedTileCount: Number(record.completedTileCount) || 0,
      tileCompleted,
      accumIngm,
      chunkCount: chunkBuffers.length,
      savedAtMs: Number(record.savedAtMs) || 0,
    };
  }

  async clearSnapshot(checkpointKey) {
    if (typeof checkpointKey !== 'string' || checkpointKey.trim().length === 0) {
      return;
    }
    if (!canUseIndexedDb(this.runtime)) {
      getMemoryStore(this.runtime).delete(checkpointKey);
      return;
    }
    const db = await this.openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeName], 'readwrite');
      tx.objectStore(this.storeName).delete(checkpointKey);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async openDb() {
    if (this.openDbPromise) {
      return this.openDbPromise;
    }
    this.openDbPromise = new Promise((resolve, reject) => {
      const request = this.runtime.indexedDB.open(this.dbName, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        this.openDbPromise = null;
        reject(request.error);
      };
    });
    return this.openDbPromise;
  }

  async pruneExpiredSnapshots(nowMs = this.now()) {
    if (this.retentionTtlMs <= 0) {
      return;
    }

    const cutoffMs = Number(nowMs) - this.retentionTtlMs;
    if (!Number.isFinite(cutoffMs)) {
      return;
    }

    if (!canUseIndexedDb(this.runtime)) {
      const memoryStore = getMemoryStore(this.runtime);
      for (const [checkpointKey, record] of memoryStore.entries()) {
        const savedAtMs = Number(record?.savedAtMs) || 0;
        if (savedAtMs > 0 && savedAtMs < cutoffMs) {
          memoryStore.delete(checkpointKey);
        }
      }
      return;
    }

    const db = await this.openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const cursorRequest = store.openCursor();
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) {
          return;
        }
        const savedAtMs = Number(cursor.value?.savedAtMs) || 0;
        if (savedAtMs > 0 && savedAtMs < cutoffMs) {
          cursor.delete();
        }
        cursor.continue();
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
