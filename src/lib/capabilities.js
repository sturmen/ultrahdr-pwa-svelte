function getDefaultRuntime() {
  return {
    navigator: typeof navigator !== "undefined" ? navigator : {},
    window: typeof window !== "undefined" ? window : {},
    Worker: typeof Worker !== "undefined" ? Worker : undefined,
    OffscreenCanvas:
      typeof OffscreenCanvas !== "undefined" ? OffscreenCanvas : undefined,
  };
}

function normalizeDeviceMemory(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }
  return numeric;
}

function hasFileShareSupport(nav) {
  if (!nav || typeof nav.canShare !== "function") {
    return false;
  }

  if (typeof File === "undefined") {
    return false;
  }

  try {
    const probeFile = new File(["probe"], "probe.txt", { type: "text/plain" });
    return nav.canShare({ files: [probeFile] });
  } catch {
    return false;
  }
}

export function getCapabilities(runtimeOverrides = {}) {
  const runtime = { ...getDefaultRuntime(), ...runtimeOverrides };
  const nav = runtime.navigator || {};
  const win = runtime.window || {};
  const userAgent = String(nav.userAgent || "");
  const lowerUa = userAgent.toLowerCase();
  const maxTouchPoints = Number(nav.maxTouchPoints || 0);

  const isAndroid = /android/.test(lowerUa);
  const isIOS =
    /(iphone|ipad|ipod)/.test(lowerUa) ||
    (/(macintosh|mac os x)/.test(lowerUa) && maxTouchPoints > 1);
  const isSafari =
    /safari/.test(lowerUa) &&
    !/(chrome|chromium|crios|edg|opr|firefox|fxios)/.test(lowerUa);
  const isStandalone =
    Boolean(nav.standalone) ||
    (typeof win.matchMedia === "function" &&
      win.matchMedia("(display-mode: standalone)").matches);

  const supportsOffscreenWorker = Boolean(runtime.Worker && runtime.OffscreenCanvas);
  const supportsShareTarget =
    "serviceWorker" in nav || typeof ServiceWorkerGlobalScope !== "undefined";

  return {
    userAgent,
    deviceMemory: normalizeDeviceMemory(nav.deviceMemory),
    isIOS,
    isAndroid,
    isSafari,
    isStandalone,
    supportsShare: typeof nav.share === "function",
    supportsFileShare: hasFileShareSupport(nav),
    supportsShareTarget,
    supportsWakeLock: Boolean(nav.wakeLock),
    supportsOffscreenWorker,
  };
}

export function getProcessingProfile(inputCapabilities = null) {
  const capabilities = inputCapabilities || getCapabilities();
  const memory = capabilities.deviceMemory;

  let memoryTier = "mid";

  if (capabilities.isIOS) {
    memoryTier = "low";
  } else if (capabilities.isAndroid) {
    if (memory === null || memory <= 6) {
      memoryTier = "low";
    } else if (memory >= 12) {
      memoryTier = "high";
    }
  } else if (memory !== null) {
    if (memory <= 4) {
      memoryTier = "low";
    } else if (memory >= 12) {
      memoryTier = "high";
    }
  }

  const profileByTier = {
    low: {
      maxInputMegapixels: 12,
      maxGainMapMegapixels: 2,
      gainMapScale: 0.5,
      safeModeDefault: true,
    },
    mid: {
      maxInputMegapixels: 20,
      maxGainMapMegapixels: 4,
      gainMapScale: 0.75,
      safeModeDefault: false,
    },
    high: {
      maxInputMegapixels: 32,
      maxGainMapMegapixels: 6,
      gainMapScale: 1,
      safeModeDefault: false,
    },
  };

  return {
    memoryTier,
    ...profileByTier[memoryTier],
  };
}
