/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';

import {
  buildShareFilesFromStorage,
  getSelectedResults,
  loadSelectedResultBlobs,
} from '../result-management.ts';

describe('result-management storage-backed payload access', () => {
  it('loads selected result blobs lazily from storage', async () => {
    const loadResultBlob = vi.fn(async (queueId: number) =>
      new Blob([`blob-${queueId}`], { type: 'image/jpeg' }),
    );
    const results = [
      { originalName: 'a.jpg', queueId: 1, size: 3 },
      { originalName: 'b.jpg', queueId: 2, size: 3 },
    ];

    const selected = await loadSelectedResultBlobs(results, new Set([2]), {
      loadResultBlob,
    });

    expect(loadResultBlob).toHaveBeenCalledTimes(1);
    expect(loadResultBlob).toHaveBeenCalledWith(2);
    expect(selected).toHaveLength(1);
    expect(await selected[0].blob.text()).toBe('blob-2');
  });

  it('builds shareable files from storage without resident result blobs', async () => {
    const loadResultBlob = vi.fn(async (queueId: number) =>
      new Blob([`blob-${queueId}`], { type: 'image/jpeg' }),
    );
    const results = [
      { originalName: 'holiday.png', queueId: 7, size: 6 },
    ];

    const files = await buildShareFilesFromStorage(results, new Set([7]), {
      loadResultBlob,
    });

    expect(files).toHaveLength(1);
    expect(files[0]).toBeInstanceOf(File);
    expect(files[0].name).toBe('holiday.jpg');
    expect(await files[0].text()).toBe('blob-7');
  });

  it('still resolves selected results by queue id before lazy blob fetch', () => {
    const results = [
      { originalName: 'a.jpg', queueId: 10, size: 1 },
      { originalName: 'b.jpg', queueId: 20, size: 1 },
    ];

    expect(getSelectedResults(results, new Set([20]))).toEqual([
      { originalName: 'b.jpg', queueId: 20, size: 1 },
    ]);
  });
});
