const failedProjects = new Map();

export function getRuntimeGateFailure(projectName) {
  return failedProjects.get(projectName) || null;
}

export async function ensureRuntimeGateReady(page, testInfo, options = {}) {
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 25_000;
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
}
