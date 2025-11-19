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
  <h1>UltraHDR Converter</h1>
  <p class="subtitle">
    Convert your images to UltraHDR with gain maps, entirely offline.
  </p>

  {#if files.length === 0}
    <div class="drop-container">
      <DropZone on:files={handleFiles} />
    </div>
  {:else}
    <ImageProcessor {files} on:reset={handleReset} />
  {/if}
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
