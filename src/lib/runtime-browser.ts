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
  const runtimeWithWebGl = runtime as typeof globalThis & {
    WebKitWebGLRenderingContext?: unknown;
  };
  return Boolean(
    runtime?.WebGL2RenderingContext
    || runtime?.WebGLRenderingContext
    || runtimeWithWebGl.WebKitWebGLRenderingContext,
  );
}

export function isGmnetWebGlSupportedRuntime(runtime: typeof globalThis = globalThis): boolean {
  return hasWebGlSupport(runtime) && !isChromiumRuntime(runtime);
}
