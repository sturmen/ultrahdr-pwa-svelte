export function isChromiumRuntime(runtime: typeof globalThis = globalThis): boolean {
  const userAgent = String(runtime?.navigator?.userAgent || '').toLowerCase();
  if (!userAgent) {
    return false;
  }

  return [
    'chrome/',
    'chromium/',
    'crios/',
    'crmo/',
    'headlesschrome/',
    'edg/',
    'edga/',
    'edgios/',
    'opr/',
    'opera',
    'samsungbrowser/',
  ].some((token) => userAgent.includes(token));
}

export function hasWebGlSupport(runtime: typeof globalThis = globalThis): boolean {
  try {
    if (typeof runtime?.OffscreenCanvas !== 'undefined') {
      const canvas = new runtime.OffscreenCanvas(1, 1);
      const context = canvas.getContext('webgl')
        || (canvas as unknown as { getContext: (contextId: string) => unknown }).getContext('experimental-webgl');
      if (context) {
        return true;
      }
    }
  } catch (_error) {
    // Fall through to DOM canvas probing.
  }

  try {
    if (typeof runtime?.document?.createElement === 'function') {
      const canvas = runtime.document.createElement('canvas');
      if (canvas && typeof canvas.getContext === 'function') {
        const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (context) {
          return true;
        }
      }
    }
  } catch (_error) {
    // No-op.
  }

  return false;
}

export function isGmnetWebGlSupportedRuntime(runtime: typeof globalThis = globalThis): boolean {
  return hasWebGlSupport(runtime) && !isChromiumRuntime(runtime);
}
