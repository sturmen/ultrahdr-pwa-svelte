/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearQueueBadge, setQueueBadge } from "../badge.js";

describe("badge helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window.navigator, "setAppBadge", {
      configurable: true,
      value: vi.fn(async () => {}),
    });
    Object.defineProperty(window.navigator, "clearAppBadge", {
      configurable: true,
      value: vi.fn(async () => {}),
    });
  });

  it("sets app badge when supported", async () => {
    const ok = await setQueueBadge(3);
    expect(ok).toBe(true);
    expect(window.navigator.setAppBadge).toHaveBeenCalledWith(3);
  });

  it("clears app badge when supported", async () => {
    const ok = await clearQueueBadge();
    expect(ok).toBe(true);
    expect(window.navigator.clearAppBadge).toHaveBeenCalled();
  });
});
