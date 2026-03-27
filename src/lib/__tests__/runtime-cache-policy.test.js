import { describe, expect, it } from 'vitest';
import {
  buildStartupCapabilityCacheEntry,
  normalizeStartupCapabilityCacheTtlMs,
  parseStartupCapabilityCacheEntry,
} from '../runtime-cache-policy.ts';

describe('runtime-cache-policy', () => {
  it('normalizes ttl values', () => {
    expect(normalizeStartupCapabilityCacheTtlMs(-1, 50)).toBe(50);
    expect(normalizeStartupCapabilityCacheTtlMs('90', 50)).toBe(90);
  });

  it('parses valid cache entries and rejects stale entries', () => {
    const expectedContext = {
      userAgent: 'ua',
      appVersion: 'a',
      assetVersion: 'b',
      wasmAssetVersion: 'c',
    };
    const raw = JSON.stringify({
      updatedAtMs: 1_000,
      resolvedExecutionProvider: 'WebGPU',
      ...expectedContext,
    });

    expect(
      parseStartupCapabilityCacheEntry(raw, {
        nowMs: 1_500,
        ttlMs: 1_000,
        expectedContext,
      }),
    ).toEqual({ provider: 'webgpu', updatedAtMs: 1_000 });

    expect(
      parseStartupCapabilityCacheEntry(raw, {
        nowMs: 3_000,
        ttlMs: 1_000,
        expectedContext,
      }),
    ).toBeNull();
  });

  it('builds cache entries from provider and context', () => {
    expect(
      buildStartupCapabilityCacheEntry('WASM', 100, {
        userAgent: 'ua',
        appVersion: 'a',
        assetVersion: 'b',
        wasmAssetVersion: 'c',
      }),
    ).toEqual({
      updatedAtMs: 100,
      resolvedExecutionProvider: 'wasm',
      userAgent: 'ua',
      appVersion: 'a',
      assetVersion: 'b',
      wasmAssetVersion: 'c',
    });
  });
});
