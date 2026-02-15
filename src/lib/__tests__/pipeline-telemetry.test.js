/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  PIPELINE_HISTORY_KEY,
  PIPELINE_PROGRESS_EVENT,
  PIPELINE_STATE_KEY,
  createPipelineTelemetry
} from '../pipeline-telemetry.js';

describe('pipeline-telemetry', () => {
  beforeEach(() => {
    window[PIPELINE_STATE_KEY] = undefined;
    window[PIPELINE_HISTORY_KEY] = [];
  });

  it('publishes pipeline lifecycle events to callback and window state', async () => {
    const onProgress = vi.fn();
    const telemetry = createPipelineTelemetry({
      fileName: 'example.jpg',
      onProgress
    });

    await telemetry.runStage('sample-stage', async () => 'ok');
    telemetry.complete({ outputBytes: 123 });

    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({
      phase: 'pipeline-start',
      stage: 'pipeline',
      fileName: 'example.jpg'
    }));

    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({
      phase: 'stage-complete',
      stage: 'sample-stage'
    }));

    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({
      phase: 'pipeline-complete',
      outputBytes: 123
    }));

    expect(window[PIPELINE_STATE_KEY]).toEqual(expect.objectContaining({
      phase: 'pipeline-complete'
    }));

    expect(window[PIPELINE_HISTORY_KEY].length).toBeGreaterThan(0);
  });

  it('publishes stage error and pipeline error payloads', async () => {
    const telemetry = createPipelineTelemetry({ fileName: 'broken.jpg' });

    await expect(
      telemetry.runStage('explode', async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    telemetry.fail(new Error('pipeline failed'));

    expect(window[PIPELINE_HISTORY_KEY]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ phase: 'stage-error', stage: 'explode' }),
        expect.objectContaining({ phase: 'pipeline-error', stage: 'pipeline' })
      ])
    );
  });

  it('dispatches a browser event for observers', () => {
    const listener = vi.fn();
    window.addEventListener(PIPELINE_PROGRESS_EVENT, listener);

    const telemetry = createPipelineTelemetry({ fileName: 'evented.jpg' });
    telemetry.complete();

    expect(listener).toHaveBeenCalled();

    window.removeEventListener(PIPELINE_PROGRESS_EVENT, listener);
  });
});
