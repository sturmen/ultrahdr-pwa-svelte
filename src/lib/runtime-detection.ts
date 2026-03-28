export type RuntimeNavigatorLike = Navigator | {
  userAgent?: unknown;
  platform?: unknown;
  maxTouchPoints?: unknown;
};

export type RuntimeLike = {
  navigator?: RuntimeNavigatorLike;
  WebGL2RenderingContext?: typeof WebGL2RenderingContext;
  WebGLRenderingContext?: typeof WebGLRenderingContext;
  WebKitWebGLRenderingContext?: unknown;
  [key: string]: unknown;
};

export interface RuntimeDetectionProfile {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  isAndroid: boolean;
  isChromium: boolean;
  isFirefox: boolean;
  isIOSLike: boolean;
  isMobile: boolean;
  isSafariLike: boolean;
  isWebKit: boolean;
  isWindows: boolean;
  hasWebGlSupport: boolean;
}

function getUserAgent(runtime: RuntimeLike = globalThis): string {
  return String(runtime?.navigator?.userAgent || '');
}

function getLowerUserAgent(runtime: RuntimeLike = globalThis): string {
  return getUserAgent(runtime).toLowerCase();
}

function getPlatform(runtime: RuntimeLike = globalThis): string {
  return String(runtime?.navigator?.platform || '');
}

function getLowerPlatform(runtime: RuntimeLike = globalThis): string {
  return getPlatform(runtime).toLowerCase();
}

function getMaxTouchPoints(runtime: RuntimeLike = globalThis): number {
  const value = Number(runtime?.navigator?.maxTouchPoints || 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function isChromiumRuntime(runtime: RuntimeLike = globalThis): boolean {
  const userAgent = getLowerUserAgent(runtime);
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

export function isFirefoxRuntime(runtime: RuntimeLike = globalThis): boolean {
  return getLowerUserAgent(runtime).includes('firefox/');
}

export function isWebKitRuntime(runtime: RuntimeLike = globalThis): boolean {
  return getLowerUserAgent(runtime).includes('applewebkit');
}

export function isSafariLikeRuntime(runtime: RuntimeLike = globalThis): boolean {
  const userAgent = getLowerUserAgent(runtime);
  if (!userAgent.includes('applewebkit')) {
    return false;
  }

  return ![
    'chrome',
    'chromium',
    'crios',
    'firefox',
    'fxios',
    'edg/',
    'edgios',
    'opr/',
    'opera',
  ].some((token) => userAgent.includes(token));
}

export function isAndroidRuntime(runtime: RuntimeLike = globalThis): boolean {
  return /android/.test(getLowerUserAgent(runtime));
}

export function isIOSLikeRuntime(runtime: RuntimeLike = globalThis): boolean {
  const userAgent = getLowerUserAgent(runtime);
  const platform = getLowerPlatform(runtime);
  const maxTouchPoints = getMaxTouchPoints(runtime);

  return (
    /(iphone|ipad|ipod)/.test(userAgent)
    || /(iphone|ipad|ipod)/.test(platform)
    || (/(macintosh|mac os x|macintel)/.test(userAgent) && maxTouchPoints > 1)
    || (platform.includes('mac') && maxTouchPoints > 1)
  );
}

export function isMobileRuntime(runtime: RuntimeLike = globalThis): boolean {
  return isAndroidRuntime(runtime) || isIOSLikeRuntime(runtime) || /mobile/.test(getLowerUserAgent(runtime));
}

export function isWindowsRuntime(runtime: RuntimeLike = globalThis): boolean {
  const userAgent = getLowerUserAgent(runtime);
  const platform = getLowerPlatform(runtime);
  return userAgent.includes('windows') || platform.startsWith('win');
}

export function hasWebGlSupport(runtime: RuntimeLike = globalThis): boolean {
  return Boolean(
    runtime?.WebGL2RenderingContext
    || runtime?.WebGLRenderingContext
    || runtime?.WebKitWebGLRenderingContext,
  );
}

export function getRuntimeDetectionProfile(
  runtime: RuntimeLike = globalThis,
): RuntimeDetectionProfile {
  return {
    userAgent: getUserAgent(runtime),
    platform: getPlatform(runtime),
    maxTouchPoints: getMaxTouchPoints(runtime),
    isAndroid: isAndroidRuntime(runtime),
    isChromium: isChromiumRuntime(runtime),
    isFirefox: isFirefoxRuntime(runtime),
    isIOSLike: isIOSLikeRuntime(runtime),
    isMobile: isMobileRuntime(runtime),
    isSafariLike: isSafariLikeRuntime(runtime),
    isWebKit: isWebKitRuntime(runtime),
    isWindows: isWindowsRuntime(runtime),
    hasWebGlSupport: hasWebGlSupport(runtime),
  };
}
