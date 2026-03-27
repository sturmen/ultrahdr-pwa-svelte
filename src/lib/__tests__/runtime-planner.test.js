import { describe, expect, it } from 'vitest';
import { planInitialize, planProcess } from '../runtime-planner.ts';

describe('runtime-planner', () => {
  it('plans worker-first initialization with fallback metadata', () => {
    const state = Object.freeze({ status: 'idle' });
    const options = Object.freeze({
      allowMainThreadFallback: true,
      workerSupported: true,
    });

    const effects = planInitialize(state, options);

    expect(effects).toEqual([
      { type: 'dispatch', eventType: 'INIT_REQUESTED' },
      {
        type: 'initialize-adapter',
        adapter: 'worker',
        allowMainThreadFallback: true,
      },
    ]);
    expect(state).toEqual({ status: 'idle' });
    expect(options).toEqual({
      allowMainThreadFallback: true,
      workerSupported: true,
    });
  });

  it('plans process by ensuring initialization when no active adapter is set', () => {
    const effects = planProcess(
      { status: 'idle' },
      {
        hasActiveAdapter: false,
        workerSupported: true,
        allowMainThreadFallback: true,
      },
    );

    expect(effects).toEqual([
      { type: 'ensure-initialized', allowMainThreadFallback: true, workerSupported: true },
      { type: 'dispatch', eventType: 'PROCESS_REQUESTED' },
      { type: 'process-with-active-adapter' },
    ]);
  });
});
