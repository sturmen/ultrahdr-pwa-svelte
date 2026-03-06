import { describe, expect, it, vi } from 'vitest';

describe('processing wrapper main-thread isolation', () => {
  it('does not eagerly import processing-core from processing.js', async () => {
    vi.resetModules();
    vi.doMock('../processing-core.js', () => {
      throw new Error('processing-core should not be imported by processing.js');
    });

    await expect(import('../processing.js')).resolves.toEqual(
      expect.objectContaining({
        createProcessingRuntime: expect.any(Function),
      }),
    );
  });
});
