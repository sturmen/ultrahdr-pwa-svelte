/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const appLazyImportMocks = vi.hoisted(() => ({
  imageProcessorLoads: vi.fn(),
}));

vi.mock('../../lib/ImageProcessor.svelte', () => {
  appLazyImportMocks.imageProcessorLoads();
  throw new Error('ImageProcessor should not load while App is still in the startup gate.');
});

vi.mock('../../lib/share-target-launch.js', () => ({
  consumeSharedFilesFromLaunch: vi.fn(async () => []),
  registerLaunchQueueConsumer: vi.fn(),
}));

vi.mock('../../lib/pwa-updater.js', () => ({
  createDefaultPwaUpdateState: vi.fn(() => ({
    notificationVisible: false,
    applying: false,
    pendingUntilIdle: false,
  })),
  createPwaUpdateCoordinator: vi.fn(() => ({
    setBusy: vi.fn(),
    applyUpdate: vi.fn(async () => {}),
    dismissUpdateNotification: vi.fn(async () => {}),
    validateOfflineReadiness: vi.fn(async () => {}),
    repairOfflineReadiness: vi.fn(async () => {}),
    dispose: vi.fn(),
  })),
}));

vi.mock('../../lib/processing.js', () => ({
  createProcessingRuntime: vi.fn(() => ({
    initialize: vi.fn(() => new Promise(() => {})),
    process: vi.fn(async () => new Blob()),
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

vi.mock('../../lib/runtime-post-update-warmup.ts', () => ({
  warmRuntimeForUpdatedAssetVersion: vi.fn(async () => false),
}));

describe('App lazy imports', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('renders the startup gate without importing ImageProcessor', async () => {
    const { default: App } = await import('../../App.svelte');

    render(App);

    expect(screen.getByTestId('runtime-init-loading')).toBeInTheDocument();
    expect(appLazyImportMocks.imageProcessorLoads).not.toHaveBeenCalled();
  });
});
