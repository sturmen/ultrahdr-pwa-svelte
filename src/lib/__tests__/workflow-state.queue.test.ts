/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import {
  createWorkflowState,
  reduceWorkflowState,
  selectExportableQueueIds,
  selectMayClaimNextQueueItem,
  selectNextClaimableQueueItem,
  selectQueueCounts,
  selectQueueControlVisibility,
  selectShouldSuppressQueueStart,
  selectWorkflowCards,
} from '../workflow-state';

function createFile(name) {
  return new File(['mock'], name, { type: 'image/jpeg' });
}

describe('workflow-state queue-centric selectors', () => {
  it('creates visible cards for queued, processing, completed, and failed queue items', () => {
    let state = createWorkflowState();

    state = reduceWorkflowState(state, {
      type: 'FILES_ENQUEUED',
      files: [createFile('queued.jpg'), createFile('active.jpg'), createFile('done.jpg')],
    });

    const queuedId = state.queue[0].id;
    const activeId = state.queue[1].id;
    const completedId = state.queue[2].id;

    state = reduceWorkflowState(state, {
      type: 'ITEM_STARTED',
      queueId: activeId,
    });
    state = reduceWorkflowState(state, {
      type: 'ITEM_PROGRESS',
      queueId: activeId,
      event: {
        stage: 'generate-gain-map',
        label: 'Generating gain map',
        percent: 42,
      },
    });
    state = reduceWorkflowState(state, {
      type: 'ITEM_COMPLETED',
      queueId: completedId,
      result: {
        persisted: true,
        previewUrl: 'blob:done',
        size: 4,
      },
    });
    state = reduceWorkflowState(state, {
      type: 'ITEM_FAILED',
      queueId: queuedId,
      error: 'Could not decode image',
    });

    const cards = selectWorkflowCards(state);

    expect(cards).toEqual([
      expect.objectContaining({
        queueId: queuedId,
        status: 'failed',
        statusLabel: 'Failed',
        previewUrl: expect.any(String),
        progressPercent: null,
        overlayVisible: false,
      }),
      expect.objectContaining({
        queueId: activeId,
        status: 'processing',
        statusLabel: 'Generating gain map 42%',
        previewUrl: expect.any(String),
        progressPercent: 42,
        overlayVisible: true,
      }),
      expect.objectContaining({
        queueId: completedId,
        status: 'completed',
        statusLabel: 'Completed',
        previewUrl: 'blob:done',
        progressPercent: null,
        overlayVisible: false,
      }),
    ]);
  });

  it('derives queue controls, counts, and exportable queue ids from state', () => {
    let state = createWorkflowState();
    state = reduceWorkflowState(state, {
      type: 'FILES_ENQUEUED',
      files: [createFile('one.jpg'), createFile('two.jpg')],
    });

    const firstId = state.queue[0].id;
    const secondId = state.queue[1].id;

    state = reduceWorkflowState(state, { type: 'ITEM_STARTED', queueId: firstId });
    state = reduceWorkflowState(state, {
      type: 'ITEM_COMPLETED',
      queueId: secondId,
      result: {
        persisted: true,
        previewUrl: 'blob:two',
        size: 4,
      },
    });

    expect(selectQueueControlVisibility(state)).toBe('pause');
    expect(selectQueueCounts(state)).toEqual({
      pending: 1,
      completed: 1,
      stale: 0,
      failed: 0,
      total: 2,
    });
    expect(selectExportableQueueIds(state)).toEqual([secondId]);
  });

  it('treats storage-backed outputs as exportable even without resident blobs', () => {
    const state = {
      mode: 'done',
      activeQueueId: null,
      pendingIntent: null,
      nextQueueId: 1,
      queue: [
        {
          id: 0,
          name: 'stored.jpg',
          status: 'completed',
          settingsVersion: 1,
          processingPath: 'generated',
          error: null,
          inputPreviewUrl: 'blob:preview',
          outputPreviewUrl: 'blob:output',
          result: {
            outputUrl: 'blob:output',
            size: 123,
            persisted: true,
          },
          progress: null,
        },
      ],
    };

    expect(selectExportableQueueIds(state)).toEqual([0]);
    expect(selectWorkflowCards(state)[0]).toEqual(
      expect.objectContaining({
        hasOutput: true,
        previewUrl: 'blob:output',
      }),
    );
  });

  it('keeps completed items exportable without any resident output blob or full output URL', () => {
    const state = {
      mode: 'done',
      activeQueueId: null,
      pendingIntent: null,
      nextQueueId: 1,
      queue: [
        {
          id: 0,
          name: 'stored.jpg',
          status: 'completed',
          settingsVersion: 1,
          processingPath: 'generated',
          error: null,
          inputPreviewUrl: 'blob:input-preview',
          outputPreviewUrl: 'blob:output-preview',
          result: {
            size: 123,
            persisted: true,
          },
          progress: null,
        },
      ],
    };

    expect(selectExportableQueueIds(state)).toEqual([0]);
    expect(selectWorkflowCards(state)[0]).toEqual(
      expect.objectContaining({
        hasOutput: true,
        previewUrl: 'blob:output-preview',
        comparePreviewUrl: 'blob:output-preview',
      }),
    );
  });

  it('suppresses redundant queue start requests while a queue item is already claimed', () => {
    let state = createWorkflowState();
    state = reduceWorkflowState(state, {
      type: 'FILES_ENQUEUED',
      files: [createFile('one.jpg')],
    });

    expect(selectShouldSuppressQueueStart(state)).toBe(false);
    expect(selectMayClaimNextQueueItem(state)).toBe(true);
    expect(selectNextClaimableQueueItem(state)?.id).toBe(0);

    state = reduceWorkflowState(state, { type: 'QUEUE_START_REQUESTED' });
    state = reduceWorkflowState(state, { type: 'QUEUE_ITEM_CLAIMED', queueId: 0, launchToken: 'launch-1' });

    expect(selectShouldSuppressQueueStart(state)).toBe(true);
    expect(selectMayClaimNextQueueItem(state)).toBe(false);
    expect(selectNextClaimableQueueItem(state)).toBeNull();

    const duplicateClaimState = reduceWorkflowState(state, {
      type: 'QUEUE_ITEM_CLAIMED',
      queueId: 0,
      launchToken: 'launch-2',
    });
    expect(duplicateClaimState).toEqual(state);
  });

  it('records restart intent during a running claim and only allows the next claim after settle', () => {
    let state = createWorkflowState();
    state = reduceWorkflowState(state, {
      type: 'FILES_ENQUEUED',
      files: [createFile('one.jpg'), createFile('two.jpg')],
    });
    state = reduceWorkflowState(state, { type: 'QUEUE_START_REQUESTED' });
    state = reduceWorkflowState(state, { type: 'QUEUE_ITEM_CLAIMED', queueId: 0, launchToken: 'launch-1' });
    state = reduceWorkflowState(state, { type: 'QUEUE_LAUNCH_CONFIRMED', queueId: 0, launchToken: 'launch-1' });
    state = reduceWorkflowState(state, { type: 'QUEUE_RESTART_REQUESTED' });

    expect(state.restartRequested).toBe(true);
    expect(selectShouldSuppressQueueStart(state)).toBe(true);
    expect(selectNextClaimableQueueItem(state)).toBeNull();

    state = reduceWorkflowState(state, {
      type: 'ITEM_COMPLETED',
      queueId: 0,
      result: {
        persisted: true,
        previewUrl: 'blob:one',
        size: 4,
      },
    });
    state = reduceWorkflowState(state, { type: 'QUEUE_ITEM_SETTLED', queueId: 0, launchToken: 'launch-1' });

    expect(state.runnerState).toBe('idle');
    expect(state.claimedQueueId).toBeNull();
    expect(state.restartRequested).toBe(false);
    expect(selectShouldSuppressQueueStart(state)).toBe(false);
    expect(selectNextClaimableQueueItem(state)?.id).toBe(1);
  });

  it('records restart intent while queued work exists even if the runner has already returned to idle', () => {
    let state = createWorkflowState();
    state = reduceWorkflowState(state, {
      type: 'FILES_ENQUEUED',
      files: [createFile('one.jpg')],
    });

    state = reduceWorkflowState(state, { type: 'QUEUE_RESTART_REQUESTED' });

    expect(state.runnerState).toBe('idle');
    expect(state.claimedQueueId).toBeNull();
    expect(state.restartRequested).toBe(true);
  });
});
