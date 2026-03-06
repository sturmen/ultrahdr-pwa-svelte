import { describe, expect, it } from 'vitest';
import {
  RUNTIME_INIT_STEP_LABELS,
  RUNTIME_INIT_STEP_ORDER,
  normalizeExecutionProvider,
  sanitizeRuntimeInitOptions,
} from '../runtime-contract.js';

describe('runtime-contract', () => {
  it('exposes runtime init step labels for every step', () => {
    expect(RUNTIME_INIT_STEP_ORDER.length).toBeGreaterThan(0);
    for (const stepId of RUNTIME_INIT_STEP_ORDER) {
      expect(typeof RUNTIME_INIT_STEP_LABELS[stepId]).toBe('string');
      expect(RUNTIME_INIT_STEP_LABELS[stepId].length).toBeGreaterThan(0);
    }
  });

  it('normalizes execution provider names', () => {
    expect(normalizeExecutionProvider('  WebGPU  ')).toBe('webgpu');
    expect(normalizeExecutionProvider('')).toBeNull();
    expect(normalizeExecutionProvider(null)).toBeNull();
  });

  it('sanitizes runtime init options', () => {
    expect(
      sanitizeRuntimeInitOptions({
        smokeAssetPath: '  models/test.png ',
        modelVariant: ' realworld ',
        forceSmokeFailure: 'true',
        allowWasmOnly: false,
        forceExecutionProviders: [' webgpu ', '', null, 'wasm'],
        smokeBypassProviders: [' WEBGPU ', 'webgpu', ''],
      }),
    ).toEqual({
      smokeAssetPath: 'models/test.png',
      modelVariant: 'realworld',
      forceSmokeFailure: true,
      allowWasmOnly: false,
      forceExecutionProviders: [' webgpu ', 'wasm'],
      smokeBypassProviders: ['webgpu'],
    });
  });
});
