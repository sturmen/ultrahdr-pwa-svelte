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

export function transitionWorkflow(state, event) {
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
