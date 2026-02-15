/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";

import {
  getConstrainedDimensions,
  throwIfAborted
} from "../processing.js";

describe("processing safe mode helpers", () => {
  it("keeps original dimensions when under megapixel limit", () => {
    const result = getConstrainedDimensions(2000, 1500, 12);
    expect(result).toEqual({
      width: 2000,
      height: 1500,
      changed: false,
    });
  });

  it("downscales proportionally when above megapixel limit", () => {
    const result = getConstrainedDimensions(8000, 6000, 12);

    expect(result.changed).toBe(true);
    expect(result.width).toBeLessThan(8000);
    expect(result.height).toBeLessThan(6000);
    expect((result.width * result.height) / 1_000_000).toBeLessThanOrEqual(12.01);
  });

  it("throws AbortError when signal is aborted", () => {
    const controller = new AbortController();
    controller.abort();

    expect(() => throwIfAborted(controller.signal)).toThrow(/aborted/i);
  });
});
