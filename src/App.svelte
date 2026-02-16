<script>
  import { onMount, tick } from "svelte";
  import DropZone from "./lib/DropZone.svelte";
  import ImageProcessor from "./lib/ImageProcessor.svelte";
  import { consumeSharedFilesFromLaunch } from "./lib/share-target-launch.js";
  import { loadQueueState } from "./lib/share-store.js";
  import { createDefaultPwaUpdateState, createPwaUpdateCoordinator } from "./lib/pwa-updater.js";

  const version = import.meta.env.VITE_APP_VERSION || 'dev';

  let files = [];
  let shareLaunchChecked = false;
  let launchSource = "regular";
  let restoreNotice = null;
  let launchIntent = { action: null, tab: null };
  let activeView = "converter";
  let isProcessingBusy = false;
  let pwaUpdateState = createDefaultPwaUpdateState();
  let pwaUpdateCoordinator = null;

  function handleFiles(event) {
    files = Array.from(event.detail);
  }

  function handleReset() {
    files = [];
    launchSource = "regular";
    launchIntent = { action: null, tab: null };
    isProcessingBusy = false;
  }

  function openAbout() {
    activeView = "about";
  }

  function openConverter() {
    activeView = "converter";
  }

  function parseLaunchIntent(search) {
    const params = new URLSearchParams(search || "");
    const action = params.get("action");
    const tab = params.get("tab");
    return {
      action: action || null,
      tab: tab || null,
    };
  }

  async function maybeAutoPickImages() {
    if (launchIntent.action !== "pick" || files.length > 0) return;
    await tick();
    const input = document.getElementById("file-upload");
    if (input && typeof input.click === "function") {
      input.click();
    }
  }

  function handleProcessingBusyChange(event) {
    isProcessingBusy = Boolean(event.detail?.busy);
    pwaUpdateCoordinator?.setBusy(isProcessingBusy);
  }

  async function applyAppUpdate() {
    await pwaUpdateCoordinator?.applyUpdate();
  }

  onMount(() => {
    pwaUpdateCoordinator = createPwaUpdateCoordinator({
      onStateChange: (nextState) => {
        pwaUpdateState = nextState;
      },
      isBusy: () => isProcessingBusy,
    });

    (async () => {
      launchIntent = parseLaunchIntent(
        typeof window !== "undefined" ? window.location.search : "",
      );
      const sharedFiles = await consumeSharedFilesFromLaunch();
      if (sharedFiles.length > 0) {
        files = sharedFiles;
        launchSource = "share-target";
      } else {
        launchSource = "regular";
        try {
          const persistedQueue = await loadQueueState();
          if (persistedQueue?.hasPending) {
            restoreNotice = "Previous queue could not be restored. Please re-add files.";
          }
        } catch (e) {
          console.warn("[App] Unable to load persisted queue state:", e);
        }
      }
      shareLaunchChecked = true;
      await maybeAutoPickImages();
    })();

    return () => {
      pwaUpdateCoordinator?.dispose();
      pwaUpdateCoordinator = null;
    };
  });
</script>

<main class="app-shell" data-testid="app-shell">
  <header class="app-header">
    <h1>UltraHDR Converter</h1>
  </header>

  <section class="content-area" aria-live="polite">
    {#if activeView === "about"}
      <article class="about-page" data-testid="about-page">
        <h2>About UltraHDR Converter</h2>
        <p>
          UltraHDR Converter turns your existing photos into UltraHDR images directly in your browser.
          Your files stay on your device, and output images are generated locally.
        </p>

        <div class="about-taglines" role="list" aria-label="UltraHDR Converter advantages">
          <span role="listitem">No Cloud Upload</span>
          <span role="listitem">Works Offline</span>
          <span role="listitem">Private Processing</span>
          <span role="listitem">Share In and Share Out</span>
        </div>

        <div class="about-copy">
          <h3>How This PWA Works</h3>
          <p>
            The app is a Progressive Web App (PWA), which means it can install like a mobile app while
            still running web technology under the hood. On supported browsers, its interface and assets
            are cached so it can launch and run even without a network connection.
          </p>
          <p>
            When you pick or share photos into the app, conversion runs in your browser using a local
            WebAssembly encoder. The queue processes each file on-device, updates progress in real time,
            and then lets you export by Share or Download when each result is ready.
          </p>
          <p>
            Because processing is local, performance depends on your device and browser. Newer phones and
            desktops complete batches faster, while older devices may pause background tabs more
            aggressively to save power.
          </p>
        </div>
      </article>
    {:else if !shareLaunchChecked}
      <div class="drop-container">
        <p class="share-loading">Loading shared images...</p>
      </div>
    {:else}
      {#if files.length === 0}
        <div class="drop-container">
          <DropZone on:files={handleFiles} />
          {#if restoreNotice}
            <p class="restore-notice">{restoreNotice}</p>
          {/if}
        </div>
      {:else}
        <ImageProcessor
          {files}
          {launchSource}
          {launchIntent}
          on:reset={handleReset}
          on:processingbusychange={handleProcessingBusyChange}
        />
      {/if}
    {/if}
  </section>

  <footer class="footer">
    <p class="footer-compatibility">
      <b>Try Google Chrome on Windows/macOS if you run into issues.</b>
    </p>
    {#if activeView === "about"}
      <button class="footer-link" type="button" on:click={openConverter}>Back to Converter</button>
    {:else}
      <button class="footer-link" type="button" on:click={openAbout}>About</button>
    {/if}
    {#if pwaUpdateState.updateAvailable}
      {#if pwaUpdateState.pendingUntilIdle}
        <span class="footer-update" data-testid="pwa-update-pending">
          Update downloaded. It can be applied when processing is idle.
        </span>
      {:else}
        <span class="footer-update" data-testid="pwa-update-available">
          A newer version is ready.
          <button
            class="footer-link footer-update-action"
            type="button"
            on:click={applyAppUpdate}
            disabled={pwaUpdateState.applying}
          >
            {pwaUpdateState.applying ? "Updating..." : "Update now"}
          </button>
        </span>
      {/if}
    {:else if pwaUpdateState.checking}
      <span class="footer-update" data-testid="pwa-update-checking">Checking for updates...</span>
    {/if}
    <a href="https://gregbenzphotography.com/hdr/#whatishdr">What is HDR?</a>
    <a href="https://github.com/sturmen/ultrahdr-pwa-svelte">Source code</a>
    <span>Version {version}</span>
  </footer>
</main>

<style>
  .app-shell {
    display: grid;
    gap: 1rem;
  }

  .app-header {
    padding-top: 0.25rem;
  }

  h1 {
    margin: 0;
    font-size: clamp(1.3rem, 2.2vw, 1.8rem);
  }

  .content-area {
    min-height: 40vh;
  }

  .drop-container {
    max-width: 980px;
    margin: 0 auto;
  }

  .share-loading {
    color: var(--text-secondary);
    padding: 2rem 1rem;
    text-align: center;
  }

  .restore-notice {
    margin: 0.8rem 0 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .about-page {
    max-width: 820px;
    margin: 0 auto;
    padding: 0.4rem 0.1rem 0.6rem;
    display: grid;
    gap: 0.9rem;
  }

  .about-page h2,
  .about-page h3,
  .about-page p {
    margin: 0;
  }

  .about-page h2 {
    font-size: clamp(1.1rem, 2.4vw, 1.4rem);
  }

  .about-page h3 {
    font-size: 1rem;
  }

  .about-page p {
    color: var(--text-secondary);
    line-height: 1.55;
  }

  .about-taglines {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .about-taglines span {
    border: 1px solid var(--border-subtle);
    background: var(--surface-muted);
    color: var(--text-muted);
    border-radius: 999px;
    padding: 0.25rem 0.7rem;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .about-copy {
    display: grid;
    gap: 0.7rem;
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1rem;
    align-items: center;
    color: var(--text-muted);
    font-size: 0.85rem;
    border-top: 1px solid var(--border-subtle);
    padding-top: 1rem;
  }

  .footer-compatibility {
    margin: 0;
    flex-basis: 100%;
  }

  .footer a {
    color: var(--text-link);
    text-decoration: none;
  }

  .footer-link {
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: var(--text-link);
    text-decoration: none;
    cursor: pointer;
  }

  .footer-link:hover {
    text-decoration: underline;
  }

  .footer-update {
    display: inline-flex;
    gap: 0.35rem;
    align-items: center;
    color: var(--text-secondary);
  }

  .footer-update-action:disabled {
    opacity: 0.65;
    cursor: progress;
  }

  .footer a:hover {
    text-decoration: underline;
  }

  @media (min-width: 768px) {
    .app-shell {
      gap: 1.25rem;
    }

    .about-page {
      gap: 1rem;
    }
  }
</style>
