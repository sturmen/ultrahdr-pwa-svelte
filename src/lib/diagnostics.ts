import { getCapabilities } from './capabilities.js';

export const DIAGNOSTICS_REPORTS_KEY = '__ultrahdrDiagnosticsReports';
export const DIAGNOSTICS_ACTIVE_SESSION_KEY = '__ultrahdrDiagnosticsActiveSession';

export type DiagnosticsEventCategory =
  | 'user'
  | 'pipeline'
  | 'runtime'
  | 'worker'
  | 'storage'
  | 'lifecycle'
  | 'error'
  | 'memory';

export type DiagnosticsEventSeverity = 'info' | 'warning' | 'error';
export type MemoryIssueKind =
  | 'pressure'
  | 'allocation-failure'
  | 'watchdog-abort'
  | 'background-kill-recovered'
  | 'unknown';
export type MemoryIssueConfidence = 'high' | 'medium' | 'low';
export type DiagnosticsTrigger = 'auto' | 'manual' | 'recovered-after-relaunch';

export interface DiagnosticsEvent {
  eventId: string;
  sessionId: string;
  sequence: number;
  timestamp: number;
  category: DiagnosticsEventCategory;
  name: string;
  severity: DiagnosticsEventSeverity;
  context: Record<string, unknown>;
}

export interface DiagnosticsEventInput {
  category: DiagnosticsEventCategory;
  name: string;
  severity?: DiagnosticsEventSeverity;
  context?: Record<string, unknown>;
  preserve?: boolean;
}

export interface MemoryIssueSummary {
  memoryIssueKind: MemoryIssueKind;
  confidence: MemoryIssueConfidence;
  message: string;
}

export interface DiagnosticsReport {
  reportId: string;
  trigger: DiagnosticsTrigger;
  createdAt: number;
  app: Record<string, unknown>;
  runtime: Record<string, unknown>;
  processing: Record<string, unknown>;
  incident: MemoryIssueSummary;
  recentEvents: DiagnosticsEvent[];
}

export interface DiagnosticsInputFileSummary {
  mimeType: string | null;
  fileSize: number | null;
  pixelWidth: number | null;
  pixelHeight: number | null;
}

export interface DiagnosticsPipelineBreadcrumbSummary {
  phase: string | null;
  stage: string | null;
  substage: string | null;
  note: string | null;
  stageProgress: number | null;
  elapsedMs: number | null;
}

export interface DiagnosticsProcessingSnapshot {
  currentQueueId: number | null;
  queueIndex: number | null;
  totalFiles: number | null;
  currentStage: string | null;
  currentPhase: string | null;
  currentSubstage: string | null;
  currentNote: string | null;
  currentElapsedMs: number | null;
  stageProgress: number | null;
  pipelineId: string | null;
  pipelineExecutionProvider: string | null;
  gmnetMemoryMode: string | null;
  gmnetCheckpointingMode: string | null;
  settingsVersion: number | null;
  rotation: number | null;
  inputFile: DiagnosticsInputFileSummary | null;
  gmnetCheckpointTilesCompleted: number | null;
  gmnetCheckpointTilesTotal: number | null;
  gmnetCheckpointResumed: boolean | null;
  documentHidden: boolean | null;
  lastPageHideAt: number | null;
  storageQuotaBytes: number | null;
  storageUsageBytes: number | null;
  storageRemainingBytes: number | null;
  recentPipelineBreadcrumbs: DiagnosticsPipelineBreadcrumbSummary[];
}

export interface DiagnosticsRecorder {
  record: (event: DiagnosticsEventInput) => DiagnosticsEvent;
  getEvents: () => DiagnosticsEvent[];
  markProcessingActive: (context?: Record<string, unknown>) => void;
  updateProcessingSnapshot: (context?: Record<string, unknown>) => void;
  markProcessingComplete: (context?: Record<string, unknown>) => void;
  clearActiveSession: () => void;
}

interface DiagnosticsRecorderOptions {
  maxEvents?: number;
  persistKey?: string;
}

interface RuntimeLike {
  localStorage?: Storage;
  navigator?: Navigator & {
    deviceMemory?: number;
    clipboard?: Clipboard;
  };
  performance?: Performance & {
    memory?: {
      usedJSHeapSize?: number;
      totalJSHeapSize?: number;
      jsHeapSizeLimit?: number;
    };
  };
  __ultrahdrDiagnosticsRecorder?: DiagnosticsRecorder;
}

interface DiagnosticsActiveSession {
  sessionId: string;
  active: boolean;
  cleanExit: boolean;
  updatedAt: number;
  processingActiveAtLastPersist?: boolean;
  processingSnapshot?: DiagnosticsProcessingSnapshot;
  queueId?: number | null;
  stage?: string | null;
}

function now(): number {
  return Date.now();
}

function createId(prefix: string): string {
  return `${prefix}-${now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function safeParseJson<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function getPersistedEvents(runtime: RuntimeLike, persistKey: string): DiagnosticsEvent[] {
  const parsed = safeParseJson<{ events?: DiagnosticsEvent[] }>(
    runtime.localStorage?.getItem(persistKey) || null,
    {},
  );
  return Array.isArray(parsed.events) ? parsed.events : [];
}

function persistEvents(runtime: RuntimeLike, persistKey: string, events: DiagnosticsEvent[]): void {
  runtime.localStorage?.setItem(
    persistKey,
    JSON.stringify({
      events,
    }),
  );
}

function getPerformanceMemory(runtime: RuntimeLike): Record<string, number | null> {
  const memory = runtime.performance?.memory;
  return {
    usedJSHeapSize:
      typeof memory?.usedJSHeapSize === 'number' ? memory.usedJSHeapSize : null,
    totalJSHeapSize:
      typeof memory?.totalJSHeapSize === 'number' ? memory.totalJSHeapSize : null,
    jsHeapSizeLimit:
      typeof memory?.jsHeapSizeLimit === 'number' ? memory.jsHeapSizeLimit : null,
  };
}

function normalizeNullableNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function normalizeNullableBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function sanitizeInputFileSummary(value: unknown): DiagnosticsInputFileSummary | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const input = value as Record<string, unknown>;
  return {
    mimeType: normalizeNullableString(input.mimeType),
    fileSize: normalizeNullableNumber(input.fileSize),
    pixelWidth: normalizeNullableNumber(input.pixelWidth),
    pixelHeight: normalizeNullableNumber(input.pixelHeight),
  };
}

function sanitizePipelineBreadcrumbSummary(
  value: unknown,
): DiagnosticsPipelineBreadcrumbSummary | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const input = value as Record<string, unknown>;
  return {
    phase: normalizeNullableString(input.phase),
    stage: normalizeNullableString(input.stage),
    substage: normalizeNullableString(input.substage),
    note: normalizeNullableString(input.note),
    stageProgress: normalizeNullableNumber(input.stageProgress),
    elapsedMs: normalizeNullableNumber(input.elapsedMs),
  };
}

function sanitizeProcessingSnapshot(value: unknown): DiagnosticsProcessingSnapshot | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const snapshot = value as Record<string, unknown>;
  return {
    currentQueueId: normalizeNullableNumber(snapshot.currentQueueId ?? snapshot.queueId),
    queueIndex: normalizeNullableNumber(snapshot.queueIndex),
    totalFiles: normalizeNullableNumber(snapshot.totalFiles),
    currentStage: normalizeNullableString(snapshot.currentStage ?? snapshot.stage),
    currentPhase: normalizeNullableString(snapshot.currentPhase ?? snapshot.phase),
    currentSubstage: normalizeNullableString(snapshot.currentSubstage ?? snapshot.substage),
    currentNote: normalizeNullableString(snapshot.currentNote ?? snapshot.note),
    currentElapsedMs: normalizeNullableNumber(snapshot.currentElapsedMs ?? snapshot.elapsedMs),
    stageProgress: normalizeNullableNumber(snapshot.stageProgress),
    pipelineId: normalizeNullableString(snapshot.pipelineId),
    pipelineExecutionProvider: normalizeNullableString(snapshot.pipelineExecutionProvider),
    gmnetMemoryMode: normalizeNullableString(snapshot.gmnetMemoryMode),
    gmnetCheckpointingMode: normalizeNullableString(snapshot.gmnetCheckpointingMode),
    settingsVersion: normalizeNullableNumber(snapshot.settingsVersion),
    rotation: normalizeNullableNumber(snapshot.rotation),
    inputFile: sanitizeInputFileSummary(snapshot.inputFile),
    gmnetCheckpointTilesCompleted: normalizeNullableNumber(
      snapshot.gmnetCheckpointTilesCompleted,
    ),
    gmnetCheckpointTilesTotal: normalizeNullableNumber(snapshot.gmnetCheckpointTilesTotal),
    gmnetCheckpointResumed: normalizeNullableBoolean(snapshot.gmnetCheckpointResumed),
    documentHidden: normalizeNullableBoolean(snapshot.documentHidden),
    lastPageHideAt: normalizeNullableNumber(snapshot.lastPageHideAt),
    storageQuotaBytes: normalizeNullableNumber(snapshot.storageQuotaBytes),
    storageUsageBytes: normalizeNullableNumber(snapshot.storageUsageBytes),
    storageRemainingBytes: normalizeNullableNumber(snapshot.storageRemainingBytes),
    recentPipelineBreadcrumbs: Array.isArray(snapshot.recentPipelineBreadcrumbs)
      ? snapshot.recentPipelineBreadcrumbs
          .map((breadcrumb) => sanitizePipelineBreadcrumbSummary(breadcrumb))
          .filter((breadcrumb): breadcrumb is DiagnosticsPipelineBreadcrumbSummary => breadcrumb !== null)
      : [],
  };
}

function mergeProcessingSnapshots(
  base: DiagnosticsProcessingSnapshot | null,
  patch: DiagnosticsProcessingSnapshot | null,
): DiagnosticsProcessingSnapshot | null {
  if (!base) {
    return patch;
  }
  if (!patch) {
    return base;
  }

  return {
    ...base,
    ...patch,
    inputFile: patch.inputFile ?? base.inputFile,
    recentPipelineBreadcrumbs:
      patch.recentPipelineBreadcrumbs.length > 0
        ? patch.recentPipelineBreadcrumbs
        : base.recentPipelineBreadcrumbs,
  };
}

function getPersistedActiveSession(runtime: RuntimeLike): DiagnosticsActiveSession | null {
  return safeParseJson<DiagnosticsActiveSession | null>(
    runtime.localStorage?.getItem(DIAGNOSTICS_ACTIVE_SESSION_KEY) || null,
    null,
  );
}

function getContextProcessingSnapshot(
  context: Record<string, unknown>,
): DiagnosticsProcessingSnapshot | null {
  return sanitizeProcessingSnapshot(context.processingSnapshot ?? context);
}

function getContextProcessingActiveFlag(
  context: Record<string, unknown>,
): boolean | null {
  return normalizeNullableBoolean(context.processingActiveAtLastPersist);
}

export function createDiagnosticsRecorder(
  runtime: RuntimeLike = globalThis,
  options: DiagnosticsRecorderOptions = {},
): DiagnosticsRecorder {
  const persistKey = options.persistKey || DIAGNOSTICS_REPORTS_KEY;
  const maxEvents = Math.max(3, Math.floor(options.maxEvents || 200));
  const sessionId = createId('session');
  let events = getPersistedEvents(runtime, persistKey);
  let nextSequence =
    events.reduce((maxValue, event) => Math.max(maxValue, Number(event?.sequence) || 0), -1) + 1;

  function trimEvents(): void {
    while (events.length > maxEvents) {
      const firstNonCriticalIndex = events.findIndex((event) => event.severity !== 'error');
      if (firstNonCriticalIndex === -1) {
        events.shift();
      } else {
        events.splice(firstNonCriticalIndex, 1);
      }
    }
  }

  function writeActiveSession(active: boolean, context: Record<string, unknown> = {}): void {
    const persistedSession = getPersistedActiveSession(runtime);
    const processingSnapshot = mergeProcessingSnapshots(
      sanitizeProcessingSnapshot(persistedSession?.processingSnapshot),
      getContextProcessingSnapshot(context),
    );
    const persistedProcessingActive =
      typeof persistedSession?.processingActiveAtLastPersist === 'boolean'
        ? persistedSession.processingActiveAtLastPersist
        : false;
    const processingActiveAtLastPersist =
      getContextProcessingActiveFlag(context) ?? persistedProcessingActive;
    const { processingSnapshot: ignoredProcessingSnapshot, ...restContext } = context;
    void ignoredProcessingSnapshot;
    runtime.localStorage?.setItem(
      DIAGNOSTICS_ACTIVE_SESSION_KEY,
      JSON.stringify({
        sessionId,
        active,
        cleanExit: !active,
        updatedAt: now(),
        processingActiveAtLastPersist,
        ...restContext,
        processingSnapshot,
        queueId: processingSnapshot?.currentQueueId ?? null,
        stage: processingSnapshot?.currentStage ?? null,
      }),
    );
  }

  return {
    record: (eventInput) => {
      const event: DiagnosticsEvent = {
        eventId: createId('diag'),
        sessionId,
        sequence: nextSequence++,
        timestamp: now(),
        category: eventInput.category,
        name: eventInput.name,
        severity: eventInput.severity || 'info',
        context: { ...(eventInput.context || {}) },
      };
      events = [...events, event];
      trimEvents();
      persistEvents(runtime, persistKey, events);
      return event;
    },
    getEvents: () => events.map((event) => ({ ...event, context: { ...event.context } })),
    markProcessingActive: (context = {}) => {
      writeActiveSession(true, {
        ...context,
        processingActiveAtLastPersist: true,
      });
    },
    updateProcessingSnapshot: (context = {}) => {
      writeActiveSession(true, context);
    },
    markProcessingComplete: (context = {}) => {
      writeActiveSession(false, {
        ...context,
        processingActiveAtLastPersist: false,
      });
    },
    clearActiveSession: () => {
      runtime.localStorage?.removeItem(DIAGNOSTICS_ACTIVE_SESSION_KEY);
    },
  };
}

export function getSharedDiagnosticsRecorder(
  runtime: RuntimeLike = globalThis,
): DiagnosticsRecorder {
  if (!runtime.__ultrahdrDiagnosticsRecorder) {
    runtime.__ultrahdrDiagnosticsRecorder = createDiagnosticsRecorder(runtime);
  }
  return runtime.__ultrahdrDiagnosticsRecorder;
}

export function classifyMemoryIssue(error: unknown): MemoryIssueSummary {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown error';
  const normalized = message.toLowerCase();

  if (
    normalized.includes('out of memory') ||
    normalized.includes('failed to allocate') ||
    normalized.includes('memory allocation failed') ||
    normalized.includes('array buffer allocation failed')
  ) {
    return {
      memoryIssueKind: 'allocation-failure',
      confidence: 'high',
      message,
    };
  }

  if (normalized.includes('terminated') || normalized.includes('killed')) {
    return {
      memoryIssueKind: 'watchdog-abort',
      confidence: 'medium',
      message,
    };
  }

  return {
    memoryIssueKind: 'unknown',
    confidence: 'low',
    message,
  };
}

export function buildMemoryDiagnosticsReport(
  trigger: DiagnosticsTrigger,
  options: {
    runtime?: RuntimeLike;
    recorder?: DiagnosticsRecorder;
    incident?: MemoryIssueSummary | null;
    context?: Record<string, unknown>;
  } = {},
): DiagnosticsReport {
  const runtime = options.runtime || globalThis;
  const recorder = options.recorder || getSharedDiagnosticsRecorder(runtime);
  const capabilities = getCapabilities({
    navigator: runtime.navigator,
    window: typeof window !== 'undefined' ? window : undefined,
  });
  const incident =
    options.incident ||
    ({
      memoryIssueKind: 'unknown',
      confidence: 'low',
      message: 'Manual diagnostics report',
    } as MemoryIssueSummary);

  return {
    reportId: createId('report'),
    trigger,
    createdAt: now(),
    app: {
      appVersion: import.meta.env.VITE_APP_VERSION || 'dev',
      assetVersion: import.meta.env.VITE_APP_ASSET_VERSION || 'dev-unversioned-app',
    },
    runtime: {
      userAgent: capabilities.userAgent,
      deviceMemory: capabilities.deviceMemory,
      isIOS: capabilities.isIOS,
      isAndroid: capabilities.isAndroid,
      isSafari: capabilities.isSafari,
      isStandalone: capabilities.isStandalone,
      ...getPerformanceMemory(runtime),
    },
    processing: {
      ...(options.context || {}),
    },
    incident,
    recentEvents: recorder.getEvents(),
  };
}

export function serializeDiagnosticsReport(report: DiagnosticsReport): string {
  return JSON.stringify(report, null, 2);
}

export async function shareDiagnosticsReport(
  report: DiagnosticsReport,
  runtime: RuntimeLike = globalThis,
): Promise<void> {
  const shareText = serializeDiagnosticsReport(report);
  if (runtime.navigator && typeof runtime.navigator.share === 'function') {
    await runtime.navigator.share({
      title: 'UltraHDR Diagnostics Report',
      text: shareText,
    });
    return;
  }
  throw new Error('Browser share is unavailable.');
}

export async function copyDiagnosticsReport(
  report: DiagnosticsReport,
  runtime: RuntimeLike = globalThis,
): Promise<void> {
  if (!runtime.navigator?.clipboard || typeof runtime.navigator.clipboard.writeText !== 'function') {
    throw new Error('Clipboard is unavailable.');
  }
  await runtime.navigator.clipboard.writeText(serializeDiagnosticsReport(report));
}

export function consumeRecoveredDiagnosticsReport(
  runtime: RuntimeLike = globalThis,
): DiagnosticsReport | null {
  const activeSession = getPersistedActiveSession(runtime);
  if (!activeSession || activeSession.active !== true) {
    return null;
  }

  runtime.localStorage?.removeItem(DIAGNOSTICS_ACTIVE_SESSION_KEY);
  if (activeSession.processingActiveAtLastPersist !== true) {
    return null;
  }
  const recorder = createDiagnosticsRecorder(runtime, {
    persistKey: DIAGNOSTICS_REPORTS_KEY,
  });
  return buildMemoryDiagnosticsReport('recovered-after-relaunch', {
    runtime,
    recorder,
    incident: {
      memoryIssueKind: 'background-kill-recovered',
      confidence: 'medium',
      message: 'Recovered an incomplete processing session after relaunch.',
    },
    context:
      (sanitizeProcessingSnapshot(activeSession.processingSnapshot) as Record<string, unknown> | null) || {
        currentStage:
          typeof activeSession.stage === 'string' ? activeSession.stage : null,
        currentQueueId:
          typeof activeSession.queueId === 'number' ? activeSession.queueId : null,
      },
  });
}
