/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

describe('GMNetCheckpointStore', () => {
  it('stores and restores chunked accumulation state with tile completion metadata', async () => {
    const { GMNetCheckpointStore } = await import('../gmnet-checkpoint-store.js');

    const store = new GMNetCheckpointStore({
      runtime: {},
      chunkSizeFloats: 4,
    });

    const checkpointKey = 'test-checkpoint-key';
    const tileCompleted = new Uint8Array([1, 0, 1, 0, 0, 1]);
    const accumIngm = new Float32Array([0.1, 0.2, 0.3, 0.4, 1.1, 1.2, 1.3, 1.4, 2.1, 2.2]);

    await store.saveSnapshot(checkpointKey, {
      sourceWidth: 5,
      sourceHeight: 2,
      tileTotal: 6,
      completedTileCount: 3,
      tileCompleted,
      accumIngm,
    });

    const loaded = await store.loadSnapshot(checkpointKey);
    expect(loaded).toEqual(
      expect.objectContaining({
        sourceWidth: 5,
        sourceHeight: 2,
        tileTotal: 6,
        completedTileCount: 3,
        chunkCount: 3,
      }),
    );
    expect(Array.from(loaded.tileCompleted)).toEqual(Array.from(tileCompleted));
    expect(Array.from(loaded.accumIngm)).toEqual(Array.from(accumIngm));
  });

  it('clears persisted checkpoint snapshots', async () => {
    const { GMNetCheckpointStore } = await import('../gmnet-checkpoint-store.js');
    const store = new GMNetCheckpointStore({
      runtime: {},
      chunkSizeFloats: 2,
    });

    const checkpointKey = 'clear-checkpoint-key';
    await store.saveSnapshot(checkpointKey, {
      sourceWidth: 2,
      sourceHeight: 2,
      tileTotal: 2,
      completedTileCount: 1,
      tileCompleted: new Uint8Array([1, 0]),
      accumIngm: new Float32Array([0.1, 0.2, 0.3, 0.4]),
    });
    await store.clearSnapshot(checkpointKey);

    const loaded = await store.loadSnapshot(checkpointKey);
    expect(loaded).toBeNull();
  });

  it('skips saving snapshots when storage budget indicates low free space', async () => {
    const { GMNetCheckpointStore } = await import('../gmnet-checkpoint-store.js');
    const runtime = {
      navigator: {
        storage: {
          estimate: async () => ({ usage: 950, quota: 1000 }),
          persist: async () => false,
        },
      },
    };
    const store = new GMNetCheckpointStore({
      runtime,
      chunkSizeFloats: 2,
    });

    const checkpointKey = 'low-budget-checkpoint-key';
    await store.saveSnapshot(checkpointKey, {
      sourceWidth: 2,
      sourceHeight: 2,
      tileTotal: 2,
      completedTileCount: 1,
      tileCompleted: new Uint8Array([1, 0]),
      accumIngm: new Float32Array([0.1, 0.2, 0.3, 0.4]),
    });

    const loaded = await store.loadSnapshot(checkpointKey);
    expect(loaded).toBeNull();
  });

  it('prunes expired snapshots based on retention TTL before saving new checkpoints', async () => {
    const { GMNetCheckpointStore } = await import('../gmnet-checkpoint-store.js');
    let nowMs = 1_000;
    const store = new GMNetCheckpointStore({
      runtime: {},
      chunkSizeFloats: 2,
      retentionTtlMs: 50,
      now: () => nowMs,
    });

    await store.saveSnapshot('old-key', {
      sourceWidth: 2,
      sourceHeight: 2,
      tileTotal: 2,
      completedTileCount: 1,
      tileCompleted: new Uint8Array([1, 0]),
      accumIngm: new Float32Array([0.1, 0.2]),
    });

    nowMs = 1_100;
    await store.saveSnapshot('new-key', {
      sourceWidth: 2,
      sourceHeight: 2,
      tileTotal: 2,
      completedTileCount: 1,
      tileCompleted: new Uint8Array([1, 0]),
      accumIngm: new Float32Array([0.3, 0.4]),
    });

    await expect(store.loadSnapshot('old-key')).resolves.toBeNull();
    await expect(store.loadSnapshot('new-key')).resolves.toEqual(
      expect.objectContaining({
        completedTileCount: 1,
      }),
    );
  });
});
