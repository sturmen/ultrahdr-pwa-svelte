import { describe, expect, it } from 'vitest';
import {
  createWorkerJobState,
  deriveInferenceHeartbeatEvent,
  reduceWorkerJobState,
} from '../worker-job-protocol.ts';

describe('worker-job-protocol', () => {
  it('creates immutable baseline job state', () => {
    const state = createWorkerJobState({
      onProgress: null,
      abortSignal: null,
      abortListener: null,
      wasmLoadTimeoutId: 123,
      inferenceTimeoutMs: 5000,
      nowMs: 10,
    });

    expect(state.awaitingWasmLoadCompletion).toBe(true);
    expect(state.wasmLoadTimeoutId).toBe(123);
    expect(state.inferenceTimeoutMs).toBe(5000);
    expect(state.lastWorkerMessageAtMs).toBe(10);
  });

  it('plans commands for wasm-load completion and inference monitoring', () => {
    const initial = createWorkerJobState({
      onProgress: null,
      abortSignal: null,
      abortListener: null,
      wasmLoadTimeoutId: 12,
      inferenceTimeoutMs: 1000,
      nowMs: 100,
    });

    const progress = {
      stage: 'wasm-load',
      phase: 'stage-complete',
      gmnetExecutionProvider: 'wasm',
    };
    const reduced = reduceWorkerJobState(initial, {
      type: 'WORKER_PROGRESS',
      detail: progress,
      nowMs: 110,
      inferenceStageName: 'generate-gain-map',
      resolveInferenceTimeoutMs: () => 2000,
    });

    expect(reduced.state.awaitingWasmLoadCompletion).toBe(false);
    expect(reduced.commands).toContain('CLEAR_WASM_TIMEOUT');

    const inferenceStart = reduceWorkerJobState(reduced.state, {
      type: 'WORKER_PROGRESS',
      detail: {
        stage: 'generate-gain-map',
        phase: 'stage-start',
        gmnetExecutionProvider: 'webgpu',
      },
      nowMs: 120,
      inferenceStageName: 'generate-gain-map',
      resolveInferenceTimeoutMs: () => 3000,
    });
    expect(inferenceStart.commands).toContain('START_INFERENCE_MONITORING');
    expect(inferenceStart.state.inferenceTimeoutMs).toBe(3000);
  });

  it('stops inference monitoring when inference stage ends', () => {
    const initial = {
      ...createWorkerJobState({
        onProgress: null,
        abortSignal: null,
        abortListener: null,
        wasmLoadTimeoutId: null,
        inferenceTimeoutMs: 1000,
        nowMs: 100,
      }),
      inferenceHeartbeatIntervalId: 55,
    };
    const reduced = reduceWorkerJobState(initial, {
      type: 'WORKER_PROGRESS',
      detail: { stage: 'generate-gain-map', phase: 'stage-complete' },
      nowMs: 200,
      inferenceStageName: 'generate-gain-map',
      resolveInferenceTimeoutMs: () => 1000,
    });
    expect(reduced.commands).toContain('STOP_INFERENCE_MONITORING');
  });

  it('builds synthetic heartbeat event from last progress detail', () => {
    const job = {
      ...createWorkerJobState({
        onProgress: null,
        abortSignal: null,
        abortListener: null,
        wasmLoadTimeoutId: null,
        inferenceTimeoutMs: 1000,
        nowMs: 100,
      }),
      inferenceStartedAtMs: 100,
      gmnetExecutionProvider: 'webgpu',
      lastProgressDetail: {
        elapsedMs: 5,
        stageProgress: 10,
      },
      lastWorkerMessageAtMs: 120,
    };

    const event = deriveInferenceHeartbeatEvent(job, {
      nowMs: 200,
      inferenceStageName: 'generate-gain-map',
      formatInferenceStatusNote: () => 'Starting inference... Runtime: webgpu.',
    });

    expect(event.stage).toBe('generate-gain-map');
    expect(event.syntheticHeartbeat).toBe(true);
    expect(event.stageProgress).toBeGreaterThan(10);
  });
});
