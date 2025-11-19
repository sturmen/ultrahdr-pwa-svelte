<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  let isDragOver = false;

  function handleDragOver(e) {
    e.preventDefault();
    isDragOver = true;
  }

  function handleDragLeave() {
    isDragOver = false;
  }

  function handleDrop(e) {
    e.preventDefault();
    isDragOver = false;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      dispatch('files', e.dataTransfer.files);
    }
  }

  function handleInput(e) {
    if (e.target.files && e.target.files.length > 0) {
      dispatch('files', e.target.files);
    }
  }
</script>

<div
  class="drop-zone"
  class:active={isDragOver}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  role="button"
  tabindex="0"
  aria-label="Upload images"
>
  <input type="file" id="file-input" multiple accept="image/*" on:change={handleInput} hidden />
  <label for="file-input" class="drop-label">
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    </div>
    <p>Drag & Drop images here or <span class="highlight">Browse</span></p>
    <p class="subtext">Supports JPEG, PNG, WebP</p>
  </label>
</div>

<style>
  .drop-zone {
    border: 2px dashed var(--text-secondary);
    border-radius: var(--border-radius);
    padding: 3rem;
    text-align: center;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.02);
    cursor: pointer;
  }

  .drop-zone.active {
    border-color: var(--primary-color);
    background: rgba(10, 132, 255, 0.1);
    transform: scale(1.02);
  }

  .drop-label {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .icon {
    width: 48px;
    height: 48px;
    color: var(--primary-color);
  }
  
  .icon svg {
    width: 100%;
    height: 100%;
  }

  p {
    margin: 0;
    font-size: 1.1rem;
    color: var(--text-color);
  }

  .highlight {
    color: var(--primary-color);
    font-weight: 600;
  }

  .subtext {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
</style>
