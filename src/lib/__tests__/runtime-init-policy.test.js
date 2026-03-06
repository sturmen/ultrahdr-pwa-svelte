import { describe, expect, it } from 'vitest';
import {
  decideInitializationPath,
  decideWorkerFallback,
  isMainThreadFallbackEnabled,
  isWorkerCompatibilityError,
} from '../runtime-init-policy.js';

describe('runtime-init-policy', () => {
  it('detects fallback toggle from options', () => {
    expect(isMainThreadFallbackEnabled({})).toBe(true);
    expect(isMainThreadFallbackEnabled({ allowMainThreadFallback: false })).toBe(false);
  });

  it('detects worker compatibility errors', () => {
    expect(isWorkerCompatibilityError({ name: 'ProcessingWorkerInitError' })).toBe(true);
    expect(isWorkerCompatibilityError({ name: 'OtherError' })).toBe(false);
  });

  it('decides initialization path from worker support and fallback policy', () => {
    expect(decideInitializationPath({ workerSupported: true, allowMainThreadFallback: false })).toBe('worker');
    expect(decideInitializationPath({ workerSupported: false, allowMainThreadFallback: true })).toBe('main-thread');
    expect(decideInitializationPath({ workerSupported: false, allowMainThreadFallback: false })).toBe('error');
  });

  it('decides fallback behavior after worker errors', () => {
    expect(
      decideWorkerFallback({
        allowMainThreadFallback: true,
        error: { name: 'ProcessingWorkerInitError' },
      }),
    ).toBe('fallback');
    expect(
      decideWorkerFallback({
        allowMainThreadFallback: false,
        error: { name: 'ProcessingWorkerInitError' },
      }),
    ).toBe('throw');
  });
});
