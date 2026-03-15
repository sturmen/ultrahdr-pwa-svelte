/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";

import {
  buildShareFiles,
  getSelectedResults,
  releaseResultUrls
} from "../result-management";

describe("result-management", () => {
  it("releases all object URLs in result collection", () => {
    const revokeObjectURL = vi.fn();
    const results = [
      { url: "blob:1" },
      { url: "blob:2" },
      { url: null },
    ];

    releaseResultUrls(results, revokeObjectURL);

    expect(revokeObjectURL).toHaveBeenCalledTimes(2);
    expect(revokeObjectURL).toHaveBeenNthCalledWith(1, "blob:1");
    expect(revokeObjectURL).toHaveBeenNthCalledWith(2, "blob:2");
  });

  it("returns selected results by index", () => {
    const results = [
      { originalName: "a.jpg" },
      { originalName: "b.jpg" },
      { originalName: "c.jpg" },
    ];
    const selected = getSelectedResults(results, new Set([0, 2]));

    expect(selected).toHaveLength(2);
    expect(selected.map((item) => item.originalName)).toEqual(["a.jpg", "c.jpg"]);
  });

  it("builds shareable File objects from selected result blobs", async () => {
    const results = [
      { originalName: "a.jpg", blob: new Blob(["a"], { type: "image/jpeg" }) },
      { originalName: "b.png", blob: new Blob(["b"], { type: "image/jpeg" }) },
    ];

    const shareFiles = await buildShareFiles(results, new Set([0, 1]));

    expect(shareFiles).toHaveLength(2);
    expect(shareFiles[0]).toBeInstanceOf(File);
    expect(shareFiles[0].name).toBe("a.jpg");
    expect(shareFiles[1].name).toBe("b.jpg");
  });
});
