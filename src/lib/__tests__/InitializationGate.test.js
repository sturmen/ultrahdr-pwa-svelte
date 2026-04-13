/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import InitializationGate from '../InitializationGate.svelte';

function createSteps() {
  return [
    {
      id: 'onnx-load',
      label: 'Load ONNX Runtime',
      status: 'passed',
      note: 'ONNX runtime dependencies loaded.',
    },
    {
      id: 'webgpu-check',
      label: 'Check WebGPU availability',
      status: 'running',
      note: 'Checking WebGPU runtime support...',
    },
    {
      id: 'gmnet-session-init',
      label: 'Initialize GMNet session',
      status: 'pending',
      note: '',
    },
    {
      id: 'gmnet-smoke-run',
      label: 'Run GMNet smoke test',
      status: 'running',
      note: 'Running GMNet smoke test (webgpu)...',
    },
    {
      id: 'jpegli-bootstrap',
      label: 'Bootstrap JPEGli runtime',
      status: 'pending',
      note: '',
    },
  ];
}

describe('InitializationGate', () => {
  it('renders checklist statuses for pending/running/passed steps', () => {
    render(InitializationGate, {
      props: {
        state: 'running',
        steps: createSteps(),
        failure: null,
      },
    });

    expect(screen.getByTestId('runtime-init-gate')).toBeInTheDocument();
    expect(screen.getByTestId('runtime-init-loading')).toBeInTheDocument();
    expect(screen.getByTestId('runtime-step-onnx-load')).toHaveTextContent(/passed/i);
    expect(screen.getByTestId('runtime-step-webgpu-check')).toHaveTextContent(/running/i);
    expect(screen.getByTestId('runtime-step-gmnet-session-init')).toHaveTextContent(/pending/i);
  });

  it('shows friendly failure summary and expandable diagnostics', async () => {
    render(InitializationGate, {
      props: {
        state: 'failed',
        steps: createSteps().map((step) =>
          step.id === 'webgpu-check'
            ? {
              ...step,
              status: 'failed',
              note: 'WebGPU is unavailable in this environment.',
            }
            : step,
        ),
        failure: {
          stepId: 'webgpu-check',
          stepLabel: 'Check WebGPU availability',
          errorCode: 'RUNTIME_INIT_PROVIDER_FALLBACK_EXHAUSTED',
          userMessage: 'WebGPU startup failed; fallback to WebGL also failed.',
          diagnostics: {
            userAgent: 'TestAgent/1.0',
            hasNavigatorGpu: false,
            attemptFailures: [
              {
                provider: 'webgpu',
                errorCode: 'RUNTIME_INIT_SMOKE_INFERENCE_FAILED',
              },
              {
                provider: 'webgl',
                errorCode: 'RUNTIME_INIT_SMOKE_INFERENCE_FAILED',
              },
            ],
          },
        },
      },
    });

    const failureCard = screen.getByTestId('runtime-init-failure');
    expect(failureCard).toBeInTheDocument();
    expect(failureCard).toHaveTextContent(/check webgpu availability/i);
    expect(failureCard).toHaveTextContent(/runtime_init_provider_fallback_exhausted/i);
    expect(failureCard).toHaveTextContent(/fallback to webgl/i);

    const detailsSummary = screen.getByTestId('runtime-init-diagnostics-summary');
    await fireEvent.click(detailsSummary);
    expect(screen.getByTestId('runtime-init-diagnostics-json')).toHaveTextContent(
      /attemptFailures/i,
    );
  });

  it('copies diagnostics and emits retry action on failure', async () => {
    const clipboardWriteText = vi.fn(async () => { });
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: clipboardWriteText,
      },
    });

    render(InitializationGate, {
      props: {
        state: 'failed',
        steps: createSteps().map((step) => ({
          ...step,
          status: step.id === 'webgpu-check' ? 'failed' : step.status,
        })),
        failure: {
          stepId: 'webgpu-check',
          stepLabel: 'Check WebGPU availability',
          errorCode: 'RUNTIME_INIT_WEBGPU_UNAVAILABLE',
          userMessage: 'WebGPU is unavailable in this environment.',
          diagnostics: {
            userAgent: 'TestAgent/1.0',
            hasNavigatorGpu: false,
          },
        },
      },
    });

    await fireEvent.click(screen.getByTestId('runtime-init-copy-diagnostics'));
    expect(clipboardWriteText).toHaveBeenCalledTimes(1);
    expect(clipboardWriteText.mock.calls[0][0]).toMatch(/RUNTIME_INIT_WEBGPU_UNAVAILABLE/);

    await fireEvent.click(screen.getByTestId('runtime-init-retry'));
    expect(screen.getByTestId('runtime-init-retry')).toBeInTheDocument();
  });

  it('does not render probe attempt sublists, even when legacy attempt payloads are present', async () => {
    const firstRender = render(InitializationGate, {
      props: {
        state: 'running',
        steps: createSteps().map((step) =>
          step.id === 'gmnet-smoke-run'
            ? {
              ...step,
              attempts: [
                {
                  provider: 'webgpu',
                  candidateLongEdge: 2048,
                  status: 'running',
                },
              ],
            }
            : step
        ),
        failure: null,
      },
    });

    expect(
      screen.queryByTestId('runtime-step-gmnet-smoke-run-attempts'),
    ).not.toBeInTheDocument();

    firstRender.unmount();

    render(InitializationGate, {
      props: {
        state: 'running',
        failure: null,
        steps: createSteps().map((step) => (
          step.id === 'gmnet-smoke-run'
            ? {
              ...step,
              attempts: [
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
            }
            : step
        )),
      },
    });

    expect(
      screen.queryByTestId('runtime-step-gmnet-smoke-run-attempts'),
    ).not.toBeInTheDocument();
  });

  it('renders dedicated offline bundle blocked guidance for hard-block failures', () => {
    render(InitializationGate, {
      props: {
        state: 'failed',
        steps: createSteps().map((step) => ({
          ...step,
          status: step.id === 'onnx-load' ? 'failed' : step.status,
        })),
        failure: {
          stepId: 'onnx-load',
          stepLabel: 'Load ONNX Runtime',
          errorCode: 'RUNTIME_INIT_OFFLINE_BUNDLE_NOT_READY',
          userMessage: 'Offline startup is blocked until the runtime bundle is prepared online.',
          diagnostics: {
            bundleState: 'EMPTY',
          },
        },
      },
    });

    expect(screen.getByTestId('runtime-init-offline-bundle-blocked')).toHaveTextContent(
      /connect to the internet/i,
    );
  });

  it('renders dedicated jpegli bootstrap blocked guidance', () => {
    render(InitializationGate, {
      props: {
        state: 'failed',
        steps: createSteps().map((step) => ({
          ...step,
          status: step.id === 'jpegli-bootstrap' ? 'failed' : step.status,
          note: step.id === 'jpegli-bootstrap'
            ? 'JPEGli runtime failed to initialize.'
            : step.note,
        })),
        failure: {
          stepId: 'jpegli-bootstrap',
          stepLabel: 'Bootstrap JPEGli runtime',
          errorCode: 'RUNTIME_INIT_JPEGLI_BOOTSTRAP_FAILED',
          userMessage: 'JPEGli runtime failed to initialize after bundle repair.',
          diagnostics: {
            bundleState: 'READY',
            repairAttempted: true,
            errorCategory: 'factory-load-timeout',
          },
        },
      },
    });

    expect(screen.getByTestId('runtime-step-jpegli-bootstrap')).toHaveTextContent(/failed/i);
    expect(screen.getByTestId('runtime-init-failure')).toHaveTextContent(/jpegli/i);
    expect(screen.getByTestId('runtime-init-jpegli-bootstrap-blocked')).toHaveTextContent(
      /repair the offline runtime bundle/i,
    );
  });
});
