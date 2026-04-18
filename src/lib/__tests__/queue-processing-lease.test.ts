import { describe, expect, it, vi } from 'vitest';

import { createQueueTaskRegistry, createQueueTokenRegistry } from '../queue-processing-lease.ts';

describe('queue-processing-lease', () => {
  it('blocks duplicate queue token acquisition for the same queue even when the token matches', () => {
    const registry = createQueueTokenRegistry();

    expect(registry.acquire(7, 'launch-1')).toEqual({
      acquired: true,
      existingLaunchToken: null,
    });

    expect(registry.acquire(7, 'launch-1')).toEqual({
      acquired: false,
      existingLaunchToken: 'launch-1',
    });
  });

  it('joins an in-flight queue task when the same queue/token is invoked twice', async () => {
    const registry = createQueueTaskRegistry<string>();
    const task = vi.fn(async () => 'done');

    const firstRun = registry.run(3, 'launch-1', task);
    const secondRun = registry.run(3, 'launch-1', task);

    expect(firstRun.status).toBe('started');
    expect(secondRun.status).toBe('joined');
    expect(task).toHaveBeenCalledTimes(1);
    expect(secondRun.promise).toBe(firstRun.promise);
    await expect(firstRun.promise).resolves.toBe('done');
  });

  it('blocks conflicting queue task invocations while a different launch token is active', async () => {
    const registry = createQueueTaskRegistry<string>();
    let resolveTask: ((value: string) => void) | null = null;
    const task = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveTask = resolve;
        }),
    );

    const firstRun = registry.run(5, 'launch-1', task);
    const secondRun = registry.run(5, 'launch-2', task);

    expect(firstRun.status).toBe('started');
    expect(secondRun).toEqual({
      status: 'blocked',
      existingLaunchToken: 'launch-1',
    });
    expect(task).toHaveBeenCalledTimes(1);

    resolveTask?.('done');
    await expect(firstRun.promise).resolves.toBe('done');
  });
});
