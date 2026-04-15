/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import App from "../../App.svelte";

type PwaUpdateTestConfig = {
  initialState?: Record<string, unknown>;
  onApplyUpdate?: () => void;
  onDismiss?: () => void;
  onValidateOfflineReadiness?: () => void;
  onRepairOfflineReadiness?: () => void;
};

type TestGlobal = typeof globalThis & {
  __PWA_UPDATE_TEST_CONFIG?: PwaUpdateTestConfig;
};

vi.mock("../share-target-launch.js", () => ({
  consumeSharedFilesFromLaunch: vi.fn(async () => []),
  registerLaunchQueueConsumer: vi.fn(() => true),
}));

vi.mock("../processing.js", () => ({
  createProcessingRuntime: vi.fn(() => ({
    initialize: vi.fn(async () => ({ ready: true, resolvedExecutionProvider: "webgpu" })),
    process: vi.fn(async () => new Blob(["mock-jpeg"], { type: "image/jpeg" })),
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({ status: "idle", runtime: null, error: null, progress: null })),
    dispose: vi.fn(async () => {}),
  })),
  RUNTIME_INIT_STEP_ORDER: ["startup-ready"],
  RUNTIME_INIT_STEP_LABELS: { "startup-ready": "Finalize startup readiness" },
}));

vi.mock("../runtime-post-update-warmup.ts", () => ({
  warmRuntimeForUpdatedAssetVersion: vi.fn(async () => false),
}));

vi.mock("../pwa-updater.js", () => {
  const createDefaultPwaUpdateState = () => ({
    supported: true,
    updateAvailable: false,
    notificationVisible: false,
    availableVersion: null,
    ignoredVersions: [],
    pendingUntilIdle: false,
    applying: false,
    offlineReady: false,
    bundleReady: false,
    bundleState: "EMPTY",
    bundleError: null,
    bundleLastValidatedAt: null,
    lastCheckAt: null,
    lastError: null,
  });

  const createPwaUpdateCoordinator = ({ onStateChange = () => {} } = {}) => {
    const config = (globalThis as TestGlobal).__PWA_UPDATE_TEST_CONFIG || {};
    let state = {
      ...createDefaultPwaUpdateState(),
      ...(config.initialState || {}),
    };
    const applyUpdate = vi.fn(async () => {
      config.onApplyUpdate?.();
    });
    const dismissUpdateNotification = vi.fn(async () => {
      state = { ...state, notificationVisible: false };
      onStateChange({ ...state });
      config.onDismiss?.();
    });
    const validateOfflineReadiness = vi.fn(async () => {
      config.onValidateOfflineReadiness?.();
    });
    const repairOfflineReadiness = vi.fn(async () => {
      config.onRepairOfflineReadiness?.();
    });
    const setBusy = vi.fn();
    const dispose = vi.fn();
    onStateChange({ ...state });
    return {
      applyUpdate,
      dismissUpdateNotification,
      checkForUpdates: vi.fn(async () => true),
      dispose,
      getState: () => ({ ...state }),
      repairOfflineReadiness,
      setBusy,
      validateOfflineReadiness,
    };
  };

  return {
    createDefaultPwaUpdateState,
    createPwaUpdateCoordinator,
  };
});

describe("App PWA update UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as TestGlobal).__PWA_UPDATE_TEST_CONFIG = undefined;
  });

  it("never renders checking-for-update text, even if updater state says checking", async () => {
    (globalThis as TestGlobal).__PWA_UPDATE_TEST_CONFIG = {
      initialState: {
        checking: true,
        updateAvailable: false,
      },
    };

    render(App);
    await screen.findByTestId("tab-convert");
    expect(screen.queryByText(/checking for updates/i)).not.toBeInTheDocument();
  });

  it("shows a persistent snackbar when an undismissed update is available", async () => {
    (globalThis as TestGlobal).__PWA_UPDATE_TEST_CONFIG = {
      initialState: {
        updateAvailable: true,
        notificationVisible: true,
        availableVersion: "v-next",
        ignoredVersions: [],
      },
    };

    render(App);
    await screen.findByTestId("tab-convert");
    expect(screen.getByTestId("pwa-update-snackbar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reload/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dismiss/i })).toBeInTheDocument();
  });

  it("dismiss action hides the snackbar", async () => {
    (globalThis as TestGlobal).__PWA_UPDATE_TEST_CONFIG = {
      initialState: {
        updateAvailable: true,
        notificationVisible: true,
        availableVersion: "v-dismiss",
      },
    };

    render(App);
    await screen.findByTestId("pwa-update-snackbar");
    await fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(screen.queryByTestId("pwa-update-snackbar")).not.toBeInTheDocument();
  });

  it("shows deferred-reload snackbar state while processing is busy", async () => {
    (globalThis as TestGlobal).__PWA_UPDATE_TEST_CONFIG = {
      initialState: {
        updateAvailable: true,
        notificationVisible: true,
        pendingUntilIdle: true,
        availableVersion: "v-pending",
      },
    };

    render(App);
    await screen.findByTestId("tab-convert");
    expect(screen.getByTestId("pwa-update-snackbar")).toBeInTheDocument();
    expect(screen.getByText(/reload will happen when processing becomes idle/i)).toBeInTheDocument();
  });

  it("does not render offline readiness in the main app shell", async () => {
    (globalThis as TestGlobal).__PWA_UPDATE_TEST_CONFIG = {
      initialState: {
        bundleReady: false,
        bundleState: "CORRUPT",
        bundleLastValidatedAt: 1710000000000,
        offlineReadinessAction: "repair",
        offlineBundleActionInFlight: false,
        offlineBundleAssetCount: 7,
        offlineBundleTotalBytes: 15728640,
        bundleDiagnostics: {
          missingAssetCount: 1,
          mismatchedAssetCount: 2,
        },
      },
    };

    render(App);
    await screen.findByTestId("tab-convert");

    expect(screen.queryByTestId("offline-readiness-card")).not.toBeInTheDocument();
    expect(screen.queryByText(/repair needed before offline conversion/i)).not.toBeInTheDocument();
  });
});
