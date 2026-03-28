import { describe, expect, it } from 'vitest';

import { QUEUE_ITEM_STATES, WORKFLOW_STATES } from '../workflow-state';
import { deriveQueueUiState } from '../image-processor-queue.ts';

describe('image-processor-queue', () => {
  it('derives counts and controls from queue and workflow state', () => {
    const queue = [
      { id: 1, status: QUEUE_ITEM_STATES.QUEUED },
      { id: 2, status: QUEUE_ITEM_STATES.PROCESSING },
      { id: 3, status: QUEUE_ITEM_STATES.COMPLETED },
      { id: 4, status: QUEUE_ITEM_STATES.STALE },
      { id: 5, status: QUEUE_ITEM_STATES.FAILED },
    ];

    expect(
      deriveQueueUiState({
        queue,
        workflowState: WORKFLOW_STATES.PROCESSING_ACTIVE,
        processing: true,
        currentQueueId: 2,
        exportableQueueIds: new Set([3, 4]),
        selectedQueueIds: new Set([3]),
      }),
    ).toEqual({
      staleCount: 1,
      queuePendingCount: 2,
      queueCompletedCount: 2,
      canPauseQueue: true,
      canResumeQueue: false,
      canCancelCurrent: true,
      queueControlVisibility: 'pause',
      failedQueueCount: 1,
      showQueueOverflow: true,
      selectionToggleState: 'partial',
      showPipelineCompleteSummary: false,
    });
  });

  it('reports all selected and completed queue summary when processing is done', () => {
    const queue = [
      { id: 7, status: QUEUE_ITEM_STATES.COMPLETED },
      { id: 8, status: QUEUE_ITEM_STATES.STALE },
    ];

    expect(
      deriveQueueUiState({
        queue,
        workflowState: WORKFLOW_STATES.PROCESSING_DONE,
        processing: false,
        currentQueueId: null,
        exportableQueueIds: new Set([7, 8]),
        selectedQueueIds: new Set([7, 8]),
      }),
    ).toMatchObject({
      queuePendingCount: 0,
      queueCompletedCount: 2,
      queueControlVisibility: 'hidden',
      selectionToggleState: 'all',
      showPipelineCompleteSummary: true,
    });
  });
});
