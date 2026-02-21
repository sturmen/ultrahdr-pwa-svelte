const failedProjects = new Map();

export function getRuntimeGateFailure(projectName) {
  return failedProjects.get(projectName) || null;
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
