<script>
  import DropZone from "./lib/DropZone.svelte";
  import ImageProcessor from "./lib/ImageProcessor.svelte";

  let files = [];

  function handleFiles(event) {
    files = Array.from(event.detail);
  }

  function handleReset() {
    files = [];
  }
</script>

<main>
  <h1>UltraHDR Image Enhancer</h1>
  <p class="subtitle">
    Convert your images to UltraHDR.<br />
    No cost, no cloud, no server, no registration, no ads.<br />
    Completely private, completely offline.
  </p>

  {#if files.length === 0}
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
    <a href="https://github.com/sturmen/ultrahdr-pwa-svelte">Source code</a>
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
</style>
