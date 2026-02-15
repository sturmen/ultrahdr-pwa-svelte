/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";

import { consumeSharedFilesFromLaunch } from "../share-target-launch.js";

describe("share-target-launch", () => {
  it("does not consume files when share-target query param is missing", async () => {
    const consumeSharedFiles = vi.fn(async () => [new File(["a"], "a.jpg")]);
    const replaceState = vi.fn();

    const files = await consumeSharedFilesFromLaunch({
      search: "",
      pathname: "/ultrahdr-pwa-svelte/",
      consumeSharedFiles,
      replaceState,
    });

    expect(files).toEqual([]);
    expect(consumeSharedFiles).not.toHaveBeenCalled();
    expect(replaceState).not.toHaveBeenCalled();
  });

  it("consumes shared files and clears launch query param", async () => {
    const launchFiles = [
      new File(["a"], "a.jpg", { type: "image/jpeg" }),
      new File(["b"], "b.png", { type: "image/png" }),
    ];
    const consumeSharedFiles = vi.fn(async () => launchFiles);
    const replaceState = vi.fn();

    const files = await consumeSharedFilesFromLaunch({
      search: "?share-target=true",
      pathname: "/ultrahdr-pwa-svelte/",
      consumeSharedFiles,
      replaceState,
    });

    expect(files).toHaveLength(2);
    expect(consumeSharedFiles).toHaveBeenCalledTimes(1);
    expect(replaceState).toHaveBeenCalledWith({}, "", "/ultrahdr-pwa-svelte/");
  });

  it("returns empty array on storage errors", async () => {
    const consumeSharedFiles = vi.fn(async () => {
      throw new Error("idb failed");
    });
    const replaceState = vi.fn();

    const files = await consumeSharedFilesFromLaunch({
      search: "?share-target=true",
      pathname: "/ultrahdr-pwa-svelte/",
      consumeSharedFiles,
      replaceState,
    });

    expect(files).toEqual([]);
    expect(replaceState).not.toHaveBeenCalled();
  });
});
