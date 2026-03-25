/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  __resetShareStoreForTests,
  clearSessionQueuePayloads,
  deleteQueuePayloads,
  getQueueInputFile,
  getQueueOutputBlob,
  getQueuePreviewBlob,
  shouldPauseForStorageWrite,
  storeQueueInputFile,
  storeQueueOutputBlob,
  storeQueuePreviewBlob,
} from '../share-store.ts';

describe('share-store queue payloads', () => {
  beforeEach(() => {
    __resetShareStoreForTests();
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
});
