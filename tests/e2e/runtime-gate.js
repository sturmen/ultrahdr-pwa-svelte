const failedProjects = new Map();
const E2E_STARTUP_PROBE_HINTS_BY_PROVIDER = Object.freeze({
  webgpu: Object.freeze({
    provider: 'webgpu',
    gainMapMaxLongEdge: 4096,
    outputMaxLongEdge: 8192,
    source: 'e2e-startup-hint',
    attempts: [],
  }),
  webgl: Object.freeze({
    provider: 'webgl',
    gainMapMaxLongEdge: 128,
    outputMaxLongEdge: 256,
    source: 'e2e-startup-hint',
    attempts: [],
  }),
});

function cloneProbeHintsByProvider(value) {
  const next = {};
  for (const [provider, capability] of Object.entries(value || {})) {
    if (!capability || typeof capability !== 'object') {
      continue;
    }
    next[provider] = {
      ...capability,
      attempts: Array.isArray(capability.attempts)
        ? capability.attempts.map((attempt) => (attempt && typeof attempt === 'object' ? { ...attempt } : attempt))
        : [],
    };
  }
  return next;
}

function shouldBypassStartupProbe() {
  return process.env.ULTRAHDR_E2E_FORCE_STARTUP_PROBE !== '1';
}

async function installProjectRuntimeOverrides(page, projectName = '') {
  const normalizedProjectName = String(projectName || '').trim().toLowerCase();
  const shouldDisableNavigatorGpu =
    normalizedProjectName.includes('firefox')
    || normalizedProjectName.includes('webkit');
  if (!shouldDisableNavigatorGpu) {
    return;
  }
  await page.addInitScript(() => {
    try {
      Object.defineProperty(window.navigator, 'gpu', {
        configurable: true,
        value: undefined,
      });
    } catch (_error) {
      try {
        delete window.navigator.gpu;
      } catch {
        // Ignore non-configurable navigator.gpu implementations.
      }
    }
  });
}

export function getRuntimeGateFailure(projectName) {
  return failedProjects.get(projectName) || null;
}

export async function installStartupProbeBypass(page, options = {}) {
  await installProjectRuntimeOverrides(page, options.projectName);
  if (options.skipProbeBypass === true) {
    return;
  }
  if (!shouldBypassStartupProbe()) {
    return;
  }
  const configuredHints = options.gmnetCapabilityHintsByProvider;
  const hintsByProvider = cloneProbeHintsByProvider(
    configuredHints && typeof configuredHints === 'object'
      ? configuredHints
      : E2E_STARTUP_PROBE_HINTS_BY_PROVIDER,
  );
  if (Object.keys(hintsByProvider).length === 0) {
    return;
  }

  await page.addInitScript((hintsPayload) => {
    const existing = window.__ULTRAHDR_TEST_RUNTIME_INIT_OPTIONS;
    const existingOptions = existing && typeof existing === 'object' ? existing : {};
    window.__ULTRAHDR_TEST_RUNTIME_INIT_OPTIONS = {
      ...existingOptions,
      gmnetCapabilityHintsByProvider: hintsPayload,
    };
  }, hintsByProvider);
}

async function readReadyProvider(page) {
  const providerLocator = page.getByTestId('runtime-init-provider');
  const text = (await providerLocator.textContent()) || '';
  const match = /runtime provider:\s*([a-z0-9_-]+)/i.exec(text);
  if (match?.[1]) {
    return match[1].trim().toLowerCase();
  }
  return text.trim().toLowerCase() || null;
}

export async function ensureRuntimeGateReady(page, testInfo, options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 240_000;
  const expectedProvider = typeof options.expectedProvider === 'string'
    ? options.expectedProvider.trim().toLowerCase()
    : null;
  const projectName = testInfo?.project?.name || 'unknown-project';
  const readyLocator = page.getByTestId('runtime-init-ready');
  const failureLocator = page.getByTestId('runtime-init-failure');

  const readyPromise = readyLocator
    .waitFor({ state: 'visible', timeout: timeoutMs })
    .then(() => ({ status: 'ready' }));

  const failurePromise = failureLocator
    .waitFor({ state: 'visible', timeout: timeoutMs })
    .then(async () => {
      const text = (await failureLocator.textContent()) || 'Runtime initialization failed.';
      return { status: 'failed', text };
    });

  let result;
  try {
    result = await Promise.race([readyPromise, failurePromise]);
  } catch (error) {
    const reason = `Runtime startup gate timed out for project "${projectName}".`;
    failedProjects.set(projectName, reason);
    throw new Error(`${reason} ${error?.message || ''}`.trim());
  }

  if (result?.status === 'failed') {
    const reason = `Runtime startup gate failed for project "${projectName}": ${result.text}`;
    failedProjects.set(projectName, reason);
    throw new Error(reason);
  }

  let resolvedExecutionProvider = null;
  try {
    resolvedExecutionProvider = await readReadyProvider(page);
  } catch (_error) {
    resolvedExecutionProvider = null;
  }

  if (expectedProvider && resolvedExecutionProvider !== expectedProvider) {
    const reason = `Runtime startup gate provider mismatch for project "${projectName}": expected ${expectedProvider}, got ${resolvedExecutionProvider || 'unknown'}.`;
    failedProjects.set(projectName, reason);
    throw new Error(reason);
  }

  return { resolvedExecutionProvider };
}
