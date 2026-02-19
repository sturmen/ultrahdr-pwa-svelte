/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";

import {
  getConstrainedDimensions,
  throwIfAborted
} from "../processing-core.js";

describe("processing dimension helpers", () => {
  it("keeps original dimensions when already within the 8192x8192 box", () => {
    const result = getConstrainedDimensions(6000, 4000);
    expect(result).toEqual({
      width: 6000,
      height: 4000,
      changed: false,
    });
  });

  it("aspect-fits oversized images to the 8192x8192 box", () => {
    const result = getConstrainedDimensions(12000, 9000);

    expect(result).toEqual({
      width: 8192,
      height: 6144,
      changed: true,
    });
  });

  it("preserves aspect ratio when only one dimension exceeds 8192", () => {
    const result = getConstrainedDimensions(5000, 9000);

    expect(result.changed).toBe(true);
    expect(result.width).toBeLessThanOrEqual(8192);
    expect(result.height).toBeLessThanOrEqual(8192);

    const originalAspect = 5000 / 9000;
    const constrainedAspect = result.width / result.height;
    expect(Math.abs(originalAspect - constrainedAspect)).toBeLessThan(0.002);
  });

  it("throws AbortError when signal is aborted", () => {
    const controller = new AbortController();
    controller.abort();

    expect(() => throwIfAborted(controller.signal)).toThrow(/aborted/i);
  });
});
