import { describe, expect, it } from 'vitest';
import { createInitialRuntimeState, runtimeStateReducer } from '../runtime-state-machine.ts';

describe('runtime-state-machine', () => {
  it('transitions from idle to initializing and then ready-worker', () => {
    const initial = createInitialRuntimeState();
    const initializing = runtimeStateReducer(initial, { type: 'INIT_REQUESTED' });
    const ready = runtimeStateReducer(initializing, {
      type: 'INIT_READY',
      payload: { runtimeMode: 'worker-gpu' },
    });

    expect(initial.status).toBe('idle');
    expect(initializing.status).toBe('initializing');
    expect(ready.status).toBe('ready-worker');
    expect(ready.runtime.runtimeMode).toBe('worker-gpu');
  });

  it('moves to processing and back to ready on success', () => {
    const ready = runtimeStateReducer(createInitialRuntimeState(), {
      type: 'INIT_READY',
      payload: { runtimeMode: 'worker-gpu' },
    });
    const processing = runtimeStateReducer(ready, { type: 'PROCESS_REQUESTED' });
    const backToReady = runtimeStateReducer(processing, { type: 'PROCESS_DONE' });

    expect(processing.status).toBe('processing');
    expect(backToReady.status).toBe('ready-worker');
  });

  it('marks failures and supports reset', () => {
    const failed = runtimeStateReducer(createInitialRuntimeState(), {
      type: 'INIT_FAILED',
      payload: { error: new Error('boom') },
    });
    const reset = runtimeStateReducer(failed, { type: 'RESET' });

    expect(failed.status).toBe('failed');
    expect(reset.status).toBe('idle');
  });

  it('ignores unknown events', () => {
    const initial = createInitialRuntimeState();
    expect(runtimeStateReducer(initial, { type: 'UNKNOWN_EVENT' })).toEqual(initial);
  });
});
