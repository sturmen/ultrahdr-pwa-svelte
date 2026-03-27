/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/svelte";
import ImageProcessor from "../ImageProcessor.svelte";

function createMatchMedia(matchesDesktop: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("min-width: 1024px") ? matchesDesktop : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function createRuntime() {
  return {
    process: vi.fn(async () => new Blob(["mock-jpeg"], { type: "image/jpeg" })),
    subscribe: vi.fn(() => () => {}),
    getSnapshot: vi.fn(() => ({ status: "idle", runtime: null, error: null, progress: null })),
    initialize: vi.fn(async () => ({ ready: true })),
    dispose: vi.fn(async () => {}),
  };
}

describe("ImageProcessor offline readiness settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage?.clear?.();
    window.matchMedia = createMatchMedia(false) as typeof window.matchMedia;
  });

  it("renders offline readiness controls inside the mobile settings sheet", async () => {
    const onRepairOfflineReadiness = vi.fn();

    render(ImageProcessor, {
      props: {
        runtime: createRuntime(),
        files: [],
        pwaUpdateState: {
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
        onRepairOfflineReadiness,
      },
    });

    expect(screen.queryByTestId("offline-readiness-card")).not.toBeInTheDocument();

    await fireEvent.click(screen.getByTestId("floating-gear"));
    const settingsSheet = screen.getByTestId("settings-sheet");

    expect(within(settingsSheet).getByTestId("offline-readiness-card")).toBeInTheDocument();
    expect(within(settingsSheet).getByText(/repair needed before offline conversion/i)).toBeInTheDocument();
    expect(within(settingsSheet).getByText(/7 assets/i)).toBeInTheDocument();
    expect(within(settingsSheet).getByText(/15 mb/i)).toBeInTheDocument();
    expect(within(settingsSheet).getByText(/missing assets: 1/i)).toBeInTheDocument();

    await fireEvent.click(within(settingsSheet).getByRole("button", { name: /repair offline bundle/i }));
    expect(onRepairOfflineReadiness).toHaveBeenCalledTimes(1);
  });
});
