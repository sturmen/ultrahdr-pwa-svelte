import { describe, expect, it } from 'vitest';
import {
  createInitialProcessingRuntimeState,
  reduceProcessingRuntimeState,
} from '../processing-runtime-reducer.ts';

describe('processing-runtime-reducer', () => {
  it('emits init command from idle state', () => {
    const state = createInitialProcessingRuntimeState();
    const reduced = reduceProcessingRuntimeState(state, {
      type: 'INIT_REQUESTED',
      options: { allowMainThreadFallback: true },
    });

    expect(reduced.state.status).toBe('initializing');
    expect(reduced.commands).toEqual([
      {
        type: 'INIT_RUNTIME',
        options: { allowMainThreadFallback: true },
      },
    ]);
  });

  it('moves to ready state on init success', () => {
    const initializing = {
      ...createInitialProcessingRuntimeState(),
      status: 'initializing',
    };
    const reduced = reduceProcessingRuntimeState(initializing, {
      type: 'INIT_SUCCEEDED',
      runtime: { runtimeMode: 'worker-gpu' },
    });
    expect(reduced.state.status).toBe('ready-worker');
    expect(reduced.state.runtime).toEqual({ runtimeMode: 'worker-gpu' });
  });

  it('emits process command and returns to ready on success', () => {
    const ready = {
      ...createInitialProcessingRuntimeState(),
      status: 'ready-worker',
      runtime: { runtimeMode: 'worker-gpu' },
    };
    const requested = reduceProcessingRuntimeState(ready, {
      type: 'PROCESS_REQUESTED',
      file: { name: 'a.jpg' },
      options: { quality: 0.9 },
    });
    expect(requested.state.status).toBe('processing');
    expect(requested.commands).toEqual([
      { type: 'PROCESS_IMAGE', file: { name: 'a.jpg' }, options: { quality: 0.9 } },
    ]);

    const done = reduceProcessingRuntimeState(requested.state, {
      type: 'PROCESS_SUCCEEDED',
    });
    expect(done.state.status).toBe('ready-worker');
  });

  it('records progress and failure events', () => {
    const state = createInitialProcessingRuntimeState();
    const progress = reduceProcessingRuntimeState(state, {
      type: 'PROGRESS_EVENT',
      detail: { stepId: 'onnx-load' },
    });
    expect(progress.state.progress).toEqual({ stepId: 'onnx-load' });

    const failed = reduceProcessingRuntimeState(progress.state, {
      type: 'INIT_FAILED',
      error: new Error('boom'),
    });
    expect(failed.state.status).toBe('failed');
    expect(failed.state.error).toBeInstanceOf(Error);
  });
});
