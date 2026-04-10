export type OfflineReadinessAction = "validate" | "repair";

export type OfflineReadinessDiagnostics = {
  missingAssetCount?: number | null;
  mismatchedAssetCount?: number | null;
  missingAssetIds?: string[] | null;
  mismatchedAssetIds?: string[] | null;
};

export type OfflineReadinessState = {
  offlineReady?: boolean;
  bundleReady?: boolean;
  bundleState?: string | null;
  bundleError?: string | null;
  bundleLastValidatedAt?: number | null;
  offlineReadinessAction?: OfflineReadinessAction | null;
  offlineBundleActionInFlight?: boolean;
  offlineBundleAssetCount?: number | null;
  offlineBundleTotalBytes?: number | null;
  offlineBundleActionError?: string | null;
  bundleDiagnostics?: OfflineReadinessDiagnostics | null;
};

export type OfflineReadinessSummary = {
  title: string;
  tone: "neutral" | "ready" | "warning";
};

export function formatOfflineBundleBytes(totalBytes: number | null | undefined): string | null {
  const normalized = Number(totalBytes);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null;
  }
  const totalMegabytes = normalized / (1024 * 1024);
  if (totalMegabytes >= 10) {
    return `${Math.round(totalMegabytes)} MB`;
  }
  return `${totalMegabytes.toFixed(1)} MB`;
}

export function formatOfflineValidatedAt(validatedAtMs: number | null | undefined): string | null {
  const normalized = Number(validatedAtMs);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    return null;
  }
  try {
    return new Date(normalized).toLocaleString();
  } catch {
    return null;
  }
}

export function describeOfflineReadiness(
  state: OfflineReadinessState | null | undefined,
): OfflineReadinessSummary {
  if (!state || typeof state !== "object") {
    return {
      title: "Offline bundle not ready yet",
      tone: "warning",
    };
  }
  if (state.offlineBundleActionInFlight && state.offlineReadinessAction === "repair") {
    return {
      title: "Repairing offline bundle",
      tone: "warning",
    };
  }
  if (state.offlineBundleActionInFlight && state.offlineReadinessAction === "validate") {
    return {
      title: "Validating offline bundle",
      tone: "neutral",
    };
  }
  if (state.bundleReady) {
    return {
      title: "Ready for offline conversion",
      tone: "ready",
    };
  }
  if (
    state.bundleState === "CORRUPT"
    || state.bundleState === "FAILED"
    || state.bundleState === "STALE"
  ) {
    return {
      title: "Repair needed before offline conversion",
      tone: "warning",
    };
  }
  return {
    title: "Offline bundle not ready yet",
    tone: "neutral",
  };
}
