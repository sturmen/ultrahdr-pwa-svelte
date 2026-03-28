import {
  hasWebGlSupport,
  isChromiumRuntime,
} from './runtime-detection.ts';

export { hasWebGlSupport, isChromiumRuntime } from './runtime-detection.ts';

export function isGmnetWebGlSupportedRuntime(runtime: typeof globalThis = globalThis): boolean {
  return hasWebGlSupport(runtime) && !isChromiumRuntime(runtime);
}
