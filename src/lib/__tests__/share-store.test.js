/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearSharedFiles,
  clearQueueState,
  consumeSharedFiles,
  loadQueueState,
  storeQueueState,
  storeSharedFiles,
  __resetShareStoreForTests
} from '../share-store.js';

describe('share-store', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    __resetShareStoreForTests();
    global.indexedDB = undefined;
    global.navigator = {
      ...(originalNavigator || {}),
      storage: {
        persist: async () => true,
      },
    };
  });

  afterEach(() => {
    global.navigator = originalNavigator;
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

  it('requests persistent storage before storing shared files when supported', async () => {
    const persist = vi.fn(async () => true);
    global.navigator = {
      ...(originalNavigator || {}),
      storage: {
        persist,
      },
    };

    await storeSharedFiles([new File(['a'], 'a.jpg', { type: 'image/jpeg' })]);

    expect(persist).toHaveBeenCalledTimes(1);
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

  it('clears persisted queue state explicitly', async () => {
    const queueState = {
      files: ['a.jpg'],
      createdAt: Date.now(),
      mode: 'paused'
    };

    await storeQueueState(queueState);
    await clearQueueState();
    const loaded = await loadQueueState();

    expect(loaded).toBeNull();
  });
});
