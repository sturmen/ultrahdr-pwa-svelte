import type { Page, TestInfo } from '@playwright/test';

type RuntimeInitOptions = Record<string, unknown>;

type StartupRuntimeOverrideOptions = {
  projectName?: string;
  runtimeInitOptions?: RuntimeInitOptions;
};

type EnsureRuntimeGateReadyOptions = {
  timeoutMs?: number;
  expectedProvider?: string;
  expectedProviders?: string[];
  forbiddenProviders?: string[];
};

type RuntimeGateResult =
  | { status: 'ready' }
  | { status: 'failed'; text: string };

const failedProjects = new Map<string, string>();

async function installProjectRuntimeOverrides(page: Page, projectName = ''): Promise<void> {
  const normalizedProjectName = String(projectName || '').trim().toLowerCase();
  const shouldDisableNavigatorGpu =
    normalizedProjectName.includes('firefox')
    || normalizedProjectName.includes('webkit')
    || normalizedProjectName.includes('fallback');
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

export function getRuntimeGateFailure(projectName: string): string | null {
  return failedProjects.get(projectName) || null;
}

export async function installStartupRuntimeOverride(
  page: Page,
  options: StartupRuntimeOverrideOptions = {},
): Promise<void> {
  await installProjectRuntimeOverrides(page, options.projectName);

  await page.addInitScript(() => {
    const runtimeWindow = window as Window &
      typeof globalThis & {
        __ULTRAHDR_UNDER_TEST__?: boolean;
      };
    runtimeWindow.__ULTRAHDR_UNDER_TEST__ = true;
  });

  const runtimeInitOptions = options.runtimeInitOptions;
  if (!runtimeInitOptions || typeof runtimeInitOptions !== 'object') {
    return;
  }

  await page.addInitScript((runtimeInitOptionsPayload) => {
    const runtimeWindow = window as Window &
      typeof globalThis & {
        __ULTRAHDR_TEST_RUNTIME_INIT_OPTIONS?: Record<string, unknown>;
      };
    const existing = runtimeWindow.__ULTRAHDR_TEST_RUNTIME_INIT_OPTIONS;
    const existingOptions = existing && typeof existing === 'object' ? existing : {};
    runtimeWindow.__ULTRAHDR_TEST_RUNTIME_INIT_OPTIONS = {
      ...existingOptions,
      ...runtimeInitOptionsPayload,
    };
  }, runtimeInitOptions);
}

// Backward-compatible alias for older e2e helper naming.
export async function installStartupProbeBypass(
  page: Page,
  options: StartupRuntimeOverrideOptions = {},
): Promise<void> {
  await installStartupRuntimeOverride(page, options);
}

async function readReadyProvider(page: Page): Promise<string | null> {
  const providerLocator = page.getByTestId('runtime-init-provider');
  const text = (await providerLocator.textContent()) || '';
  const match = /runtime provider:\s*([a-z0-9_-]+)/i.exec(text);
  if (match?.[1]) {
    return match[1].trim().toLowerCase();
  }
  return text.trim().toLowerCase() || null;
}

export async function ensureRuntimeGateReady(
  page: Page,
  testInfo: TestInfo,
  options: EnsureRuntimeGateReadyOptions = {},
): Promise<{ resolvedExecutionProvider: string | null }> {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 240_000;
  const expectedProvider = typeof options.expectedProvider === 'string'
    ? options.expectedProvider.trim().toLowerCase()
    : null;
  const expectedProviders = Array.isArray(options.expectedProviders)
    ? options.expectedProviders
      .filter((provider) => typeof provider === 'string' && provider.trim().length > 0)
      .map((provider) => provider.trim().toLowerCase())
    : [];
  const forbiddenProviders = Array.isArray(options.forbiddenProviders)
    ? options.forbiddenProviders
      .filter((provider) => typeof provider === 'string' && provider.trim().length > 0)
      .map((provider) => provider.trim().toLowerCase())
    : [];
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

  let result: RuntimeGateResult;
  try {
    result = await Promise.race([readyPromise, failurePromise]);
  } catch (error) {
    const reason = `Runtime startup gate timed out for project "${projectName}".`;
    failedProjects.set(projectName, reason);
    const errorMessage = error instanceof Error ? error.message : String(error ?? '');
    throw new Error(`${reason} ${errorMessage}`.trim());
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

  if (expectedProviders.length > 0 && !expectedProviders.includes(resolvedExecutionProvider || '')) {
    const reason = `Runtime startup gate provider mismatch for project "${projectName}": expected one of [${expectedProviders.join(', ')}], got ${resolvedExecutionProvider || 'unknown'}.`;
    failedProjects.set(projectName, reason);
    throw new Error(reason);
  }

  if (forbiddenProviders.length > 0 && forbiddenProviders.includes(resolvedExecutionProvider || '')) {
    const reason = `Runtime startup gate resolved a forbidden provider for project "${projectName}": ${resolvedExecutionProvider}.`;
    failedProjects.set(projectName, reason);
    throw new Error(reason);
  }

  return { resolvedExecutionProvider };
}
