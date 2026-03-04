/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';

import {
  acquireProcessingLock,
  releaseProcessingLock,
  __resetProcessingLocksForTests,
} from '../processing-lock.js';

describe('processing-lock', () => {
  it('returns true when navigator.locks is unsupported', async () => {
    const runtime = {};
    await expect(acquireProcessingLock({ runtime })).resolves.toBe(true);
    await expect(releaseProcessingLock({ runtime })).resolves.toBeUndefined();
  });

  it('prevents a second tab lock acquisition while one lock is held', async () => {
    __resetProcessingLocksForTests();
    let lockHeld = false;
    const runtime = {
      navigator: {
        locks: {
          request: vi.fn(async (_lockName, options, callback) => {
            if (options?.ifAvailable && lockHeld) {
              return callback(null);
            }
            lockHeld = true;
            try {
              return await callback({ name: 'ultrahdr:processing-queue' });
            } finally {
              lockHeld = false;
            }
          }),
        },
      },
    };

    await expect(acquireProcessingLock({ runtime })).resolves.toBe(true);
    await expect(acquireProcessingLock({ runtime: { navigator: runtime.navigator } })).resolves.toBe(false);
    await expect(releaseProcessingLock({ runtime })).resolves.toBeUndefined();

    await expect(acquireProcessingLock({ runtime })).resolves.toBe(true);
    await expect(releaseProcessingLock({ runtime })).resolves.toBeUndefined();
  });
});
