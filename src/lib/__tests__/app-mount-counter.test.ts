/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  APP_MOUNT_COUNT_STORAGE_KEY,
  bumpAppMountCounter,
  readAppMountCounter,
} from '../app-mount-counter.ts';

function freshRuntime() {
  window.localStorage.clear();
  return window as typeof globalThis & { localStorage: Storage };
}

describe('app-mount-counter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('starts at priorMountCount=0 and returns mountCount=1 on first bump', () => {
    const runtime = freshRuntime();
    const result = bumpAppMountCounter(runtime);
    expect(result).toEqual({ mountCount: 1, priorMountCount: 0 });
    expect(window.localStorage.getItem(APP_MOUNT_COUNT_STORAGE_KEY)).toBe('1');
  });

  it('monotonically increments across repeated bumps and persists between calls', () => {
    const runtime = freshRuntime();
    const first = bumpAppMountCounter(runtime);
    const second = bumpAppMountCounter(runtime);
    const third = bumpAppMountCounter(runtime);
    expect(first).toEqual({ mountCount: 1, priorMountCount: 0 });
    expect(second).toEqual({ mountCount: 2, priorMountCount: 1 });
    expect(third).toEqual({ mountCount: 3, priorMountCount: 2 });
  });

  it('recovers cleanly from corrupted stored values', () => {
    const runtime = freshRuntime();
    runtime.localStorage.setItem(APP_MOUNT_COUNT_STORAGE_KEY, 'not-a-number');
    const result = bumpAppMountCounter(runtime);
    expect(result).toEqual({ mountCount: 1, priorMountCount: 0 });
    expect(window.localStorage.getItem(APP_MOUNT_COUNT_STORAGE_KEY)).toBe('1');
  });

  it('rejects negative or non-finite stored values and restarts at 1', () => {
    const runtime = freshRuntime();
    runtime.localStorage.setItem(APP_MOUNT_COUNT_STORAGE_KEY, '-5');
    const result = bumpAppMountCounter(runtime);
    expect(result).toEqual({ mountCount: 1, priorMountCount: 0 });
  });

  it('readAppMountCounter returns the persisted value without mutating it', () => {
    const runtime = freshRuntime();
    bumpAppMountCounter(runtime);
    bumpAppMountCounter(runtime);
    expect(readAppMountCounter(runtime)).toBe(2);
    expect(window.localStorage.getItem(APP_MOUNT_COUNT_STORAGE_KEY)).toBe('2');
  });

  it('returns 0 from readAppMountCounter before any bump', () => {
    const runtime = freshRuntime();
    expect(readAppMountCounter(runtime)).toBe(0);
  });

  it('does not throw when localStorage setItem fails and reports the prior count', () => {
    const runtime = freshRuntime();
    bumpAppMountCounter(runtime);
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });
    const result = bumpAppMountCounter(runtime);
    expect(result).toEqual({ mountCount: 2, priorMountCount: 1 });
    setItemSpy.mockRestore();
  });

  it('tolerates a runtime without localStorage and returns zeros', () => {
    const runtimeWithoutStorage = {} as typeof globalThis;
    const result = bumpAppMountCounter(runtimeWithoutStorage);
    expect(result).toEqual({ mountCount: 0, priorMountCount: 0 });
    expect(readAppMountCounter(runtimeWithoutStorage)).toBe(0);
  });
});
