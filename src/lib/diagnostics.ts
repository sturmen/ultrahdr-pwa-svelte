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

export interface DiagnosticsRecorder {
  record: (event: DiagnosticsEventInput) => DiagnosticsEvent;
  getEvents: () => DiagnosticsEvent[];
  markProcessingActive: (context?: Record<string, unknown>) => void;
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
    runtime.localStorage?.setItem(
      DIAGNOSTICS_ACTIVE_SESSION_KEY,
      JSON.stringify({
        sessionId,
        active,
        cleanExit: !active,
        updatedAt: now(),
        ...context,
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
      writeActiveSession(true, context);
    },
    markProcessingComplete: (context = {}) => {
      writeActiveSession(false, context);
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
  const activeSession = safeParseJson<Record<string, unknown> | null>(
    runtime.localStorage?.getItem(DIAGNOSTICS_ACTIVE_SESSION_KEY) || null,
    null,
  );
  if (!activeSession || activeSession.active !== true) {
    return null;
  }

  runtime.localStorage?.removeItem(DIAGNOSTICS_ACTIVE_SESSION_KEY);
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
    context: {
      currentStage:
        typeof activeSession.stage === 'string' ? activeSession.stage : null,
      currentQueueId:
        typeof activeSession.queueId === 'number' ? activeSession.queueId : null,
    },
  });
}
