/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import App from '../../App.svelte';
import {
  consumeSharedFilesFromLaunch,
  registerLaunchQueueConsumer,
} from '../share-target-launch.js';

const appTestMocks = vi.hoisted(() => ({
  warmRuntimeForUpdatedAssetVersion: vi.fn(async () => {}),
}));

const runtimeInitializeMock = vi.fn(
  async () => ({ ready: true, resolvedExecutionProvider: 'webgpu' }),
);
const runtimeProcessMock = vi.fn(
  async (_file: File, options: { onProgress?: (event: Record<string, unknown>) => void } = {}) => {
    options.onProgress?.({
      phase: 'pipeline-complete',
      stage: 'encode',
      elapsedMs: 5,
      stageDurationsMs: { encode: 5 },
      timestamp: Date.now(),
      fileIndex: 0,
      totalFiles: 1,
    });
    return new Blob(['mock-jpeg'], { type: 'image/jpeg' });
  },
);

vi.mock('../share-target-launch.js', () => ({
  consumeSharedFilesFromLaunch: vi.fn(),
  registerLaunchQueueConsumer: vi.fn(),
}));

vi.mock('../processing.js', () => ({
  createProcessingRuntime: vi.fn(() => ({
    initialize: runtimeInitializeMock,
    process: runtimeProcessMock,
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({
      status: 'idle',
      runtime: null,
      error: null,
      progress: null,
    })),
    dispose: vi.fn(async () => {}),
  })),
  RUNTIME_INIT_STEP_ORDER: [
    'onnx-load',
    'webgpu-check',
    'gmnet-session-init',
    'gmnet-provider-verify',
    'gmnet-smoke-run',
    'startup-ready',
  ],
  RUNTIME_INIT_STEP_LABELS: {
    'onnx-load': 'Load ONNX Runtime',
    'webgpu-check': 'Check WebGPU availability',
    'gmnet-session-init': 'Initialize GMNet session',
    'gmnet-provider-verify': 'Verify GMNet execution provider',
    'gmnet-smoke-run': 'Run GMNet smoke test',
    'startup-ready': 'Finalize startup readiness',
  },
}));

vi.mock('../runtime-post-update-warmup.ts', () => ({
  warmRuntimeForUpdatedAssetVersion: appTestMocks.warmRuntimeForUpdatedAssetVersion,
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
};

type RuntimeInitOverrides = {
  message?: string;
  code?: string;
  stepId?: string;
  userMessage?: string;
  diagnostics?: Record<string, unknown>;
};

type RuntimeInitError = Error & {
  code?: string;
  stepId?: string;
  userMessage?: string;
  diagnostics?: Record<string, unknown>;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function createInitFailure(overrides: RuntimeInitOverrides = {}): RuntimeInitError {
  const error = new Error(
    overrides.message || 'WebGPU is unavailable in this environment.',
  ) as RuntimeInitError;
  error.name = 'RuntimeInitializationError';
  error.code = overrides.code || 'RUNTIME_INIT_WEBGPU_UNAVAILABLE';
  error.stepId = overrides.stepId || 'webgpu-check';
  error.userMessage =
    overrides.userMessage || 'WebGPU is unavailable in this environment.';
  error.diagnostics = {
    hasNavigatorGpu: false,
    ...overrides.diagnostics,
  };
  return error;
}

describe('App shell and startup gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage?.clear?.();
    delete (window as typeof window & { __ULTRAHDR_PROCESSING_PREFERENCES?: unknown })
      .__ULTRAHDR_PROCESSING_PREFERENCES;
    delete (window as typeof window & { __ULTRAHDR_BACKEND_PREFERENCE?: unknown })
      .__ULTRAHDR_BACKEND_PREFERENCE;
    vi.mocked(consumeSharedFilesFromLaunch).mockResolvedValue([]);
    vi.mocked(registerLaunchQueueConsumer).mockReturnValue(true);
    runtimeInitializeMock.mockResolvedValue({
      ready: true,
      resolvedExecutionProvider: 'webgpu',
    });
    appTestMocks.warmRuntimeForUpdatedAssetVersion.mockResolvedValue(undefined);
    window.history.replaceState({}, '', '/');
  });

  it('registers launchQueue consumer on mount for PWA file handoff compatibility', async () => {
    render(App);

    await screen.findByTestId('tab-convert');
    expect(registerLaunchQueueConsumer).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByTestId('home-processing-settings'),
    ).not.toBeInTheDocument();
  });

  it('renders initialization checklist while runtime is still initializing', async () => {
    const initGate = deferred<{ ready: true; resolvedExecutionProvider: string }>();
    runtimeInitializeMock.mockReturnValue(initGate.promise);

    render(App);

    expect(screen.getByTestId('runtime-init-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-convert')).not.toBeInTheDocument();

    initGate.resolve({ ready: true, resolvedExecutionProvider: 'webgl' });
    await waitFor(() => {
      expect(screen.getByTestId('tab-convert')).toBeInTheDocument();
    });
    expect(screen.getByTestId('runtime-init-provider')).toHaveTextContent(/webgl/i);
  });

  it('waits for first-launch runtime warmup before rendering the converter UI', async () => {
    const warmupGate = deferred<void>();
    appTestMocks.warmRuntimeForUpdatedAssetVersion.mockReturnValueOnce(warmupGate.promise);

    render(App);

    expect(screen.getByTestId('runtime-init-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(runtimeInitializeMock).toHaveBeenCalledTimes(1);
      expect(appTestMocks.warmRuntimeForUpdatedAssetVersion).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('tab-convert')).not.toBeInTheDocument();

    warmupGate.resolve();
    await waitFor(() => {
      expect(screen.getByTestId('tab-convert')).toBeInTheDocument();
    });
  });

  it('renders a minimal header and keeps trust messaging on the About page', async () => {
    render(App);

    await screen.findByRole('heading', { name: /UltraHDR Converter/i });
    await screen.findByTestId('tab-convert');

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('app-topbar')).toBeInTheDocument();
    expect(screen.getByTestId('app-about-link')).toBeInTheDocument();
    expect(
      screen.queryByText(/try google chrome on windows\/macos if you run into issues/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/private processing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/works offline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no cloud upload/i)).not.toBeInTheDocument();
  });

  it('opens About page from the compact top bar and moves Back to Converter into the header', async () => {
    render(App);

    await screen.findByTestId('tab-convert');
    await fireEvent.click(screen.getByTestId('app-about-link'));

    expect(
      screen.getByRole('heading', { name: /About UltraHDR Converter/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/the app is a progressive web app/i)).toBeInTheDocument();
    expect(screen.queryByText(/share in and share out/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /back to converter/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^about$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/back to converter/i, { selector: 'footer button' }),
    ).not.toBeInTheDocument();
  });

  it('returns to the converter when browser back is used from the About page', async () => {
    render(App);

    await screen.findByTestId('tab-convert');
    await fireEvent.click(screen.getByTestId('app-about-link'));
    expect(screen.getByTestId('about-page')).toBeInTheDocument();

    window.history.back();

    await waitFor(() => {
      expect(screen.getByTestId('tab-convert')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('about-page')).not.toBeInTheDocument();
  });

  it('shows startup failure diagnostics and retries initialization', async () => {
    runtimeInitializeMock
      .mockRejectedValueOnce(createInitFailure())
      .mockResolvedValueOnce({ ready: true, resolvedExecutionProvider: 'webgl' });

    render(App);

    const failureCard = await screen.findByTestId('runtime-init-failure');
    expect(failureCard).toHaveTextContent(/runtime_init_webgpu_unavailable/i);
    expect(failureCard).toHaveTextContent(
      /webgpu is unavailable in this environment/i,
    );

    await fireEvent.click(screen.getByTestId('runtime-init-retry'));

    await waitFor(() => {
      expect(screen.getByTestId('tab-convert')).toBeInTheDocument();
    });
    expect(screen.getByTestId('runtime-init-provider')).toHaveTextContent(/webgl/i);
    expect(runtimeInitializeMock).toHaveBeenCalledTimes(2);
  });

  it('forwards the startup smoke-failure override from the URL query string', async () => {
    window.history.replaceState({}, '', '/?__uhdr_test_force_smoke_failure=1');
    runtimeInitializeMock.mockRejectedValueOnce(
      createInitFailure({
        code: 'RUNTIME_INIT_SMOKE_ASSET_FAILED',
        stepId: 'gmnet-smoke-run',
        userMessage: 'Unable to load the GMNet smoke-test asset.',
        diagnostics: { forceSmokeFailure: true },
      }),
    );

    render(App);

    const failureCard = await screen.findByTestId('runtime-init-failure');
    expect(failureCard).toHaveTextContent(/runtime_init_smoke_asset_failed/i);
    expect(runtimeInitializeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        runtimeInitOptions: expect.objectContaining({
          forceSmokeFailure: true,
        }),
      }),
    );
  });

  it('shows loading state while share-target launch files are being checked after init', async () => {
    const launchProbe = deferred<File[]>();
    vi.mocked(consumeSharedFilesFromLaunch).mockReturnValue(launchProbe.promise);

    render(App);

    await waitFor(() => {
      expect(screen.getByText(/Loading shared images/i)).toBeInTheDocument();
    });

    launchProbe.resolve([]);
    await waitFor(() => {
      expect(screen.queryByText(/Loading shared images/i)).not.toBeInTheDocument();
    });
  });

  it('surfaces compatibility-mode messaging when runtime initializes in degraded main-thread wasm mode', async () => {
    runtimeInitializeMock.mockResolvedValueOnce({
      ready: true,
      resolvedExecutionProvider: 'wasm',
      runtimeMode: 'main-thread-wasm',
      runtimeDegraded: true,
    });

    render(App);

    await screen.findByTestId('tab-convert');
    expect(screen.getByTestId('runtime-init-provider')).toHaveTextContent(/wasm/i);
    expect(screen.getByTestId('runtime-init-degraded')).toHaveTextContent(
      /compatibility mode/i,
    );
  });

  it('auto-triggers file picker for launch shortcut action=pick after init success', async () => {
    window.history.replaceState({}, '', '/?action=pick');
    const inputClickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

    render(App);

    await screen.findByTestId('tab-convert');
    await waitFor(() => {
      expect(inputClickSpy).toHaveBeenCalled();
    });
  });

  it('ignores legacy probe attempt fields in runtime init progress updates', async () => {
    const initGate = deferred<{ ready: true; resolvedExecutionProvider: string }>();
    runtimeInitializeMock.mockImplementationOnce(
      async ({
        onProgress,
      }: {
        onProgress?: (event: Record<string, unknown>) => void;
      } = {}) => {
        onProgress?.({
          stepId: 'gmnet-smoke-run',
          status: 'running',
          note: 'Running GMNet smoke test (webgpu)...',
          probeAttempt: {
            provider: 'webgpu',
            candidateLongEdge: 2048,
            status: 'running',
          },
        });
        onProgress?.({
          stepId: 'gmnet-smoke-run',
          status: 'running',
          note: 'GMNet smoke test passed (webgpu).',
          probeAttempt: {
            provider: 'webgpu',
            candidateLongEdge: 2048,
            status: 'passed',
          },
        });
        onProgress?.({
          stepId: 'gmnet-smoke-run',
          status: 'running',
          note: 'GMNet smoke test passed (webgpu).',
          probeAttempts: [
            {
              provider: 'webgpu',
              candidateLongEdge: 2048,
              status: 'passed',
            },
            {
              provider: 'webgpu',
              candidateLongEdge: 4094,
              status: 'failed',
            },
          ],
        });

        return initGate.promise;
      },
    );

    render(App);

    await waitFor(() => {
      expect(
        screen.getByTestId('runtime-step-gmnet-smoke-run'),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId('runtime-step-gmnet-smoke-run-attempts'),
    ).not.toBeInTheDocument();

    initGate.resolve({ ready: true, resolvedExecutionProvider: 'webgpu' });
    await waitFor(() => {
      expect(screen.getByTestId('tab-convert')).toBeInTheDocument();
    });
  });

  it('opens processor directly for share-target files', async () => {
    vi.mocked(consumeSharedFilesFromLaunch).mockResolvedValue([
      new File(['shared'], 'shared.jpg', { type: 'image/jpeg' }),
    ]);

    render(App);

    await waitFor(() => {
      expect(screen.getByTestId('tab-convert')).toBeInTheDocument();
    });
    expect(
      screen.queryByTestId('home-processing-settings'),
    ).not.toBeInTheDocument();
  });
});
