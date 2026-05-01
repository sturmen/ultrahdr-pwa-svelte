import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('libheif browser adapter', () => {
  beforeEach(() => {
    vi.resetModules();
    delete globalThis.caches;
    vi.unstubAllGlobals();
  });

  it('returns an already-initialized libheif module object unchanged', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      'export default { HeifDecoder: class HeifDecoder {} };',
      {
        status: 200,
        headers: { 'Content-Type': 'text/javascript' },
      },
    )));

    const { default: createLibheif } = await import('../libheif-browser.js');
    const module = await createLibheif({ wasmBinary: new ArrayBuffer(0) });

    expect(module.HeifDecoder).toBeTypeOf('function');
  });

  it('loads the libheif bundle module from Cache Storage when network fetch fails', async () => {
    const cachedModuleSource = 'export default { HeifDecoder: class HeifDecoder {} };';
    const cachesMatch = vi.fn(async () => new Response(cachedModuleSource, {
      status: 200,
      headers: { 'Content-Type': 'text/javascript' },
    }));
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new TypeError('Importing a module script failed.');
    }));
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: {
        match: cachesMatch,
      },
    });

    const { default: createLibheif } = await import('../libheif-browser.js');
    const diagnosticsEvents = await import('../diagnostics-events.ts');

    const module = await createLibheif({ wasmBinary: new ArrayBuffer(0) });

    expect(module.HeifDecoder).toBeTypeOf('function');
    expect(diagnosticsEvents.getRecordedDiagnosticsEvents(globalThis)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: diagnosticsEvents.DIAGNOSTICS_EVENT_NAMES.runtimeAsset.libheifBundleModuleFetched,
          context: expect.objectContaining({
            assetId: 'libheif-bundle-mjs',
            cacheSource: 'cache',
          }),
        }),
      ]),
    );
    expect(cachesMatch).toHaveBeenCalledWith(
      'http://localhost:3000/assets/libheif-bundle.mjs?v=test-app-version',
    );
  });
});
