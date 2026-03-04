/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { ensureRuntimeGateReady } from '../../../tests/e2e/runtime-gate.js';

function createLocator({ onWaitFor, text = '' } = {}) {
  return {
    waitFor: onWaitFor || (() => Promise.resolve()),
    textContent: () => Promise.resolve(text),
  };
}

function createReadyPage(provider = 'wasm') {
  const readyLocator = createLocator({
    onWaitFor: () => Promise.resolve(),
  });
  const failureLocator = createLocator({
    onWaitFor: () => new Promise(() => { }),
    text: '',
  });
  const providerLocator = createLocator({
    text: `Runtime provider: ${provider}`,
  });

  return {
    getByTestId(testId) {
      if (testId === 'runtime-init-ready') {
        return readyLocator;
      }
      if (testId === 'runtime-init-failure') {
        return failureLocator;
      }
      if (testId === 'runtime-init-provider') {
        return providerLocator;
      }
      return createLocator();
    },
  };
}

describe('runtime-gate helper', () => {
  it('supports expectedProviders list and rejects when resolved provider is outside the set', async () => {
    const page = createReadyPage('wasm');
    const testInfo = {
      project: {
        name: 'firefox',
      },
    };

    await expect(
      ensureRuntimeGateReady(page, testInfo, {
        expectedProviders: ['webgpu', 'webgl'],
      }),
    ).rejects.toThrow(/provider mismatch/i);
  });

  it('supports forbiddenProviders list and rejects when resolved provider is forbidden', async () => {
    const page = createReadyPage('wasm');
    const testInfo = {
      project: {
        name: 'firefox',
      },
    };

    await expect(
      ensureRuntimeGateReady(page, testInfo, {
        forbiddenProviders: ['wasm'],
      }),
    ).rejects.toThrow(/forbidden/i);
  });
});

