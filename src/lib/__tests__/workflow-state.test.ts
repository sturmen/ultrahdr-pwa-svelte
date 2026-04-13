/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import {
  createWorkflowState,
  reduceWorkflowState,
  selectWorkflowCards,
  WORKFLOW_EVENTS,
  WORKFLOW_STATES,
  transitionWorkflow,
} from '../workflow-state';

describe('workflow-state', () => {
  it('starts in EMPTY and transitions to active processing when files are added and auto-started', () => {
    const queueReady = transitionWorkflow(WORKFLOW_STATES.EMPTY, {
      type: WORKFLOW_EVENTS.FILES_ADDED,
    });
    const active = transitionWorkflow(queueReady, { type: WORKFLOW_EVENTS.AUTO_START });

    expect(queueReady).toBe(WORKFLOW_STATES.QUEUE_READY);
    expect(active).toBe(WORKFLOW_STATES.PROCESSING_ACTIVE);
  });

  it('moves to pausing and only pauses after current file settles', () => {
    const pausing = transitionWorkflow(WORKFLOW_STATES.PROCESSING_ACTIVE, {
      type: WORKFLOW_EVENTS.PAUSE_REQUESTED,
    });
    const paused = transitionWorkflow(pausing, {
      type: WORKFLOW_EVENTS.CURRENT_FILE_SETTLED,
    });

    expect(pausing).toBe(WORKFLOW_STATES.PROCESSING_PAUSING);
    expect(paused).toBe(WORKFLOW_STATES.PROCESSING_PAUSED);
  });

  it('resumes from paused and can reach done when queue drains', () => {
    const resumed = transitionWorkflow(WORKFLOW_STATES.PROCESSING_PAUSED, {
      type: WORKFLOW_EVENTS.RESUME_REQUESTED,
    });
    const done = transitionWorkflow(resumed, {
      type: WORKFLOW_EVENTS.QUEUE_DRAINED,
    });

    expect(resumed).toBe(WORKFLOW_STATES.PROCESSING_ACTIVE);
    expect(done).toBe(WORKFLOW_STATES.PROCESSING_DONE);
  });

  it('moves to error recoverable when processing reports an unrecoverable error', () => {
    const errored = transitionWorkflow(WORKFLOW_STATES.PROCESSING_ACTIVE, {
      type: WORKFLOW_EVENTS.ERROR_REPORTED,
    });

    expect(errored).toBe(WORKFLOW_STATES.ERROR_RECOVERABLE);
  });

  it('returns to empty on start over from any state', () => {
    const resetFromPaused = transitionWorkflow(WORKFLOW_STATES.PROCESSING_PAUSED, {
      type: WORKFLOW_EVENTS.START_OVER,
    });
    const resetFromDone = transitionWorkflow(WORKFLOW_STATES.PROCESSING_DONE, {
      type: WORKFLOW_EVENTS.START_OVER,
    });

    expect(resetFromPaused).toBe(WORKFLOW_STATES.EMPTY);
    expect(resetFromDone).toBe(WORKFLOW_STATES.EMPTY);
  });

  it('exposes input/output previews for compare when an item has completed output', () => {
    const file = new File(['source'], 'photo-0.jpg', { type: 'image/jpeg' });
    let state = reduceWorkflowState(createWorkflowState(), {
      type: 'FILES_ENQUEUED',
      files: [file],
    });

    state = reduceWorkflowState(state, {
      type: 'ITEM_COMPLETED',
      queueId: 0,
      result: {
        persisted: true,
        previewUrl: 'blob:output-preview',
        size: 1024,
      },
    });

    const [card] = selectWorkflowCards(state);
    expect(card.hasComparePreview).toBe(true);
    expect(card.previewUrl).toBe('blob:output-preview');
    expect(card.sourcePreviewUrl).toBe('mock-object-url');
    expect(card.comparePreviewUrl).toBe('blob:output-preview');
  });

  it('keeps queued items on input-only preview data without compare availability', () => {
    const file = new File(['source'], 'photo-0.jpg', { type: 'image/jpeg' });
    const state = reduceWorkflowState(createWorkflowState(), {
      type: 'FILES_ENQUEUED',
      files: [file],
    });

    const [card] = selectWorkflowCards(state);
    expect(card.hasComparePreview).toBe(false);
    expect(card.previewUrl).toBe(card.sourcePreviewUrl);
    expect(card.comparePreviewUrl).toBeNull();
  });
});
