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
          errorCode: 'RUNTIME_INIT_WEBGPU_UNAVAILABLE',
          userMessage: 'WebGPU is unavailable in this environment.',
          diagnostics: {
            userAgent: 'TestAgent/1.0',
            hasNavigatorGpu: false,
          },
        },
      },
    });

    const failureCard = screen.getByTestId('runtime-init-failure');
    expect(failureCard).toBeInTheDocument();
    expect(failureCard).toHaveTextContent(/check webgpu availability/i);
    expect(failureCard).toHaveTextContent(/runtime_init_webgpu_unavailable/i);
    expect(failureCard).toHaveTextContent(/webgpu is unavailable/i);

    const detailsSummary = screen.getByTestId('runtime-init-diagnostics-summary');
    await fireEvent.click(detailsSummary);
    expect(screen.getByTestId('runtime-init-diagnostics-json')).toHaveTextContent(
      /hasNavigatorGpu/i,
    );
  });

  it('copies diagnostics and emits retry action on failure', async () => {
    const clipboardWriteText = vi.fn(async () => {});
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
});
