/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import PwaUpdateSnackbar from "../PwaUpdateSnackbar.svelte";

describe("PwaUpdateSnackbar", () => {
  it("keeps copy and actions on one row", async () => {
    render(PwaUpdateSnackbar, {
      props: {
        pendingUntilIdle: false,
        applying: false,
        onApplyUpdate: vi.fn(async () => {}),
        onDismiss: vi.fn(async () => {}),
      },
    });

    const snackbar = screen.getByTestId("pwa-update-snackbar");
    const copy = screen.getByText(/a new version is ready/i);
    const reloadAction = screen.getByRole("button", { name: /reload/i });
    const dismissAction = screen.getByRole("button", { name: /dismiss/i });

    expect(window.getComputedStyle(snackbar).flexWrap).toBe("nowrap");
    expect(window.getComputedStyle(copy).whiteSpace).toBe("nowrap");
    expect(window.getComputedStyle(reloadAction).whiteSpace).toBe("nowrap");
    expect(window.getComputedStyle(dismissAction).whiteSpace).toBe("nowrap");
  });

  it("wires reload and dismiss actions", async () => {
    const onApplyUpdate = vi.fn(async () => {});
    const onDismiss = vi.fn(async () => {});

    render(PwaUpdateSnackbar, {
      props: {
        pendingUntilIdle: false,
        applying: false,
        onApplyUpdate,
        onDismiss,
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: /reload/i }));
    await fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));

    expect(onApplyUpdate).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
