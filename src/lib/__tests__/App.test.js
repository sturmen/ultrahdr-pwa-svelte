/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import App from '../../App.svelte';
import { consumeSharedFilesFromLaunch, registerLaunchQueueConsumer } from '../share-target-launch.js';
import { createProcessingRuntime } from '../processing.js';

const runtimeInitializeMock = vi.fn(async () => ({ ready: true, resolvedExecutionProvider: 'webgpu' }));
const runtimeProcessMock = vi.fn(async (_file, options = {}) => {
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
});

vi.mock('../share-target-launch.js', () => ({
  consumeSharedFilesFromLaunch: vi.fn(),
  registerLaunchQueueConsumer: vi.fn(),
}));

vi.mock('../processing.js', () => ({
  createProcessingRuntime: vi.fn(() => ({
    initialize: runtimeInitializeMock,
    process: runtimeProcessMock,
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({ status: 'idle', runtime: null, error: null, progress: null })),
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

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function createInitFailure(overrides = {}) {
  const error = new Error(overrides.message || 'WebGPU is unavailable in this environment.');
  error.name = 'RuntimeInitializationError';
  error.code = overrides.code || 'RUNTIME_INIT_WEBGPU_UNAVAILABLE';
  error.stepId = overrides.stepId || 'webgpu-check';
  error.userMessage = overrides.userMessage || 'WebGPU is unavailable in this environment.';
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
    delete window.__ULTRAHDR_PROCESSING_PREFERENCES;
    delete window.__ULTRAHDR_BACKEND_PREFERENCE;
    consumeSharedFilesFromLaunch.mockResolvedValue([]);
    registerLaunchQueueConsumer.mockReturnValue(true);
    runtimeInitializeMock.mockResolvedValue({ ready: true, resolvedExecutionProvider: 'webgpu' });
    window.history.replaceState({}, '', '/');
  });

  it('registers launchQueue consumer on mount for PWA file handoff compatibility', async () => {
    render(App);

    await screen.findByTestId('tab-convert');
    expect(registerLaunchQueueConsumer).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('home-processing-settings')).not.toBeInTheDocument();
  });

  it('renders initialization checklist while runtime is still initializing', async () => {
    const initGate = deferred();
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

  it('renders a minimal header and keeps trust messaging on the About page', async () => {
    render(App);

    await screen.findByRole('heading', { name: /UltraHDR Converter/i });
    await screen.findByTestId('tab-convert');

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getByTestId('app-topbar')).toBeInTheDocument();
    expect(screen.getByTestId('app-about-link')).toBeInTheDocument();
    expect(screen.queryByText(/try google chrome on windows\/macos if you run into issues/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/private processing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/works offline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no cloud upload/i)).not.toBeInTheDocument();
  });

  it('opens About page from the compact top bar and keeps the explanation concise', async () => {
    render(App);

    await screen.findByTestId('tab-convert');
    await fireEvent.click(screen.getByTestId('app-about-link'));

    expect(screen.getByRole('heading', { name: /About UltraHDR Converter/i })).toBeInTheDocument();
    expect(screen.getByText(/the app is a progressive web app/i)).toBeInTheDocument();
    expect(screen.queryByText(/share in and share out/i)).not.toBeInTheDocument();
  });

  it('shows startup failure diagnostics and retries initialization', async () => {
    runtimeInitializeMock
      .mockRejectedValueOnce(createInitFailure())
      .mockResolvedValueOnce({ ready: true, resolvedExecutionProvider: 'webgl' });

    render(App);

    const failureCard = await screen.findByTestId('runtime-init-failure');
    expect(failureCard).toHaveTextContent(/runtime_init_webgpu_unavailable/i);
    expect(failureCard).toHaveTextContent(/webgpu is unavailable in this environment/i);

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
    const launchProbe = deferred();
    consumeSharedFilesFromLaunch.mockReturnValue(launchProbe.promise);

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
    const initGate = deferred();
    runtimeInitializeMock.mockImplementationOnce(async ({ onProgress } = {}) => {
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
    });

    render(App);

    await waitFor(() => {
      expect(screen.getByTestId('runtime-step-gmnet-smoke-run')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('runtime-step-gmnet-smoke-run-attempts')).not.toBeInTheDocument();

    initGate.resolve({ ready: true, resolvedExecutionProvider: 'webgpu' });
    await waitFor(() => {
      expect(screen.getByTestId('tab-convert')).toBeInTheDocument();
    });
  });

  it('opens processor directly for share-target files', async () => {
    consumeSharedFilesFromLaunch.mockResolvedValue([
      new File(['shared'], 'shared.jpg', { type: 'image/jpeg' }),
    ]);

    render(App);

    await waitFor(() => {
      expect(screen.getByTestId('tab-convert')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('home-processing-settings')).not.toBeInTheDocument();
  });
});
