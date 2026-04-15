/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSharedDiagnosticsRecorder } from '../diagnostics.ts';
import { warmRuntimeForUpdatedAssetVersion } from '../runtime-post-update-warmup.ts';

describe('runtime post-update warmup', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete (window as typeof window & {
      __ultrahdrDiagnosticsRecorder?: ReturnType<typeof getSharedDiagnosticsRecorder>;
    }).__ultrahdrDiagnosticsRecorder;
  });

  it('warms jpegli and ultrahdr runtimes the first time a new asset version launches', async () => {
    const steps: string[] = [];
    const warmJpegli = vi.fn(async () => {
      steps.push('jpegli');
    });
    const warmUltraHdr = vi.fn(async () => {
      steps.push('ultrahdr');
      return true;
    });

    await warmRuntimeForUpdatedAssetVersion({
      assetVersion: 'asset-v2',
      runtime: window,
      loadJpegliBootstrap: async () => warmJpegli,
      loadUltraHdrBootstrap: async () => warmUltraHdr,
    });

    expect(steps).toEqual(['jpegli', 'ultrahdr']);
    expect(window.localStorage.getItem('ultrahdr:runtime-warmup-asset-version:v1')).toBe('asset-v2');

    const events = getSharedDiagnosticsRecorder(window).getEvents().map((event) => event.name);
    expect(events).toEqual(
      expect.arrayContaining([
        'asset-version-runtime-warmup-started',
        'asset-version-runtime-warmup-completed',
      ]),
    );
  });

  it('skips warmup when the asset version has already been warmed in this browser', async () => {
    window.localStorage.setItem('ultrahdr:runtime-warmup-asset-version:v1', 'asset-v2');
    const warmJpegli = vi.fn(async () => {});
    const warmUltraHdr = vi.fn(async () => true);

    await warmRuntimeForUpdatedAssetVersion({
      assetVersion: 'asset-v2',
      runtime: window,
      loadJpegliBootstrap: async () => warmJpegli,
      loadUltraHdrBootstrap: async () => warmUltraHdr,
    });

    expect(warmJpegli).not.toHaveBeenCalled();
    expect(warmUltraHdr).not.toHaveBeenCalled();
    expect(getSharedDiagnosticsRecorder(window).getEvents()).toEqual([]);
  });

  it('records a failure and leaves the version unwarmed when ultrahdr warmup fails', async () => {
    const warmJpegli = vi.fn(async () => {});
    const warmUltraHdr = vi.fn(async () => false);

    await expect(
      warmRuntimeForUpdatedAssetVersion({
        assetVersion: 'asset-v3',
        runtime: window,
        loadJpegliBootstrap: async () => warmJpegli,
        loadUltraHdrBootstrap: async () => warmUltraHdr,
      }),
    ).rejects.toThrow(/ultrahdr runtime warmup failed/i);

    expect(window.localStorage.getItem('ultrahdr:runtime-warmup-asset-version:v1')).toBeNull();
    const events = getSharedDiagnosticsRecorder(window).getEvents();
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'asset-version-runtime-warmup-started' }),
        expect.objectContaining({
          name: 'asset-version-runtime-warmup-failed',
          context: expect.objectContaining({
            assetVersion: 'asset-v3',
            errorCategory: 'ultrahdr-runtime-unavailable',
          }),
        }),
      ]),
    );
  });
});
