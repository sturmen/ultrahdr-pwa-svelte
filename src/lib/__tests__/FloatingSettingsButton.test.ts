/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/svelte";
import FloatingSettingsButton from "../FloatingSettingsButton.svelte";

describe("FloatingSettingsButton", () => {
  it("raises button when update snackbar is visible", () => {
    render(FloatingSettingsButton, {
      props: {
        liftedForUpdate: true,
        onOpen: vi.fn(),
      },
    });

    const layer = screen.getByTestId("floating-settings-layer");
    const bottom = window.getComputedStyle(layer).bottom;

    expect(bottom).toContain("9.6rem");
    expect(bottom).toContain("safe-area-inset-bottom");
  });

  it("fires open callback", async () => {
    const onOpen = vi.fn();

    render(FloatingSettingsButton, {
      props: {
        liftedForUpdate: false,
        onOpen,
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: /open settings/i }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
