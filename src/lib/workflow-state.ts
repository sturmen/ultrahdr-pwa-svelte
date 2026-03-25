export const WORKFLOW_STATES = Object.freeze({
  EMPTY: 'EMPTY',
  QUEUE_READY: 'QUEUE_READY',
  PROCESSING_ACTIVE: 'PROCESSING_ACTIVE',
  PROCESSING_PAUSING: 'PROCESSING_PAUSING',
  PROCESSING_PAUSED: 'PROCESSING_PAUSED',
  PROCESSING_DONE: 'PROCESSING_DONE',
  ERROR_RECOVERABLE: 'ERROR_RECOVERABLE',
});

export const QUEUE_ITEM_STATES = Object.freeze({
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  STALE: 'stale',
});

export const WORKFLOW_EVENTS = Object.freeze({
  FILES_ADDED: 'FILES_ADDED',
  AUTO_START: 'AUTO_START',
  PAUSE_REQUESTED: 'PAUSE_REQUESTED',
  CURRENT_FILE_SETTLED: 'CURRENT_FILE_SETTLED',
  RESUME_REQUESTED: 'RESUME_REQUESTED',
  CANCEL_CURRENT: 'CANCEL_CURRENT',
  FILE_FAILED: 'FILE_FAILED',
  QUEUE_DRAINED: 'QUEUE_DRAINED',
  ERROR_REPORTED: 'ERROR_REPORTED',
  START_OVER: 'START_OVER',
});

export type WorkflowMode = 'idle' | 'ready' | 'running' | 'pausing' | 'paused' | 'done' | 'error';
export type PendingIntent = null | 'pause' | 'cancel' | 'restart-backend';
export type QueueItemStatus = (typeof QUEUE_ITEM_STATES)[keyof typeof QUEUE_ITEM_STATES];
export type ProcessingPath = 'unknown' | 'generated' | 'preserved';

export interface QueueItemProgress {
  stage: string;
  label: string;
  percent: number;
  visible: boolean;
}

export interface QueueItemResult {
  blob?: Blob;
  outputUrl?: string;
  size: number;
  persisted?: boolean;
}

export interface QueueItemState {
  id: number;
  file?: File | null;
  name: string;
  status: QueueItemStatus;
  settingsVersion: number;
  processingPath: ProcessingPath;
  error: string | null;
  inputPreviewUrl: string;
  outputPreviewUrl: string | null;
  result: QueueItemResult | null;
  progress: QueueItemProgress | null;
}

export interface WorkflowState {
  mode: WorkflowMode;
  activeQueueId: number | null;
  pendingIntent: PendingIntent;
  queue: QueueItemState[];
  nextQueueId: number;
}

export type WorkflowAction =
  | { type: 'FILES_ENQUEUED'; files: File[]; settingsVersion?: number }
  | { type: 'ITEM_STARTED'; queueId: number }
  | { type: 'ITEM_PROGRESS'; queueId: number; event: { stage: string; label: string; percent: number } }
  | { type: 'ITEM_COMPLETED'; queueId: number; result: QueueItemResult; processingPath?: ProcessingPath; settingsVersion?: number }
  | { type: 'ITEM_FAILED'; queueId: number; error: string }
  | { type: 'ITEM_CANCELLED'; queueId: number; error?: string }
  | { type: 'ITEM_MARKED_STALE'; queueId: number }
  | { type: 'ITEM_REQUEUED'; queueId: number }
  | { type: 'ITEM_REMOVED'; queueId: number; revokeObjectUrl?: (url: string) => void }
  | { type: 'QUEUE_PAUSE_REQUESTED' }
  | { type: 'QUEUE_RESUMED' }
  | { type: 'QUEUE_DRAINED' }
  | { type: 'QUEUE_RESET'; revokeObjectUrl?: (url: string) => void }
  | { type: 'ERROR_REPORTED' }
  | { type: 'SET_PENDING_INTENT'; pendingIntent: PendingIntent };

export interface WorkflowCard {
  queueId: number;
  status: QueueItemStatus;
  statusLabel: string;
  filename: string;
  previewUrl: string;
  previewAlt: string;
  overlayVisible: boolean;
  progressPercent: number | null;
  hasOutput: boolean;
  error: string | null;
  isSelectable: boolean;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

function createQueueItem(file: File, id: number, settingsVersion: number): QueueItemState {
  return {
    id,
    file,
    name: file.name,
    status: QUEUE_ITEM_STATES.QUEUED,
    settingsVersion,
    processingPath: 'unknown',
    error: null,
    inputPreviewUrl: URL.createObjectURL(file),
    outputPreviewUrl: null,
    result: null,
    progress: null,
  };
}

function updateQueueItem(
  queue: QueueItemState[],
  queueId: number,
  updater: (item: QueueItemState) => QueueItemState,
): QueueItemState[] {
  return queue.map((item) => (item.id === queueId ? updater(item) : item));
}

function revokeQueueItemUrls(
  item: QueueItemState,
  revokeObjectUrl: (url: string) => void = URL.revokeObjectURL,
): void {
  if (item.inputPreviewUrl) {
    revokeObjectUrl(item.inputPreviewUrl);
  }
  if (item.outputPreviewUrl) {
    revokeObjectUrl(item.outputPreviewUrl);
  }
}

export function createWorkflowState(): WorkflowState {
  return {
    mode: 'idle',
    activeQueueId: null,
    pendingIntent: null,
    queue: [],
    nextQueueId: 0,
  };
}

export function reduceWorkflowState(
  state: WorkflowState = createWorkflowState(),
  action: WorkflowAction,
): WorkflowState {
  switch (action.type) {
    case 'FILES_ENQUEUED': {
      const settingsVersion = action.settingsVersion ?? 1;
      const nextQueue = [
        ...state.queue,
        ...action.files.map((file, index) =>
          createQueueItem(file, state.nextQueueId + index, settingsVersion),
        ),
      ];
      return {
        ...state,
        mode: nextQueue.length > 0 ? 'ready' : state.mode,
        queue: nextQueue,
        nextQueueId: state.nextQueueId + action.files.length,
      };
    }
    case 'ITEM_STARTED':
      return {
        ...state,
        mode: state.pendingIntent === 'pause' ? 'pausing' : 'running',
        activeQueueId: action.queueId,
        queue: updateQueueItem(state.queue, action.queueId, (item) => ({
          ...item,
          status: QUEUE_ITEM_STATES.PROCESSING,
          error: null,
          progress: item.progress,
        })),
      };
    case 'ITEM_PROGRESS':
      return {
        ...state,
        activeQueueId: action.queueId,
        queue: updateQueueItem(state.queue, action.queueId, (item) => ({
          ...item,
          status: QUEUE_ITEM_STATES.PROCESSING,
          progress: {
            stage: action.event.stage,
            label: action.event.label,
            percent: clampPercent(action.event.percent),
            visible: true,
          },
        })),
      };
    case 'ITEM_COMPLETED':
      return {
        ...state,
        queue: updateQueueItem(state.queue, action.queueId, (item) => ({
          ...item,
          status: QUEUE_ITEM_STATES.COMPLETED,
          processingPath: action.processingPath ?? item.processingPath,
          settingsVersion: action.settingsVersion ?? item.settingsVersion,
          result: action.result,
          outputPreviewUrl: action.result.outputUrl,
          error: null,
          progress: null,
        })),
        activeQueueId: state.activeQueueId === action.queueId ? null : state.activeQueueId,
        pendingIntent: state.pendingIntent === 'cancel' ? null : state.pendingIntent,
      };
    case 'ITEM_FAILED':
      return {
        ...state,
        queue: updateQueueItem(state.queue, action.queueId, (item) => ({
          ...item,
          status: QUEUE_ITEM_STATES.FAILED,
          error: action.error,
          progress: null,
        })),
        activeQueueId: state.activeQueueId === action.queueId ? null : state.activeQueueId,
        pendingIntent: null,
      };
    case 'ITEM_CANCELLED':
      return {
        ...state,
        queue: updateQueueItem(state.queue, action.queueId, (item) => ({
          ...item,
          status: QUEUE_ITEM_STATES.CANCELLED,
          error: action.error ?? 'Cancelled by user',
          progress: null,
        })),
        activeQueueId: state.activeQueueId === action.queueId ? null : state.activeQueueId,
        mode: 'paused',
        pendingIntent: null,
      };
    case 'ITEM_MARKED_STALE':
      return {
        ...state,
        queue: updateQueueItem(state.queue, action.queueId, (item) => ({
          ...item,
          status: QUEUE_ITEM_STATES.STALE,
          progress: null,
        })),
      };
    case 'ITEM_REQUEUED':
      return {
        ...state,
        mode: 'ready',
        queue: updateQueueItem(state.queue, action.queueId, (item) => ({
          ...item,
          status: QUEUE_ITEM_STATES.QUEUED,
          error: null,
          processingPath: 'unknown',
          progress: null,
          outputPreviewUrl: item.outputPreviewUrl,
        })),
      };
    case 'ITEM_REMOVED': {
      const removed = state.queue.find((item) => item.id === action.queueId);
      if (removed) {
        revokeQueueItemUrls(removed, action.revokeObjectUrl);
      }
      const nextQueue = state.queue.filter((item) => item.id !== action.queueId);
      return {
        ...state,
        queue: nextQueue,
        activeQueueId: state.activeQueueId === action.queueId ? null : state.activeQueueId,
        mode: nextQueue.length === 0 ? 'idle' : state.mode,
      };
    }
    case 'QUEUE_PAUSE_REQUESTED':
      return {
        ...state,
        mode: state.activeQueueId === null ? 'paused' : 'pausing',
        pendingIntent: 'pause',
      };
    case 'QUEUE_RESUMED':
      return {
        ...state,
        mode: 'running',
        pendingIntent: null,
      };
    case 'QUEUE_DRAINED':
      return {
        ...state,
        mode: state.queue.some((item) => item.status === QUEUE_ITEM_STATES.COMPLETED || item.status === QUEUE_ITEM_STATES.STALE)
          ? 'done'
          : 'error',
        activeQueueId: null,
        pendingIntent: null,
      };
    case 'QUEUE_RESET':
      state.queue.forEach((item) => revokeQueueItemUrls(item, action.revokeObjectUrl));
      return createWorkflowState();
    case 'ERROR_REPORTED':
      return {
        ...state,
        mode: 'error',
        pendingIntent: null,
      };
    case 'SET_PENDING_INTENT':
      return {
        ...state,
        pendingIntent: action.pendingIntent,
      };
    default:
      return state;
  }
}

export function selectQueueCounts(state: WorkflowState) {
  return {
    pending: state.queue.filter(
      (item) =>
        item.status === QUEUE_ITEM_STATES.QUEUED ||
        item.status === QUEUE_ITEM_STATES.PROCESSING,
    ).length,
    completed: state.queue.filter(
      (item) =>
        item.status === QUEUE_ITEM_STATES.COMPLETED ||
        item.status === QUEUE_ITEM_STATES.STALE,
    ).length,
    stale: state.queue.filter((item) => item.status === QUEUE_ITEM_STATES.STALE).length,
    failed: state.queue.filter((item) => item.status === QUEUE_ITEM_STATES.FAILED).length,
    total: state.queue.length,
  };
}

export function selectQueueControlVisibility(state: WorkflowState): 'pause' | 'resume' | 'hidden' {
  if (state.mode === 'running' || state.mode === 'pausing') {
    return 'pause';
  }
  if (state.mode === 'paused') {
    return 'resume';
  }
  return 'hidden';
}

export function selectExportableQueueIds(state: WorkflowState): number[] {
  return state.queue
    .filter((item) => Boolean(item.result?.blob) || item.result?.persisted === true)
    .map((item) => item.id);
}

function getStatusLabel(item: QueueItemState): string {
  if (item.status === QUEUE_ITEM_STATES.PROCESSING && item.progress?.visible) {
    return `${item.progress.label} ${item.progress.percent}%`;
  }
  switch (item.status) {
    case QUEUE_ITEM_STATES.QUEUED:
      return 'Queued';
    case QUEUE_ITEM_STATES.COMPLETED:
      return 'Completed';
    case QUEUE_ITEM_STATES.FAILED:
      return 'Failed';
    case QUEUE_ITEM_STATES.CANCELLED:
      return 'Cancelled';
    case QUEUE_ITEM_STATES.STALE:
      return 'Needs reprocessing';
    default:
      return 'Processing';
  }
}

export function selectWorkflowCards(state: WorkflowState): WorkflowCard[] {
  return state.queue.map((item) => ({
    queueId: item.id,
    status: item.status,
    statusLabel: getStatusLabel(item),
    filename: item.name,
    previewUrl: item.outputPreviewUrl || item.inputPreviewUrl,
    previewAlt: item.name,
    overlayVisible: item.status === QUEUE_ITEM_STATES.PROCESSING && Boolean(item.progress?.visible),
    progressPercent: item.status === QUEUE_ITEM_STATES.PROCESSING && item.progress?.visible
      ? item.progress.percent
      : null,
    hasOutput: Boolean(item.result?.blob) || item.result?.persisted === true,
    error: item.error,
    isSelectable:
      item.status === QUEUE_ITEM_STATES.COMPLETED ||
      item.status === QUEUE_ITEM_STATES.STALE,
  }));
}

export function mapModeToLegacyWorkflowState(mode: WorkflowMode): string {
  switch (mode) {
    case 'idle':
      return WORKFLOW_STATES.EMPTY;
    case 'ready':
      return WORKFLOW_STATES.QUEUE_READY;
    case 'running':
      return WORKFLOW_STATES.PROCESSING_ACTIVE;
    case 'pausing':
      return WORKFLOW_STATES.PROCESSING_PAUSING;
    case 'paused':
      return WORKFLOW_STATES.PROCESSING_PAUSED;
    case 'done':
      return WORKFLOW_STATES.PROCESSING_DONE;
    case 'error':
      return WORKFLOW_STATES.ERROR_RECOVERABLE;
    default:
      return WORKFLOW_STATES.EMPTY;
  }
}

export function transitionWorkflow(state: string, event: { type?: string } | null | undefined): string {
  const eventType = event?.type;
  if (eventType === WORKFLOW_EVENTS.START_OVER) {
    return WORKFLOW_STATES.EMPTY;
  }

  switch (state) {
    case WORKFLOW_STATES.EMPTY:
      if (eventType === WORKFLOW_EVENTS.FILES_ADDED) {
        return WORKFLOW_STATES.QUEUE_READY;
      }
      return state;

    case WORKFLOW_STATES.QUEUE_READY:
      if (eventType === WORKFLOW_EVENTS.AUTO_START) {
        return WORKFLOW_STATES.PROCESSING_ACTIVE;
      }
      return state;

    case WORKFLOW_STATES.PROCESSING_ACTIVE:
      if (eventType === WORKFLOW_EVENTS.PAUSE_REQUESTED) {
        return WORKFLOW_STATES.PROCESSING_PAUSING;
      }
      if (eventType === WORKFLOW_EVENTS.CANCEL_CURRENT) {
        return WORKFLOW_STATES.PROCESSING_PAUSED;
      }
      if (eventType === WORKFLOW_EVENTS.FILE_FAILED) {
        return WORKFLOW_STATES.PROCESSING_ACTIVE;
      }
      if (eventType === WORKFLOW_EVENTS.QUEUE_DRAINED) {
        return WORKFLOW_STATES.PROCESSING_DONE;
      }
      if (eventType === WORKFLOW_EVENTS.ERROR_REPORTED) {
        return WORKFLOW_STATES.ERROR_RECOVERABLE;
      }
      return state;

    case WORKFLOW_STATES.PROCESSING_PAUSING:
      if (eventType === WORKFLOW_EVENTS.CURRENT_FILE_SETTLED) {
        return WORKFLOW_STATES.PROCESSING_PAUSED;
      }
      if (eventType === WORKFLOW_EVENTS.ERROR_REPORTED) {
        return WORKFLOW_STATES.ERROR_RECOVERABLE;
      }
      return state;

    case WORKFLOW_STATES.PROCESSING_PAUSED:
      if (eventType === WORKFLOW_EVENTS.RESUME_REQUESTED) {
        return WORKFLOW_STATES.PROCESSING_ACTIVE;
      }
      if (eventType === WORKFLOW_EVENTS.FILES_ADDED) {
        return WORKFLOW_STATES.QUEUE_READY;
      }
      return state;

    case WORKFLOW_STATES.PROCESSING_DONE:
      if (eventType === WORKFLOW_EVENTS.FILES_ADDED) {
        return WORKFLOW_STATES.QUEUE_READY;
      }
      if (eventType === WORKFLOW_EVENTS.RESUME_REQUESTED) {
        return WORKFLOW_STATES.PROCESSING_ACTIVE;
      }
      return state;

    case WORKFLOW_STATES.ERROR_RECOVERABLE:
      if (
        eventType === WORKFLOW_EVENTS.RESUME_REQUESTED ||
        eventType === WORKFLOW_EVENTS.AUTO_START
      ) {
        return WORKFLOW_STATES.PROCESSING_ACTIVE;
      }
      if (eventType === WORKFLOW_EVENTS.FILES_ADDED) {
        return WORKFLOW_STATES.QUEUE_READY;
      }
      return state;

    default:
      return state;
  }
}
