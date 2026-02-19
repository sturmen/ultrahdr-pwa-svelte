<script>
  import { onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';

  // We need to listen to the custom event name from pipeline-telemetry.js
  const PIPELINE_PROGRESS_EVENT = 'ultrahdr:processing-progress';

  let isVisible = false;
  let message = '';
  let executionProvider = null;
  // progress is 0-100
  let progress = 0; 

  function normalizeExecutionProvider(value) {
    if (typeof value !== 'string') {
      return null;
    }
    const normalized = value.trim().toLowerCase();
    return normalized || null;
  }

  function parseExecutionProviderFromNote(note) {
    if (typeof note !== 'string') {
      return null;
    }
    const match = /runtime:\s*([a-z0-9_-]+)/i.exec(note);
    return normalizeExecutionProvider(match?.[1] || null);
  }

  function resolveExecutionProvider(detail) {
    const fromField = normalizeExecutionProvider(detail?.gmnetExecutionProvider);
    if (fromField) {
      return fromField;
    }
    return parseExecutionProviderFromNote(detail?.note);
  }

  function formatExecutionProviderLabel(provider) {
    if (provider === 'webgpu') {
      return 'WebGPU';
    }
    if (provider === 'wasm') {
      return 'WASM';
    }
    return provider || '';
  }

  function clearStatus() {
    isVisible = false;
    executionProvider = null;
    message = '';
    progress = 0;
  }

  function isDownloadNote(note) {
    return /downloading ai/i.test(String(note || ''));
  }

  function handleProgress(event) {
    const detail = event.detail;
    // We filter for the 'generate-gain-map' stage or related AI notes
    if (detail?.stage === 'generate-gain-map') {
      // If complete or error, hide
      if (detail.phase === 'stage-complete' || detail.phase === 'stage-error') {
        clearStatus();
        return;
      }
      
      // If progress with note
      if (detail.phase === 'stage-progress') {
        const provider = resolveExecutionProvider(detail);
        if (provider) {
          executionProvider = provider;
        }
        // If fallback, hide
        if (String(detail.note || '').toLowerCase().includes('fallback')) {
          clearStatus();
          return;
        }
        isVisible = true;
        message = detail.note || 'Running AI inference...';
        progress = Number.isFinite(Number(detail.stageProgress))
          ? Number(detail.stageProgress)
          : 0;
        return;
      }
    }
    
    // Also hide on overall pipeline completion
    if (detail?.phase === 'pipeline-complete' || detail?.phase === 'pipeline-error') {
      clearStatus();
    }
  }

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener(PIPELINE_PROGRESS_EVENT, handleProgress);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener(PIPELINE_PROGRESS_EVENT, handleProgress);
    }
  });
</script>

{#if isVisible}
  <div class="model-status-toast" transition:fade role="status">
    <div class="content">
      <div class="text-group">
        <span class="message">{message}</span>
        {#if isDownloadNote(message)}
           <span class="pct">{Math.round(progress)}%</span>
        {/if}
      </div>
      {#if executionProvider}
        <span class="provider" data-testid="model-status-provider">
          Runtime: {formatExecutionProviderLabel(executionProvider)}
        </span>
      {/if}
      
      {#if isDownloadNote(message)}
        <div class="progress-bar">
          <div class="fill" style="width: {progress}%"></div>
        </div>
      {:else}
        <div class="spinner"></div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .model-status-toast {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    z-index: 9999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    pointer-events: none;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .text-group {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .message {
    font-weight: 500;
  }
  
  .pct {
    opacity: 0.7;
    font-variant-numeric: tabular-nums;
  }

  .provider {
    opacity: 0.85;
    font-size: 12px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .progress-bar {
    width: 180px;
    height: 4px;
    background: rgba(255,255,255,0.15);
    border-radius: 2px;
    overflow: hidden;
  }

  .fill {
    height: 100%;
    background-color: #3b82f6; /* Blue-500 */
    transition: width 0.1s linear;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
