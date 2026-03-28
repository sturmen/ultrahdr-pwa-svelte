/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import MobileInferenceWarningDialog from '../MobileInferenceWarningDialog.svelte';

describe('MobileInferenceWarningDialog', () => {
  it('disables continue until the acknowledgement matches', async () => {
    const cancel = vi.fn();
    const proceed = vi.fn();
    render(MobileInferenceWarningDialog, {
      props: {
        open: true,
        acknowledgement: 'I will also try Chrome on Windows or macOS',
        value: '',
        isValid: false,
        onCancel: cancel,
        onProceed: proceed,
      },
    });

    const proceedButton = screen.getByTestId('mobile-inference-warning-proceed');
    expect(proceedButton).toBeDisabled();

    await fireEvent.click(screen.getByTestId('mobile-inference-warning-cancel'));
    expect(cancel).toHaveBeenCalledTimes(1);
    await fireEvent.click(proceedButton);
    expect(proceed).toHaveBeenCalledTimes(1);
  });
});
