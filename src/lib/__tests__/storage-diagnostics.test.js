/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

import {
  getStorageBudget,
  requestPersistentStorage,
  shouldCheckpoint,
} from '../storage-diagnostics.js';

describe('storage-diagnostics', () => {
  it('returns normalized usage/quota/remaining values from navigator.storage.estimate()', async () => {
    const runtime = {
      navigator: {
        storage: {
          estimate: async () => ({
            usage: 200,
            quota: 1000,
          }),
          persisted: async () => true,
        },
      },
    };

    const budget = await getStorageBudget(runtime);
    expect(budget).toEqual(
      expect.objectContaining({
        supported: true,
        usage: 200,
        quota: 1000,
        remaining: 800,
        persisted: true,
      }),
    );
  });

  it('requests persistent storage when supported', async () => {
    const runtime = {
      navigator: {
        storage: {
          persist: async () => true,
        },
      },
    };

    await expect(requestPersistentStorage(runtime)).resolves.toBe(true);
  });

  it('rejects checkpoint persistence when free space would drop below reserve threshold', () => {
    const canPersist = shouldCheckpoint(
      256,
      {
        quota: 1000,
        usage: 900,
        remaining: 100,
      },
      {
        reserveBytes: 64,
        minFreeRatio: 0.05,
      },
    );

    expect(canPersist).toBe(false);
  });
});
