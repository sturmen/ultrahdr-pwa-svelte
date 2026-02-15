/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearSharedFiles,
  consumeSharedFiles,
  loadQueueState,
  storeQueueState,
  storeSharedFiles,
  __resetShareStoreForTests
} from '../share-store.js';

describe('share-store', () => {
  beforeEach(() => {
    __resetShareStoreForTests();
    global.indexedDB = undefined;
  });

  it('stores and consumes shared files in fallback mode', async () => {
    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' })
    ];

    await storeSharedFiles(files);
    const consumed = await consumeSharedFiles();

    expect(consumed).toHaveLength(2);
    expect(consumed.map((file) => file.name)).toEqual(['a.jpg', 'b.jpg']);
  });

  it('consume clears store after read', async () => {
    await storeSharedFiles([new File(['a'], 'a.jpg', { type: 'image/jpeg' })]);
    await consumeSharedFiles();

    const secondRead = await consumeSharedFiles();
    expect(secondRead).toEqual([]);
  });

  it('supports explicit clear operation', async () => {
    await storeSharedFiles([new File(['a'], 'a.jpg', { type: 'image/jpeg' })]);
    await clearSharedFiles();

    const consumed = await consumeSharedFiles();
    expect(consumed).toEqual([]);
  });

  it('persists queue state in fallback mode', async () => {
    const queueState = {
      files: ['a.jpg', 'b.jpg'],
      createdAt: Date.now(),
      mode: 'queued'
    };

    await storeQueueState(queueState);
    const loaded = await loadQueueState();

    expect(loaded).toEqual(queueState);
  });
});
