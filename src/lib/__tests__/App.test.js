/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import App from '../../App.svelte';
import { consumeSharedFilesFromLaunch } from '../share-target-launch.js';
import { initializeRuntime } from '../processing.js';

vi.mock('../share-target-launch.js', () => ({
  consumeSharedFilesFromLaunch: vi.fn(),
}));

vi.mock('../processing.js', () => ({
  initializeRuntime: vi.fn(async () => ({ ready: true })),
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
    'gmnet-smoke-run': 'Run GMNet smoke test (128x128)',
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
    consumeSharedFilesFromLaunch.mockResolvedValue([]);
    vi.mocked(initializeRuntime).mockResolvedValue({ ready: true });
    window.history.replaceState({}, '', '/');
  });

  it('renders initialization checklist while runtime is still initializing', async () => {
    const initGate = deferred();
    vi.mocked(initializeRuntime).mockReturnValue(initGate.promise);

    render(App);

    expect(screen.getByTestId('runtime-init-loading')).toBeInTheDocument();
    expect(screen.queryByTestId('upload-drop-zone')).not.toBeInTheDocument();

    initGate.resolve({ ready: true });
    await waitFor(() => {
      expect(screen.getByTestId('upload-drop-zone')).toBeInTheDocument();
    });
  });

  it('renders a minimal header and keeps trust messaging on the About page', async () => {
    render(App);

    await screen.findByRole('heading', { name: /UltraHDR Converter/i });
    await screen.findByTestId('upload-drop-zone');

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.queryByText(/private processing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/works offline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no cloud upload/i)).not.toBeInTheDocument();
  });

  it('opens About page from footer and shows technical explanation with feature taglines', async () => {
    render(App);

    await screen.findByTestId('upload-drop-zone');
    await fireEvent.click(screen.getByRole('button', { name: /about/i }));

    expect(screen.getByRole('heading', { name: /About UltraHDR Converter/i })).toBeInTheDocument();
    expect(screen.getByText(/no cloud upload/i)).toBeInTheDocument();
    expect(screen.getByText(/works offline/i)).toBeInTheDocument();
    expect(screen.getByText(/private processing/i)).toBeInTheDocument();
    expect(screen.getByText(/the app is a progressive web app/i)).toBeInTheDocument();
  });

  it('shows startup failure diagnostics and retries initialization', async () => {
    vi.mocked(initializeRuntime)
      .mockRejectedValueOnce(createInitFailure())
      .mockResolvedValueOnce({ ready: true });

    render(App);

    const failureCard = await screen.findByTestId('runtime-init-failure');
    expect(failureCard).toHaveTextContent(/runtime_init_webgpu_unavailable/i);
    expect(failureCard).toHaveTextContent(/webgpu is unavailable in this environment/i);

    await fireEvent.click(screen.getByTestId('runtime-init-retry'));

    await waitFor(() => {
      expect(screen.getByTestId('upload-drop-zone')).toBeInTheDocument();
    });
    expect(initializeRuntime).toHaveBeenCalledTimes(2);
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

  it('auto-triggers file picker for launch shortcut action=pick after init success', async () => {
    window.history.replaceState({}, '', '/?action=pick');
    const inputClickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

    render(App);

    await screen.findByTestId('upload-drop-zone');
    await waitFor(() => {
      expect(inputClickSpy).toHaveBeenCalled();
    });
  });
});
