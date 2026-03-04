/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";

import {
  consumeSharedFilesFromLaunch,
  registerLaunchQueueConsumer,
  __resetShareTargetLaunchForTests,
} from "../share-target-launch.js";

describe("share-target-launch", () => {
  it("consumes pending launchQueue files when available, without requiring query params", async () => {
    __resetShareTargetLaunchForTests();
    const launchedFile = new File(["hello"], "launch.jpg", { type: "image/jpeg" });
    let launchConsumer = null;
    const runtime = {
      launchQueue: {
        setConsumer: vi.fn((consumer) => {
          launchConsumer = consumer;
        }),
      },
    };

    const registered = registerLaunchQueueConsumer({ runtime });
    expect(registered).toBe(true);
    expect(runtime.launchQueue.setConsumer).toHaveBeenCalledTimes(1);

    await launchConsumer({
      files: [
        {
          kind: "file",
          getFile: vi.fn(async () => launchedFile),
        },
      ],
    });

    const replaceState = vi.fn();
    const files = await consumeSharedFilesFromLaunch({
      search: "",
      pathname: "/ultrahdr-pwa-svelte/",
      replaceState,
    });

    expect(files).toEqual([launchedFile]);
    expect(replaceState).toHaveBeenCalledWith({}, "", "/ultrahdr-pwa-svelte/");

    const secondRead = await consumeSharedFilesFromLaunch({
      search: "",
      pathname: "/ultrahdr-pwa-svelte/",
      replaceState,
    });
    expect(secondRead).toEqual([]);
  });

  it("gracefully no-ops launchQueue registration when unsupported", () => {
    __resetShareTargetLaunchForTests();
    const registered = registerLaunchQueueConsumer({ runtime: {} });
    expect(registered).toBe(false);
  });

  it("does not consume files when share-target query param is missing", async () => {
    __resetShareTargetLaunchForTests();
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
    __resetShareTargetLaunchForTests();
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
    __resetShareTargetLaunchForTests();
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
