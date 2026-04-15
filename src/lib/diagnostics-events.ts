import {
  getSharedDiagnosticsRecorder,
  type DiagnosticsEvent,
  type DiagnosticsEventInput,
  type DiagnosticsEventSeverity,
} from './diagnostics.ts';
import type { RuntimeAssetVersionKind } from './runtime-asset-definitions.ts';

type RuntimeLike = typeof globalThis;

type NullableScalar = string | number | boolean | null | undefined;

function normalizeString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function truncateString(value: unknown, maxLength = 200): string | null {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }
  return normalized.slice(0, maxLength);
}

function normalizeNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function normalizeNullableScalar(value: NullableScalar): string | number | boolean | null {
  if (typeof value === 'string') {
    return normalizeString(value);
  }
  if (typeof value === 'number') {
    return normalizeNumber(value);
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return null;
}

function mergeNormalizedContext(
  baseContext: Record<string, unknown>,
  overrides: Record<string, NullableScalar> = {},
): Record<string, unknown> {
  const normalizedOverrides = Object.fromEntries(
    Object.entries(overrides).map(([key, value]) => [key, normalizeNullableScalar(value)]),
  );
  return {
    ...baseContext,
    ...normalizedOverrides,
  };
}

export const DIAGNOSTICS_EVENT_NAMES = {
  queue: {
    startRequested: 'queue-start-requested',
    startSuppressed: 'queue-start-suppressed',
    itemClaimed: 'queue-item-claimed',
    itemProcessingStarted: 'queue-item-processing-started',
    launchConfirmed: 'queue-launch-confirmed',
    itemProcessingComplete: 'queue-item-processing-complete',
    itemProcessingFailed: 'queue-item-processing-failed',
    itemSettled: 'queue-item-settled',
    duplicateProcessingLaunchBlocked: 'duplicate-processing-launch-blocked',
  },
  runtime: {
    zipRuntimeLoadStarted: 'zip-runtime-load-started',
    zipRuntimeLoadCompleted: 'zip-runtime-load-completed',
    zipRuntimeLoadFailed: 'zip-runtime-load-failed',
    deferredInputPreviewFailed: 'deferred-input-preview-failed',
  },
  user: {
    diagnosticsReportOpened: 'diagnostics-report-opened',
    diagnosticsReportShared: 'diagnostics-report-shared',
    diagnosticsReportCopied: 'diagnostics-report-copied',
    settingsChanged: 'settings-changed',
    processingPaused: 'processing-paused',
    processingResumed: 'processing-resumed',
    processingCancelled: 'processing-cancelled',
    filesAdded: 'files-added',
    filePickerOpened: 'file-picker-opened',
    filesDropped: 'files-dropped',
    appOpened: 'app-opened',
  },
  storage: {
    fullOutputViewerUrlReleased: 'full-output-viewer-url-released',
    fullOutputHydratedOnDemand: 'full-output-hydrated-on-demand',
    queueRestoredFromPersistedPreviews: 'queue-restored-from-persisted-previews',
    outputPreviewPersisted: 'output-preview-persisted',
    outputArtifactPersisted: 'output-artifact-persisted',
  },
  lifecycle: {
    visibilityChanged: 'visibility-changed',
    pagehide: 'pagehide',
    recoveredPopupOpened: 'recovered-popup-opened',
    recoveredPopupSuppressed: 'recovered-popup-suppressed',
  },
  runtimeInit: {
    jpegliStartupBootstrapStarted: 'jpegli-startup-bootstrap-started',
    jpegliStartupBootstrapFailed: 'jpegli-startup-bootstrap-failed',
    jpegliStartupBootstrapBlocked: 'jpegli-startup-bootstrap-blocked',
    jpegliStartupRepairRequested: 'jpegli-startup-repair-requested',
    jpegliStartupRepairSucceeded: 'jpegli-startup-repair-succeeded',
    jpegliStartupBootstrapRetried: 'jpegli-startup-bootstrap-retried',
    jpegliStartupBootstrapRecovered: 'jpegli-startup-bootstrap-recovered',
  },
  runtimeAsset: {
    jpegliLoaderStarted: 'jpegli-loader-started',
    jpegliWasmBinaryFetched: 'jpegli-wasm-binary-fetched',
    jpegliFactoryResolved: 'jpegli-factory-resolved',
    jpegliLoaderReady: 'jpegli-loader-ready',
    jpegliLoaderFailed: 'jpegli-loader-failed',
  },
} as const;

export type QueueDiagnosticsEvent =
  | {
      type: 'start-requested';
      queueLength: number | null;
      runnerState: string | null;
      currentQueueId: number | null;
      reason: string | null;
    }
  | {
      type: 'start-suppressed';
      queueLength: number | null;
      runnerState: string | null;
      currentQueueId: number | null;
      reason: string | null;
    }
  | {
      type: 'item-claimed';
      queueId: number | null;
      queueLength: number | null;
      launchToken: string | null;
      runnerState: string | null;
    }
  | {
      type: 'item-processing-started';
      queueId: number | null;
      queueLength: number | null;
      launchToken: string | null;
    }
  | {
      type: 'launch-confirmed';
      queueId: number | null;
      launchToken: string | null;
      currentQueueId: number | null;
      processingPath: string | null;
    }
  | {
      type: 'item-processing-complete';
      queueId: number | null;
      outputBytes: number | null;
      processingPath: string | null;
      appliedSettingsVersion: number | null;
      appliedRotation: number | null;
    }
  | {
      type: 'item-processing-failed';
      queueId: number | null;
      message: string | null;
      memoryIssueKind: string | null;
      confidence: string | null;
    }
  | {
      type: 'item-settled';
      queueId: number | null;
      queueLength: number | null;
      launchToken: string | null;
    }
  | {
      type: 'duplicate-processing-launch-blocked';
      queueId: number | null;
      launchToken: string | null;
      existingLaunchToken: string | null;
      reason: string | null;
    };

export type RuntimeDiagnosticsEvent =
  | {
      type: 'zip-runtime-load-started';
      operation: string | null;
    }
  | {
      type: 'zip-runtime-load-completed';
      operation: string | null;
    }
  | {
      type: 'zip-runtime-load-failed';
      operation: string | null;
      message: string | null;
    }
  | {
      type: 'deferred-input-preview-failed';
      queueId: number | null;
      trigger: string | null;
      errorCategory: string | null;
      message: string | null;
    };

export type UserDiagnosticsEvent =
  | {
      type: 'diagnostics-report-opened';
      trigger: string | null;
      reportId: string | null;
    }
  | {
      type: 'diagnostics-report-shared' | 'diagnostics-report-copied';
      reportId: string | null;
    }
  | {
      type: 'settings-changed' | 'processing-paused' | 'processing-resumed' | 'processing-cancelled';
      context: Record<string, unknown>;
      severity?: DiagnosticsEventSeverity;
    }
  | {
      type: 'files-added';
      fileCount: number | null;
      queueLength: number | null;
    }
  | {
      type: 'file-picker-opened' | 'files-dropped';
      fileCount: number | null;
    }
  | {
      type: 'app-opened';
      launchSource: string | null;
    };

export type StorageDiagnosticsEvent =
  | {
      type: 'full-output-viewer-url-released';
      queueId: number | null;
      trigger: string | null;
    }
  | {
      type: 'full-output-hydrated-on-demand';
      queueId: number | null;
      artifactBytes: number | null;
      trigger: string | null;
    }
  | {
      type: 'queue-restored-from-persisted-previews';
      queueId: number | null;
      previewBytes: number | null;
      trigger: string | null;
    }
  | {
      type: 'output-preview-persisted';
      queueId: number | null;
      previewBytes: number | null;
      trigger: string | null;
    }
  | {
      type: 'output-artifact-persisted';
      queueId: number | null;
      artifactBytes: number | null;
      trigger: string | null;
    };

export type LifecycleDiagnosticsEvent =
  | {
      type: 'visibility-changed';
      hidden: boolean | null;
      workflowState: string | null;
    }
  | {
      type: 'pagehide';
      context: Record<string, unknown>;
    }
  | {
      type: 'recovered-popup-opened';
      reportId: string | null;
      memoryIssueKind: string | null;
    }
  | {
      type: 'recovered-popup-suppressed';
      reason: string | null;
      reportId: string | null;
      memoryIssueKind: string | null;
    };

type RuntimeInitBaseEvent = {
  attempt: number | null;
  online: boolean | null;
  trigger: string | null;
};

type RuntimeInitExtendedEvent = RuntimeInitBaseEvent & {
  bundleState?: string | null;
  bundleVersion?: string | null;
  errorCategory?: string | null;
  repairAttempted?: boolean | null;
  repairReady?: boolean | null;
};

export type RuntimeInitDiagnosticsEvent =
  | ({
      type: 'jpegli-startup-bootstrap-started';
    } & RuntimeInitBaseEvent)
  | ({
      type:
        | 'jpegli-startup-bootstrap-failed'
        | 'jpegli-startup-bootstrap-blocked'
        | 'jpegli-startup-repair-requested'
        | 'jpegli-startup-repair-succeeded'
        | 'jpegli-startup-bootstrap-retried'
        | 'jpegli-startup-bootstrap-recovered';
    } & RuntimeInitExtendedEvent);

type RuntimeAssetBaseEvent = {
  trigger: string | null;
  assetId: string | null;
  versionKind: RuntimeAssetVersionKind | null;
  cacheName: string | null;
  cacheSource: string | null;
  byteLength: number | null;
  errorCategory: string | null;
};

export type RuntimeAssetDiagnosticsEvent =
  | ({
      type: 'jpegli-loader-started';
      hasGlobalFactory: boolean | null;
    } & RuntimeAssetBaseEvent)
  | ({
      type: 'jpegli-wasm-binary-fetched';
    } & RuntimeAssetBaseEvent)
  | ({
      type: 'jpegli-factory-resolved';
      source: string | null;
    } & RuntimeAssetBaseEvent)
  | ({
      type: 'jpegli-loader-ready';
    } & RuntimeAssetBaseEvent)
  | ({
      type: 'jpegli-loader-failed';
      message: string | null;
    } & RuntimeAssetBaseEvent);

export type PipelineDiagnosticsEvent = {
  type: 'pipeline-breadcrumb';
  phase: string;
  severity: DiagnosticsEventSeverity;
  pipelineId: string | null;
  stage: string | null;
  substage: string | null;
  note: string | null;
  stageProgress: number | null;
  fileIndex: number | null;
  totalFiles: number | null;
  elapsedMs: number | null;
  processingPath: string | null;
  gmnetExecutionProvider: string | null;
  gmnetMemoryMode: string | null;
  gmnetCheckpointTilesCompleted: number | null;
  gmnetCheckpointTilesTotal: number | null;
  gmnetCheckpointResumed: boolean | null;
  error: unknown;
};

export type DiagnosticsDomainEvent =
  | { domain: 'queue'; event: QueueDiagnosticsEvent }
  | { domain: 'runtime'; event: RuntimeDiagnosticsEvent }
  | { domain: 'user'; event: UserDiagnosticsEvent }
  | { domain: 'storage'; event: StorageDiagnosticsEvent }
  | { domain: 'lifecycle'; event: LifecycleDiagnosticsEvent }
  | { domain: 'runtime-init'; event: RuntimeInitDiagnosticsEvent }
  | { domain: 'runtime-asset'; event: RuntimeAssetDiagnosticsEvent }
  | { domain: 'pipeline'; event: PipelineDiagnosticsEvent };

function toDiagnosticsInput(request: DiagnosticsDomainEvent): DiagnosticsEventInput {
  switch (request.domain) {
    case 'queue':
      return buildQueueDiagnosticsInput(request.event);
    case 'runtime':
      return buildRuntimeDiagnosticsInput(request.event);
    case 'user':
      return buildUserDiagnosticsInput(request.event);
    case 'storage':
      return buildStorageDiagnosticsInput(request.event);
    case 'lifecycle':
      return buildLifecycleDiagnosticsInput(request.event);
    case 'runtime-init':
      return buildRuntimeInitDiagnosticsInput(request.event);
    case 'runtime-asset':
      return buildRuntimeAssetDiagnosticsInput(request.event);
    case 'pipeline':
      return buildPipelineDiagnosticsInput(request.event);
  }
}

function buildQueueDiagnosticsInput(event: QueueDiagnosticsEvent): DiagnosticsEventInput {
  switch (event.type) {
    case 'start-requested':
      return {
        category: 'pipeline',
        name: DIAGNOSTICS_EVENT_NAMES.queue.startRequested,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          queueLength: event.queueLength,
          runnerState: event.runnerState,
          currentQueueId: event.currentQueueId,
          reason: event.reason,
        }),
      };
    case 'start-suppressed':
      return {
        category: 'pipeline',
        name: DIAGNOSTICS_EVENT_NAMES.queue.startSuppressed,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          queueLength: event.queueLength,
          runnerState: event.runnerState,
          currentQueueId: event.currentQueueId,
          reason: event.reason,
        }),
      };
    case 'item-claimed':
      return {
        category: 'pipeline',
        name: DIAGNOSTICS_EVENT_NAMES.queue.itemClaimed,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          queueId: event.queueId,
          queueLength: event.queueLength,
          launchToken: event.launchToken,
          runnerState: event.runnerState,
        }),
      };
    case 'item-processing-started':
      return {
        category: 'pipeline',
        name: DIAGNOSTICS_EVENT_NAMES.queue.itemProcessingStarted,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          queueId: event.queueId,
          queueLength: event.queueLength,
          launchToken: event.launchToken,
        }),
      };
    case 'launch-confirmed':
      return {
        category: 'pipeline',
        name: DIAGNOSTICS_EVENT_NAMES.queue.launchConfirmed,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          queueId: event.queueId,
          launchToken: event.launchToken,
          currentQueueId: event.currentQueueId,
          processingPath: event.processingPath,
        }),
      };
    case 'item-processing-complete':
      return {
        category: 'pipeline',
        name: DIAGNOSTICS_EVENT_NAMES.queue.itemProcessingComplete,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          queueId: event.queueId,
          outputBytes: event.outputBytes,
          processingPath: event.processingPath,
          appliedSettingsVersion: event.appliedSettingsVersion,
          appliedRotation: event.appliedRotation,
        }),
      };
    case 'item-processing-failed':
      return {
        category: event.memoryIssueKind && event.memoryIssueKind !== 'unknown' ? 'memory' : 'error',
        name: DIAGNOSTICS_EVENT_NAMES.queue.itemProcessingFailed,
        severity: 'error',
        context: {
          queueId: normalizeNumber(event.queueId),
          message: truncateString(event.message),
          memoryIssueKind: normalizeString(event.memoryIssueKind),
          confidence: normalizeString(event.confidence),
        },
      };
    case 'item-settled':
      return {
        category: 'pipeline',
        name: DIAGNOSTICS_EVENT_NAMES.queue.itemSettled,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          queueId: event.queueId,
          queueLength: event.queueLength,
          launchToken: event.launchToken,
        }),
      };
    case 'duplicate-processing-launch-blocked':
      return {
        category: 'pipeline',
        name: DIAGNOSTICS_EVENT_NAMES.queue.duplicateProcessingLaunchBlocked,
        severity: 'warning',
        context: mergeNormalizedContext({}, {
          queueId: event.queueId,
          launchToken: event.launchToken,
          existingLaunchToken: event.existingLaunchToken,
          reason: event.reason,
        }),
      };
  }
}

function buildRuntimeDiagnosticsInput(event: RuntimeDiagnosticsEvent): DiagnosticsEventInput {
  switch (event.type) {
    case 'zip-runtime-load-started':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtime.zipRuntimeLoadStarted,
        severity: 'info',
        context: mergeNormalizedContext({}, { operation: event.operation }),
      };
    case 'zip-runtime-load-completed':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtime.zipRuntimeLoadCompleted,
        severity: 'info',
        context: mergeNormalizedContext({}, { operation: event.operation }),
      };
    case 'zip-runtime-load-failed':
      return {
        category: 'error',
        name: DIAGNOSTICS_EVENT_NAMES.runtime.zipRuntimeLoadFailed,
        severity: 'error',
        context: {
          operation: normalizeString(event.operation),
          message: truncateString(event.message),
        },
      };
    case 'deferred-input-preview-failed':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtime.deferredInputPreviewFailed,
        severity: 'warning',
        context: {
          queueId: normalizeNumber(event.queueId),
          trigger: normalizeString(event.trigger),
          errorCategory: normalizeString(event.errorCategory),
          message: truncateString(event.message),
        },
      };
  }
}

function buildUserDiagnosticsInput(event: UserDiagnosticsEvent): DiagnosticsEventInput {
  switch (event.type) {
    case 'diagnostics-report-opened':
      return {
        category: 'user',
        name: DIAGNOSTICS_EVENT_NAMES.user.diagnosticsReportOpened,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          trigger: event.trigger,
          reportId: event.reportId,
        }),
      };
    case 'diagnostics-report-shared':
      return {
        category: 'user',
        name: DIAGNOSTICS_EVENT_NAMES.user.diagnosticsReportShared,
        severity: 'info',
        context: mergeNormalizedContext({}, { reportId: event.reportId }),
      };
    case 'diagnostics-report-copied':
      return {
        category: 'user',
        name: DIAGNOSTICS_EVENT_NAMES.user.diagnosticsReportCopied,
        severity: 'info',
        context: mergeNormalizedContext({}, { reportId: event.reportId }),
      };
    case 'settings-changed':
      return {
        category: 'user',
        name: DIAGNOSTICS_EVENT_NAMES.user.settingsChanged,
        severity: event.severity ?? 'info',
        context: event.context,
      };
    case 'processing-paused':
      return {
        category: 'user',
        name: DIAGNOSTICS_EVENT_NAMES.user.processingPaused,
        severity: event.severity ?? 'info',
        context: event.context,
      };
    case 'processing-resumed':
      return {
        category: 'user',
        name: DIAGNOSTICS_EVENT_NAMES.user.processingResumed,
        severity: event.severity ?? 'info',
        context: event.context,
      };
    case 'processing-cancelled':
      return {
        category: 'user',
        name: DIAGNOSTICS_EVENT_NAMES.user.processingCancelled,
        severity: event.severity ?? 'warning',
        context: event.context,
      };
    case 'files-added':
      return {
        category: 'user',
        name: DIAGNOSTICS_EVENT_NAMES.user.filesAdded,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          fileCount: event.fileCount,
          queueLength: event.queueLength,
        }),
      };
    case 'file-picker-opened':
      return {
        category: 'user',
        name: DIAGNOSTICS_EVENT_NAMES.user.filePickerOpened,
        severity: 'info',
        context: mergeNormalizedContext({}, { fileCount: event.fileCount }),
      };
    case 'files-dropped':
      return {
        category: 'user',
        name: DIAGNOSTICS_EVENT_NAMES.user.filesDropped,
        severity: 'info',
        context: mergeNormalizedContext({}, { fileCount: event.fileCount }),
      };
    case 'app-opened':
      return {
        category: 'user',
        name: DIAGNOSTICS_EVENT_NAMES.user.appOpened,
        severity: 'info',
        context: mergeNormalizedContext({}, { launchSource: event.launchSource }),
      };
  }
}

function buildStorageDiagnosticsInput(event: StorageDiagnosticsEvent): DiagnosticsEventInput {
  switch (event.type) {
    case 'full-output-viewer-url-released':
      return {
        category: 'storage',
        name: DIAGNOSTICS_EVENT_NAMES.storage.fullOutputViewerUrlReleased,
        severity: 'info',
        context: mergeNormalizedContext({}, { queueId: event.queueId, trigger: event.trigger }),
      };
    case 'full-output-hydrated-on-demand':
      return {
        category: 'storage',
        name: DIAGNOSTICS_EVENT_NAMES.storage.fullOutputHydratedOnDemand,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          queueId: event.queueId,
          artifactBytes: event.artifactBytes,
          trigger: event.trigger,
        }),
      };
    case 'queue-restored-from-persisted-previews':
      return {
        category: 'storage',
        name: DIAGNOSTICS_EVENT_NAMES.storage.queueRestoredFromPersistedPreviews,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          queueId: event.queueId,
          previewBytes: event.previewBytes,
          trigger: event.trigger,
        }),
      };
    case 'output-preview-persisted':
      return {
        category: 'storage',
        name: DIAGNOSTICS_EVENT_NAMES.storage.outputPreviewPersisted,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          queueId: event.queueId,
          previewBytes: event.previewBytes,
          trigger: event.trigger,
        }),
      };
    case 'output-artifact-persisted':
      return {
        category: 'storage',
        name: DIAGNOSTICS_EVENT_NAMES.storage.outputArtifactPersisted,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          queueId: event.queueId,
          artifactBytes: event.artifactBytes,
          trigger: event.trigger,
        }),
      };
  }
}

function buildLifecycleDiagnosticsInput(event: LifecycleDiagnosticsEvent): DiagnosticsEventInput {
  switch (event.type) {
    case 'visibility-changed':
      return {
        category: 'lifecycle',
        name: DIAGNOSTICS_EVENT_NAMES.lifecycle.visibilityChanged,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          hidden: event.hidden,
          workflowState: event.workflowState,
        }),
      };
    case 'pagehide':
      return {
        category: 'lifecycle',
        name: DIAGNOSTICS_EVENT_NAMES.lifecycle.pagehide,
        severity: 'warning',
        context: event.context,
      };
    case 'recovered-popup-opened':
      return {
        category: 'lifecycle',
        name: DIAGNOSTICS_EVENT_NAMES.lifecycle.recoveredPopupOpened,
        severity: 'warning',
        context: mergeNormalizedContext({}, {
          reportId: event.reportId,
          memoryIssueKind: event.memoryIssueKind,
        }),
      };
    case 'recovered-popup-suppressed':
      return {
        category: 'lifecycle',
        name: DIAGNOSTICS_EVENT_NAMES.lifecycle.recoveredPopupSuppressed,
        severity: 'info',
        context: mergeNormalizedContext({}, {
          reason: event.reason,
          reportId: event.reportId,
          memoryIssueKind: event.memoryIssueKind,
        }),
      };
  }
}

function buildRuntimeInitDiagnosticsInput(event: RuntimeInitDiagnosticsEvent): DiagnosticsEventInput {
  const baseContext = mergeNormalizedContext({}, {
    attempt: event.attempt,
    online: event.online,
    trigger: event.trigger,
  });
  switch (event.type) {
    case 'jpegli-startup-bootstrap-started':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeInit.jpegliStartupBootstrapStarted,
        severity: 'info',
        context: baseContext,
      };
    case 'jpegli-startup-bootstrap-failed':
      return {
        category: 'error',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeInit.jpegliStartupBootstrapFailed,
        severity: 'error',
        context: mergeNormalizedContext(baseContext, {
          bundleState: event.bundleState,
          bundleVersion: event.bundleVersion,
          errorCategory: event.errorCategory,
          repairAttempted: event.repairAttempted,
          repairReady: event.repairReady,
        }),
      };
    case 'jpegli-startup-bootstrap-blocked':
      return {
        category: 'error',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeInit.jpegliStartupBootstrapBlocked,
        severity: 'error',
        context: mergeNormalizedContext(baseContext, {
          bundleState: event.bundleState,
          bundleVersion: event.bundleVersion,
          errorCategory: event.errorCategory,
          repairAttempted: event.repairAttempted,
          repairReady: event.repairReady,
        }),
      };
    case 'jpegli-startup-repair-requested':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeInit.jpegliStartupRepairRequested,
        severity: 'warning',
        context: mergeNormalizedContext(baseContext, {
          bundleState: event.bundleState,
          bundleVersion: event.bundleVersion,
          errorCategory: event.errorCategory,
          repairAttempted: event.repairAttempted,
          repairReady: event.repairReady,
        }),
      };
    case 'jpegli-startup-repair-succeeded':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeInit.jpegliStartupRepairSucceeded,
        severity: 'info',
        context: mergeNormalizedContext(baseContext, {
          bundleState: event.bundleState,
          bundleVersion: event.bundleVersion,
          errorCategory: event.errorCategory,
          repairAttempted: event.repairAttempted,
          repairReady: event.repairReady,
        }),
      };
    case 'jpegli-startup-bootstrap-retried':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeInit.jpegliStartupBootstrapRetried,
        severity: 'warning',
        context: mergeNormalizedContext(baseContext, {
          bundleState: event.bundleState,
          bundleVersion: event.bundleVersion,
          errorCategory: event.errorCategory,
          repairAttempted: event.repairAttempted,
          repairReady: event.repairReady,
        }),
      };
    case 'jpegli-startup-bootstrap-recovered':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeInit.jpegliStartupBootstrapRecovered,
        severity: 'info',
        context: mergeNormalizedContext(baseContext, {
          bundleState: event.bundleState,
          bundleVersion: event.bundleVersion,
          errorCategory: event.errorCategory,
          repairAttempted: event.repairAttempted,
          repairReady: event.repairReady,
        }),
      };
  }
}

function buildRuntimeAssetDiagnosticsInput(event: RuntimeAssetDiagnosticsEvent): DiagnosticsEventInput {
  const baseContext = mergeNormalizedContext({}, {
    trigger: event.trigger,
    assetId: event.assetId,
    versionKind: event.versionKind,
    cacheName: event.cacheName,
    cacheSource: event.cacheSource,
    byteLength: event.byteLength,
    errorCategory: event.errorCategory,
  });
  switch (event.type) {
    case 'jpegli-loader-started':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeAsset.jpegliLoaderStarted,
        severity: 'info',
        context: mergeNormalizedContext(baseContext, {
          hasGlobalFactory: event.hasGlobalFactory,
        }),
      };
    case 'jpegli-wasm-binary-fetched':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeAsset.jpegliWasmBinaryFetched,
        severity: 'info',
        context: baseContext,
      };
    case 'jpegli-factory-resolved':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeAsset.jpegliFactoryResolved,
        severity: 'info',
        context: mergeNormalizedContext(baseContext, {
          source: event.source,
        }),
      };
    case 'jpegli-loader-ready':
      return {
        category: 'runtime',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeAsset.jpegliLoaderReady,
        severity: 'info',
        context: baseContext,
      };
    case 'jpegli-loader-failed':
      return {
        category: 'error',
        name: DIAGNOSTICS_EVENT_NAMES.runtimeAsset.jpegliLoaderFailed,
        severity: 'error',
        context: {
          ...baseContext,
          message: truncateString(event.message),
        },
      };
  }
}

function buildPipelineDiagnosticsInput(event: PipelineDiagnosticsEvent): DiagnosticsEventInput {
  return {
    category: 'pipeline',
    name: event.phase,
    severity: event.severity,
    context: {
      pipelineId: normalizeString(event.pipelineId),
      stage: normalizeString(event.stage),
      substage: normalizeString(event.substage),
      note: normalizeString(event.note),
      stageProgress: normalizeNumber(event.stageProgress),
      fileIndex: normalizeNumber(event.fileIndex),
      totalFiles: normalizeNumber(event.totalFiles),
      elapsedMs: normalizeNumber(event.elapsedMs),
      processingPath: normalizeString(event.processingPath),
      gmnetExecutionProvider: normalizeString(event.gmnetExecutionProvider),
      gmnetMemoryMode: normalizeString(event.gmnetMemoryMode),
      gmnetCheckpointTilesCompleted: normalizeNumber(event.gmnetCheckpointTilesCompleted),
      gmnetCheckpointTilesTotal: normalizeNumber(event.gmnetCheckpointTilesTotal),
      gmnetCheckpointResumed: normalizeBoolean(event.gmnetCheckpointResumed),
      error: event.error && typeof event.error === 'object' ? event.error : null,
    },
  };
}

export function recordDiagnosticsEvent(
  runtime: RuntimeLike = globalThis,
  request: DiagnosticsDomainEvent,
): DiagnosticsEvent {
  return getSharedDiagnosticsRecorder(runtime).record(toDiagnosticsInput(request));
}

export function recordQueueDiagnostics(runtime: RuntimeLike = globalThis, event: QueueDiagnosticsEvent): DiagnosticsEvent {
  return recordDiagnosticsEvent(runtime, { domain: 'queue', event });
}

export function recordRuntimeDiagnostics(runtime: RuntimeLike = globalThis, event: RuntimeDiagnosticsEvent): DiagnosticsEvent {
  return recordDiagnosticsEvent(runtime, { domain: 'runtime', event });
}

export function recordUserDiagnostics(runtime: RuntimeLike = globalThis, event: UserDiagnosticsEvent): DiagnosticsEvent {
  return recordDiagnosticsEvent(runtime, { domain: 'user', event });
}

export function recordStorageDiagnostics(runtime: RuntimeLike = globalThis, event: StorageDiagnosticsEvent): DiagnosticsEvent {
  return recordDiagnosticsEvent(runtime, { domain: 'storage', event });
}

export function recordLifecycleDiagnostics(runtime: RuntimeLike = globalThis, event: LifecycleDiagnosticsEvent): DiagnosticsEvent {
  return recordDiagnosticsEvent(runtime, { domain: 'lifecycle', event });
}

export function recordRuntimeInitDiagnostics(runtime: RuntimeLike = globalThis, event: RuntimeInitDiagnosticsEvent): DiagnosticsEvent {
  return recordDiagnosticsEvent(runtime, { domain: 'runtime-init', event });
}

export function recordRuntimeAssetDiagnostics(runtime: RuntimeLike = globalThis, event: RuntimeAssetDiagnosticsEvent): DiagnosticsEvent {
  return recordDiagnosticsEvent(runtime, { domain: 'runtime-asset', event });
}

export function recordPipelineDiagnostics(runtime: RuntimeLike = globalThis, event: PipelineDiagnosticsEvent): DiagnosticsEvent {
  return recordDiagnosticsEvent(runtime, { domain: 'pipeline', event });
}

export function getRecordedDiagnosticsEvents(runtime: RuntimeLike = globalThis): DiagnosticsEvent[] {
  return getSharedDiagnosticsRecorder(runtime).getEvents();
}
