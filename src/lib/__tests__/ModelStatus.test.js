import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import ModelStatus from '../ModelStatus.svelte';
import { PIPELINE_PROGRESS_EVENT } from '../pipeline-telemetry.js';

vi.mock('svelte/transition', () => ({
    fade: () => ({ duration: 0 })
}));

describe('ModelStatus Component', () => {

    beforeAll(() => {
        // Mock Web Animations API
        Element.prototype.animate = vi.fn().mockImplementation(() => ({
            finished: Promise.resolve(),
            cancel: vi.fn(),
            play: vi.fn(),
            pause: vi.fn(),
            reverse: vi.fn(),
        }));
    });

    it('is hidden by default', () => {
        render(ModelStatus);
        const alert = screen.queryByRole('status');
        expect(alert).not.toBeInTheDocument();
    });

    it('shows downloading progress', async () => {
        render(ModelStatus);

        // Simulate progress event
        const detail = {
            phase: 'stage-progress',
            stage: 'generate-gain-map',
            stageProgress: 50,
            note: 'Downloading AI Model...'
        };

        await fireEvent(window, new CustomEvent(PIPELINE_PROGRESS_EVENT, { detail }));

        expect(screen.getByText(/Downloading AI Model/i)).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('shows initializing state', async () => {
        render(ModelStatus);

        const detail = {
            phase: 'stage-progress',
            stage: 'generate-gain-map',
            stageProgress: 0,
            note: 'Initializing AI...'
        };

        await fireEvent(window, new CustomEvent(PIPELINE_PROGRESS_EVENT, { detail }));

        expect(screen.getByText(/Initializing AI/i)).toBeInTheDocument();
    });

    it('shows explicit runtime execution provider during inference', async () => {
        render(ModelStatus);

        const detail = {
            phase: 'stage-progress',
            stage: 'generate-gain-map',
            stageProgress: 1,
            note: 'Starting inference; application may appear hung while AI model executes.',
            gmnetExecutionProvider: 'wasm'
        };

        await fireEvent(window, new CustomEvent(PIPELINE_PROGRESS_EVENT, { detail }));

        expect(screen.getByText(/Starting inference/i)).toBeInTheDocument();
        expect(screen.getByTestId('model-status-provider')).toHaveTextContent(/runtime:\s*wasm/i);
    });

    it('hides when complete', async () => {
        render(ModelStatus);

        // Show first
        await fireEvent(window, new CustomEvent(PIPELINE_PROGRESS_EVENT, {
            detail: {
                stage: 'generate-gain-map',
                phase: 'stage-progress',
                note: 'Downloading AI Model...'
            }
        }));
        await waitFor(() => {
            expect(screen.getByText('Downloading AI Model...')).toBeInTheDocument();
        });

        // Complete
        await fireEvent(window, new CustomEvent(PIPELINE_PROGRESS_EVENT, {
            detail: {
                stage: 'generate-gain-map',
                phase: 'stage-complete',
                note: 'AI Inference Complete'
            }
        }));

        // Should disappear
        await waitFor(() => {
            expect(screen.queryByText('Downloading AI Model...')).not.toBeInTheDocument();
        });
    });
});
