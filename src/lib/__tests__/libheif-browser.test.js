import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('libheif browser adapter', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns an already-initialized libheif module object unchanged', async () => {
    const initializedModule = { HeifDecoder: class HeifDecoder {} };

    vi.doMock('libheif-js/wasm-bundle.js', () => ({
      default: initializedModule,
      'module.exports': initializedModule,
    }));

    const { default: createLibheif } = await import('../libheif-browser.js');

    await expect(
      createLibheif({ wasmBinary: new ArrayBuffer(0) }),
    ).resolves.toBe(initializedModule);
  });
});
