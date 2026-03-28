import { describe, expect, it } from 'vitest';

import {
  estimatePipelineProgress,
  formatExecutionProviderLabel,
  getSlowestStage,
  getStageLabel,
  toBatchProgress,
} from '../image-processor-progress.ts';

describe('image-processor-progress', () => {
  it('formats stage labels and provider labels for pipeline UI', () => {
    expect(getStageLabel('generate-gain-map', 'stage-progress')).toBe('Generating gain map');
    expect(getStageLabel('unknown-stage', 'stage-progress')).toBe('unknown-stage');
    expect(getStageLabel(null, 'pipeline-start')).toBe('Starting pipeline');
    expect(formatExecutionProviderLabel('webgpu')).toBe('WebGPU');
    expect(formatExecutionProviderLabel(' wasm ')).toBe('WASM');
  });

  it('estimates monotonic per-file and batch progress', () => {
    const started = estimatePipelineProgress(
      { stage: 'prepare-gmnet-input', phase: 'stage-start' },
      0,
    );
    const progressed = estimatePipelineProgress(
      { stage: 'prepare-gmnet-input', phase: 'stage-progress', stageProgress: 50 },
      started,
    );

    expect(started).toBeGreaterThan(0);
    expect(progressed).toBeGreaterThan(started);
    expect(
      toBatchProgress(50, 1, 4),
    ).toBe(37.5);
  });

  it('summarizes the slowest stage with readable timing', () => {
    expect(getSlowestStage({ decode: 50, encode: 1200 })).toBe('encode (1.20 s)');
    expect(getSlowestStage(null)).toBe(null);
  });

  it('estimates monotonic progress for hdr-intent stage lifecycle events', () => {
    const afterCompressStart = estimatePipelineProgress(
      { stage: 'compress-hdr-intent', phase: 'stage-start' },
      0,
    );
    const afterCompressComplete = estimatePipelineProgress(
      { stage: 'compress-hdr-intent', phase: 'stage-complete' },
      afterCompressStart,
    );
    const afterFinalizeStart = estimatePipelineProgress(
      { stage: 'finalize-output', phase: 'stage-start' },
      afterCompressComplete,
    );

    expect(afterCompressStart).toBeGreaterThan(0);
    expect(afterCompressComplete).toBeGreaterThan(afterCompressStart);
    expect(afterFinalizeStart).toBeGreaterThan(afterCompressComplete);
  });

  it('estimates monotonic progress for preserved-image stage lifecycle events', () => {
    const afterExtractStart = estimatePipelineProgress(
      { stage: 'extract-preserved-components', phase: 'stage-start' },
      0,
    );
    const afterExtractComplete = estimatePipelineProgress(
      { stage: 'extract-preserved-components', phase: 'stage-complete' },
      afterExtractStart,
    );
    const afterFinalizeStart = estimatePipelineProgress(
      { stage: 'finalize-preserved', phase: 'stage-start' },
      afterExtractComplete,
    );

    expect(afterExtractStart).toBeGreaterThan(0);
    expect(afterExtractComplete).toBeGreaterThan(afterExtractStart);
    expect(afterFinalizeStart).toBeGreaterThan(afterExtractComplete);
  });
});
