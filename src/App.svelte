<script>
  import { onMount, tick } from "svelte";
  import DropZone from "./lib/DropZone.svelte";
  import ImageProcessor from "./lib/ImageProcessor.svelte";
  import { consumeSharedFilesFromLaunch } from "./lib/share-target-launch.js";
  import { loadQueueState } from "./lib/share-store.js";

  const version = import.meta.env.VITE_APP_VERSION || 'dev';

  let files = [];
  let shareLaunchChecked = false;
  let launchSource = "regular";
  let restoreNotice = null;
  let launchIntent = { action: null, tab: null };

  function handleFiles(event) {
    files = Array.from(event.detail);
  }

  function handleReset() {
    files = [];
    launchSource = "regular";
    launchIntent = { action: null, tab: null };
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

  onMount(async () => {
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
  });
</script>

<main class="app-shell" data-testid="app-shell">
  <header class="app-header">
    <p class="eyebrow">UltraHDR Converter</p>
    <h1>UltraHDR Image Enhancer</h1>
    <p class="subtitle">Convert your images to UltraHDR directly on your device.</p>
    <div class="trust-strip" role="list" aria-label="Trust and privacy indicators">
      <span role="listitem">Private Processing</span>
      <span role="listitem">Works Offline</span>
      <span role="listitem">No Cloud Upload</span>
    </div>
  </header>

  <section class="content-area" aria-live="polite">
    {#if !shareLaunchChecked}
      <div class="drop-container">
        <p class="share-loading">Loading shared images...</p>
      </div>
    {:else if files.length === 0}
      <div class="drop-container">
        <DropZone on:files={handleFiles} />
        {#if restoreNotice}
          <p class="restore-notice">{restoreNotice}</p>
        {/if}
      </div>
    {:else}
      <ImageProcessor {files} {launchSource} {launchIntent} on:reset={handleReset} />
    {/if}
  </section>

  <footer class="footer">
    <p class="footer-compatibility">
      <b>Try Google Chrome on Windows/macOS if you run into issues.</b>
    </p>
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
    display: grid;
    gap: 0.75rem;
  }

  .eyebrow {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.85rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 600;
  }

  h1 {
    margin: 0;
  }

  .subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
    max-width: 48ch;
  }

  .trust-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .trust-strip span {
    border: 1px solid var(--border-subtle);
    background: var(--surface-muted);
    color: var(--text-muted);
    border-radius: 999px;
    padding: 0.25rem 0.7rem;
    font-size: 0.8rem;
    font-weight: 600;
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

  .footer a:hover {
    text-decoration: underline;
  }

  @media (min-width: 768px) {
    .app-shell {
      gap: 1.25rem;
    }

    .subtitle {
      font-size: 1.1rem;
    }
  }
</style>
