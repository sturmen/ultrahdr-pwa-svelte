import { QUEUE_ITEM_STATES, WORKFLOW_STATES } from './workflow-state';

type QueueLikeItem = {
  id: number;
  status: string;
};

type DeriveQueueUiStateOptions = {
  queue: QueueLikeItem[];
  workflowState: string;
  processing: boolean;
  currentQueueId: number | null;
  exportableQueueIds: Set<number>;
  selectedQueueIds: Set<number>;
};

export function deriveQueueUiState({
  queue,
  workflowState,
  processing,
  currentQueueId,
  exportableQueueIds,
  selectedQueueIds,
}: DeriveQueueUiStateOptions) {
  const staleCount = queue.filter(
    (item) => item.status === QUEUE_ITEM_STATES.STALE,
  ).length;
  const queuePendingCount = queue.filter(
    (item) =>
      item.status === QUEUE_ITEM_STATES.QUEUED ||
      item.status === QUEUE_ITEM_STATES.PROCESSING,
  ).length;
  const queueCompletedCount = queue.filter(
    (item) =>
      item.status === QUEUE_ITEM_STATES.COMPLETED ||
      item.status === QUEUE_ITEM_STATES.STALE,
  ).length;
  const canPauseQueue =
    workflowState === WORKFLOW_STATES.PROCESSING_ACTIVE ||
    workflowState === WORKFLOW_STATES.PROCESSING_PAUSING;
  const canResumeQueue = workflowState === WORKFLOW_STATES.PROCESSING_PAUSED;
  const canCancelCurrent = processing && currentQueueId !== null;
  const queueControlVisibility = canPauseQueue
    ? 'pause'
    : canResumeQueue
      ? 'resume'
      : 'hidden';
  const failedQueueCount = queue.filter(
    (item) => item.status === QUEUE_ITEM_STATES.FAILED,
  ).length;
  const showQueueOverflow =
    canCancelCurrent || failedQueueCount > 0 || queue.length > 0;
  const selectionToggleState =
    exportableQueueIds.size === 0 || selectedQueueIds.size === 0
      ? 'none'
      : selectedQueueIds.size === exportableQueueIds.size
        ? 'all'
        : 'partial';
  const showPipelineCompleteSummary =
    workflowState === WORKFLOW_STATES.PROCESSING_DONE &&
    !processing &&
    queuePendingCount === 0 &&
    queueCompletedCount > 0;

  return {
    staleCount,
    queuePendingCount,
    queueCompletedCount,
    canPauseQueue,
    canResumeQueue,
    canCancelCurrent,
    queueControlVisibility,
    failedQueueCount,
    showQueueOverflow,
    selectionToggleState,
    showPipelineCompleteSummary,
  };
}
