import { getRuntimeDetectionProfile } from './runtime-detection.ts';

type RuntimeNavigatorLike = {
  userAgent?: string;
  deviceMemory?: number;
  canShare?: Navigator['canShare'];
  wakeLock?: unknown;
  standalone?: boolean;
  maxTouchPoints?: number;
  share?: Navigator['share'];
  serviceWorker?: unknown;
};

type RuntimeWindowLike = {
  matchMedia?: (query: string) => { matches: boolean };
};

type RuntimeOverrides = {
  navigator?: RuntimeNavigatorLike;
  window?: RuntimeWindowLike;
  Worker?: typeof Worker;
  fetch?: typeof fetch;
  ImageData?: typeof ImageData;
};

type CapabilitySnapshot = {
  userAgent: string;
  deviceMemory: number | null;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isStandalone: boolean;
  supportsShare: boolean;
  supportsFileShare: boolean;
  supportsShareTarget: boolean;
  supportsWakeLock: boolean;
  supportsOffscreenWorker: boolean;
};

function getDefaultRuntime(): RuntimeOverrides {
  return {
    navigator: typeof navigator !== 'undefined' ? (navigator as unknown as RuntimeNavigatorLike) : {},
    window: typeof window !== 'undefined' ? (window as unknown as RuntimeWindowLike) : {},
    Worker: typeof Worker !== 'undefined' ? Worker : undefined,
    fetch: typeof fetch !== 'undefined' ? fetch : undefined,
    ImageData: typeof ImageData !== 'undefined' ? ImageData : undefined,
  };
}

function normalizeDeviceMemory(value: unknown): number | null {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  return numeric;
}

function hasFileShareSupport(nav: RuntimeNavigatorLike | undefined): boolean {
  if (!nav || typeof nav.canShare !== 'function') {
    return false;
  }

  if (typeof File === 'undefined') {
    return false;
  }

  try {
    const probeFile = new File(['probe'], 'probe.txt', { type: 'text/plain' });
    return nav.canShare({ files: [probeFile] });
  } catch {
    return false;
  }
}

export function getCapabilities(runtimeOverrides: RuntimeOverrides = {}): CapabilitySnapshot {
  const runtime = { ...getDefaultRuntime(), ...runtimeOverrides };
  const nav: RuntimeNavigatorLike = runtime.navigator || {};
  const win: RuntimeWindowLike = runtime.window || {};
  const profile = getRuntimeDetectionProfile(runtime);
  const isStandalone =
    Boolean(nav.standalone) ||
    (typeof win.matchMedia === 'function' &&
      win.matchMedia('(display-mode: standalone)').matches);

  const supportsOffscreenWorker = Boolean(
    runtime.Worker &&
    runtime.fetch &&
    runtime.ImageData,
  );
  const supportsShareTarget =
    'serviceWorker' in nav;

  return {
    userAgent: profile.userAgent,
    deviceMemory: normalizeDeviceMemory(nav.deviceMemory),
    isIOS: profile.isIOSLike,
    isAndroid: profile.isAndroid,
    isSafari: profile.isSafariLike,
    isStandalone,
    supportsShare: typeof nav.share === 'function',
    supportsFileShare: hasFileShareSupport(nav),
    supportsShareTarget,
    supportsWakeLock: Boolean(nav.wakeLock),
    supportsOffscreenWorker,
  };
}

export function getProcessingProfile(inputCapabilities: CapabilitySnapshot | null = null): { memoryTier: 'low' | 'mid' | 'high' } {
  const capabilities = inputCapabilities || getCapabilities();
  const memory = capabilities.deviceMemory;

  let memoryTier: 'low' | 'mid' | 'high' = 'mid';

  if (capabilities.isIOS) {
    memoryTier = 'low';
  } else if (capabilities.isAndroid) {
    if (memory === null || memory <= 6) {
      memoryTier = 'low';
    } else if (memory >= 12) {
      memoryTier = 'high';
    }
  } else if (memory !== null) {
    if (memory <= 4) {
      memoryTier = 'low';
    } else if (memory >= 12) {
      memoryTier = 'high';
    }
  }

  return {
    memoryTier,
  };
}
