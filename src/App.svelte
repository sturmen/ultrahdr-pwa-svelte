<script>
  import { onMount } from "svelte";
  import DropZone from "./lib/DropZone.svelte";
  import ImageProcessor from "./lib/ImageProcessor.svelte";
  import { consumeSharedFilesFromLaunch } from "./lib/share-target-launch.js";

  const version = import.meta.env.VITE_APP_VERSION || 'dev';

  let files = [];
  let shareLaunchChecked = false;

  function handleFiles(event) {
    files = Array.from(event.detail);
  }

  function handleReset() {
    files = [];
  }

  onMount(async () => {
    const sharedFiles = await consumeSharedFilesFromLaunch();
    if (sharedFiles.length > 0) {
      files = sharedFiles;
    }
    shareLaunchChecked = true;
  });
</script>

<main>
  <h1>UltraHDR Image Enhancer</h1>
  <p class="subtitle">
    Convert your images to UltraHDR.<br />
    No cost, no cloud, no server, no registration, no ads.<br />
    Completely private, completely offline.
  </p>

  {#if !shareLaunchChecked}
    <div class="drop-container">
      <p class="share-loading">Loading shared images...</p>
    </div>
  {:else if files.length === 0}
    <div class="drop-container">
      <DropZone on:files={handleFiles} />
    </div>
  {:else}
    <ImageProcessor {files} on:reset={handleReset} />
  {/if}
  <p class="footer">
    <b>Try Google Chrome on Windows/macOS if you run into issues.</b><br />
    <a href="https://gregbenzphotography.com/hdr/#whatishdr">What is HDR?</a><br
    />
    <a href="https://github.com/sturmen/ultrahdr-pwa-svelte">Source code</a><br />
    Version {version}
  </p>
</main>

<style>
  .subtitle {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 3rem;
  }

  .drop-container {
    max-width: 800px;
    margin: 0 auto;
  }

  .share-loading {
    color: var(--text-secondary);
  }
</style>
