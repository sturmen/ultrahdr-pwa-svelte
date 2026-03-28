/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';

const diagnosticsMocks = vi.hoisted(() => ({
  runtimeProcessMock: vi.fn(),
}));

vi.mock('../capabilities.js', () => ({
  getCapabilities: vi.fn(() => ({
    userAgent: 'test-agent',
    deviceMemory: 8,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isStandalone: false,
    supportsShare: true,
    supportsFileShare: false,
    supportsShareTarget: true,
    supportsWakeLock: false,
    supportsOffscreenWorker: true,
  })),
}));

import ImageProcessor from '../ImageProcessor.svelte';

function createRuntime() {
  return {
    process: diagnosticsMocks.runtimeProcessMock,
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({ status: 'idle', runtime: null, error: null, progress: null })),
    initialize: vi.fn(async () => ({ ready: true })),
    dispose: vi.fn(async () => {}),
  };
}

describe('ImageProcessor diagnostics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: '(min-width: 1024px)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window.navigator, 'share', {
      configurable: true,
      value: vi.fn(async () => {}),
    });
    Object.defineProperty(window.navigator, 'canShare', {
      configurable: true,
      value: vi.fn(() => true),
    });
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn(async () => {}),
      },
    });
  });

  it('opens a manual debug report modal from settings and shares the report', async () => {
    render(ImageProcessor, {
      props: {
        files: [],
        runtime: createRuntime(),
      },
    });

    await fireEvent.click(screen.getByTestId('floating-gear'));
    await fireEvent.click(screen.getByTestId('open-debug-report'));

    const dialog = await screen.findByTestId('diagnostics-report-dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/diagnostics timeline/i)).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('diagnostics-share'));

    expect(window.navigator.share).toHaveBeenCalledTimes(1);
  });

  it('opens the diagnostics modal automatically when processing fails with a memory allocation error', async () => {
    diagnosticsMocks.runtimeProcessMock.mockRejectedValue(
      new Error('Failed to allocate memory for JPEG input'),
    );

    render(ImageProcessor, {
      props: {
        files: [new File(['input'], 'memory-problem.jpg', { type: 'image/jpeg' })],
        runtime: createRuntime(),
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('diagnostics-report-dialog')).toBeInTheDocument();
    });

    expect(screen.getByText(/possible memory issue/i)).toBeInTheDocument();
    expect(screen.getByText(/allocation-failure/i)).toBeInTheDocument();
  });
});
