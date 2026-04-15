/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __getShareStoreMemorySnapshotForTests,
  __setPersistedQueueInputRecordForTests,
  __resetShareStoreForTests,
  __setCanUseIndexedDbForTests,
  __setQueueArtifactRetentionPolicyForTests,
  clearSessionQueuePayloads,
  deleteQueuePayloads,
  getQueueInputFile,
  getQueueOutputBlob,
  getQueuePreviewBlob,
  normalizePersistedQueueState,
  shouldPauseForStorageWrite,
  storeQueueInputFile,
  storeQueueOutputBlob,
  storeQueuePreviewBlob,
} from '../share-store.ts';

describe('share-store queue payloads', () => {
  beforeEach(() => {
    __resetShareStoreForTests();
    __setCanUseIndexedDbForTests(false);
    __setQueueArtifactRetentionPolicyForTests(null);
    vi.restoreAllMocks();
  });

  it('stores and loads typed queue input, output, and preview payloads by queue id', async () => {
    const input = new File(['input'], 'photo.jpg', { type: 'image/jpeg' });
    const output = new Blob(['output'], { type: 'image/jpeg' });
    const preview = new Blob(['preview'], { type: 'image/jpeg' });

    await storeQueueInputFile(10, input);
    await storeQueueOutputBlob(10, output);
    await storeQueuePreviewBlob(10, preview);

    const storedInput = await getQueueInputFile(10);
    const storedOutput = await getQueueOutputBlob(10);
    const storedPreview = await getQueuePreviewBlob(10);

    expect(storedInput).toBeInstanceOf(File);
    expect(storedInput?.name).toBe('photo.jpg');
    expect(await storedOutput?.text()).toBe('output');
    expect(await storedPreview?.text()).toBe('preview');
  });

  it('reconstructs a queued File from a persisted blob-backed record', async () => {
    __setCanUseIndexedDbForTests(true);
    __setPersistedQueueInputRecordForTests(21, {
      name: 'photo.heic',
      type: 'image/heic',
      lastModified: 1234,
      blob: new Blob(['heic-bytes'], { type: 'image/heic' }),
    });

    const storedInput = await getQueueInputFile(21);

    expect(storedInput).toBeInstanceOf(File);
    expect(storedInput?.name).toBe('photo.heic');
    expect(storedInput?.type).toBe('image/heic');
    expect(storedInput?.lastModified).toBe(1234);
    expect(await storedInput?.text()).toBe('heic-bytes');
  });

  it('does not mirror queue payload blobs in JS memory on low-memory iPhone policy after persisted writes succeed', async () => {
    __setCanUseIndexedDbForTests(true);
    __setQueueArtifactRetentionPolicyForTests('low-memory-ios');

    await storeQueueInputFile(10, new File(['input'], 'photo.jpg', { type: 'image/jpeg' }));
    await storeQueueOutputBlob(10, new Blob(['output'], { type: 'image/jpeg' }));
    await storeQueuePreviewBlob(10, new Blob(['preview'], { type: 'image/jpeg' }));

    const memory = __getShareStoreMemorySnapshotForTests();

    expect(memory.queueInputs.has(10)).toBe(false);
    expect(memory.queueOutputs.has(10)).toBe(false);
    expect(memory.queueInputPreviews.has(10)).toBe(false);
  });

  it('keeps mirroring queue payload blobs in JS memory when persisted storage is unavailable', async () => {
    __setCanUseIndexedDbForTests(false);
    __setQueueArtifactRetentionPolicyForTests('low-memory-ios');

    await storeQueueInputFile(11, new File(['input'], 'photo.jpg', { type: 'image/jpeg' }));
    await storeQueueOutputBlob(11, new Blob(['output'], { type: 'image/jpeg' }));
    await storeQueuePreviewBlob(11, new Blob(['preview'], { type: 'image/jpeg' }));

    const memory = __getShareStoreMemorySnapshotForTests();

    expect(memory.queueInputs.has(11)).toBe(true);
    expect(memory.queueOutputs.has(11)).toBe(true);
    expect(memory.queueInputPreviews.has(11)).toBe(true);
  });

  it('keeps queue payloads readable from the memory fallback when low-memory iPhone IndexedDB writes fail', async () => {
    __setCanUseIndexedDbForTests(true);
    __setQueueArtifactRetentionPolicyForTests('low-memory-ios');

    const originalUserAgent = navigator.userAgent;
    const originalIndexedDb = globalThis.indexedDB;

    try {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/605.1.15',
      });
      Object.defineProperty(globalThis, 'indexedDB', {
        configurable: true,
        value: {
          open() {
            throw new DOMException('Synthetic IndexedDB failure', 'InvalidStateError');
          },
        },
      });

      const input = new File(['input'], 'photo.jpg', { type: 'image/jpeg' });
      const output = new Blob(['output'], { type: 'image/jpeg' });
      const preview = new Blob(['preview'], { type: 'image/jpeg' });

      await storeQueueInputFile(12, input);
      await storeQueueOutputBlob(12, output);
      await storeQueuePreviewBlob(12, preview);

      const storedInput = await getQueueInputFile(12);
      const storedOutput = await getQueueOutputBlob(12);
      const storedPreview = await getQueuePreviewBlob(12);
      const memory = __getShareStoreMemorySnapshotForTests();

      expect(storedInput).toBeInstanceOf(File);
      expect(storedInput?.name).toBe('photo.jpg');
      expect(await storedOutput?.text()).toBe('output');
      expect(await storedPreview?.text()).toBe('preview');
      expect(memory.queueInputs.has(12)).toBe(true);
      expect(memory.queueOutputs.has(12)).toBe(true);
      expect(memory.queueInputPreviews.has(12)).toBe(true);
    } finally {
      Object.defineProperty(navigator, 'userAgent', {
        configurable: true,
        value: originalUserAgent,
      });
      Object.defineProperty(globalThis, 'indexedDB', {
        configurable: true,
        value: originalIndexedDb,
      });
    }
  });

  it('deletes one queue item payload set without affecting others', async () => {
    await storeQueueInputFile(1, new File(['one'], 'one.jpg', { type: 'image/jpeg' }));
    await storeQueueOutputBlob(1, new Blob(['one-out'], { type: 'image/jpeg' }));
    await storeQueuePreviewBlob(1, new Blob(['one-preview'], { type: 'image/jpeg' }));

    await storeQueueInputFile(2, new File(['two'], 'two.jpg', { type: 'image/jpeg' }));
    await storeQueueOutputBlob(2, new Blob(['two-out'], { type: 'image/jpeg' }));
    await storeQueuePreviewBlob(2, new Blob(['two-preview'], { type: 'image/jpeg' }));

    await deleteQueuePayloads(1);

    expect(await getQueueInputFile(1)).toBeNull();
    expect(await getQueueOutputBlob(1)).toBeNull();
    expect(await getQueuePreviewBlob(1)).toBeNull();

    expect((await getQueueInputFile(2))?.name).toBe('two.jpg');
    expect(await (await getQueueOutputBlob(2))?.text()).toBe('two-out');
    expect(await (await getQueuePreviewBlob(2))?.text()).toBe('two-preview');
  });

  it('clears all session queue payloads explicitly', async () => {
    await storeQueueInputFile(1, new File(['one'], 'one.jpg', { type: 'image/jpeg' }));
    await storeQueueOutputBlob(1, new Blob(['one-out'], { type: 'image/jpeg' }));
    await storeQueuePreviewBlob(1, new Blob(['one-preview'], { type: 'image/jpeg' }));

    await storeQueueInputFile(2, new File(['two'], 'two.jpg', { type: 'image/jpeg' }));
    await storeQueueOutputBlob(2, new Blob(['two-out'], { type: 'image/jpeg' }));
    await storeQueuePreviewBlob(2, new Blob(['two-preview'], { type: 'image/jpeg' }));

    await clearSessionQueuePayloads();

    expect(await getQueueInputFile(1)).toBeNull();
    expect(await getQueueOutputBlob(1)).toBeNull();
    expect(await getQueuePreviewBlob(1)).toBeNull();
    expect(await getQueueInputFile(2)).toBeNull();
    expect(await getQueueOutputBlob(2)).toBeNull();
    expect(await getQueuePreviewBlob(2)).toBeNull();
  });

  it('returns pause=true when a queued write would exceed safe storage headroom', async () => {
    const getStorageBudget = vi.fn(async () => ({
      supported: true,
      usage: 90,
      quota: 100,
      remaining: 10,
      usageRatio: 0.9,
      persisted: true,
    }));

    const decision = await shouldPauseForStorageWrite(8, {
      getStorageBudget,
      reserveBytes: 5,
      minFreeRatio: 0.05,
    });

    expect(decision).toEqual({
      pause: true,
      remaining: 10,
      requiredBytes: 8,
    });
  });

  it('rejects malformed persisted queue snapshots during normalization', () => {
    expect(
      normalizePersistedQueueState({
        workflowState: 'PROCESSING_ACTIVE',
        queue: [{ id: 'bad-id', name: 'photo.jpg', status: 'queued' }],
      }),
    ).toBeNull();
  });
});
