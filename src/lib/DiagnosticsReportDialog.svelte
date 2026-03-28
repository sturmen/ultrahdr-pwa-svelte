<script lang="ts">
  import type { DiagnosticsReport } from './diagnostics.ts';

  export let open = false;
  export let report: DiagnosticsReport | null = null;
  export let reportText = '';
  export let onDismiss: () => void = () => {};
  export let onShare: () => void = () => {};
  export let onCopy: () => void = () => {};
</script>

{#if open && report}
  <div class="blocking-modal-backdrop" aria-hidden="true"></div>
  <div
    class="diagnostics-modal-card"
    role="dialog"
    aria-modal="true"
    aria-labelledby="diagnostics-report-title"
    data-testid="diagnostics-report-dialog"
  >
    <h3 id="diagnostics-report-title">Possible memory issue</h3>
    <p class="help-text diagnostics-copy">
      Share this diagnostics timeline to help identify where processing stopped.
    </p>
    <p class="help-text diagnostics-copy">
      {report.incident.memoryIssueKind} • {report.incident.confidence}
    </p>
    <textarea
      class="diagnostics-textarea"
      readonly
      value={reportText}
      aria-label="Diagnostics timeline"
    ></textarea>
    <div class="blocking-modal-actions">
      <button type="button" class="secondary" on:click={onDismiss}>
        Dismiss
      </button>
      <button
        type="button"
        class="secondary"
        data-testid="diagnostics-copy"
        on:click={onCopy}
      >
        Copy report
      </button>
      <button
        type="button"
        class="primary"
        data-testid="diagnostics-share"
        on:click={onShare}
      >
        Share report
      </button>
    </div>
  </div>
{/if}

<style>
  .blocking-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(7, 11, 14, 0.55);
    z-index: 34;
  }

  .diagnostics-modal-card {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(94vw, 560px);
    max-height: min(90vh, 720px);
    overflow: auto;
    padding: 1rem;
    border-radius: 20px;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-active) 98%, transparent);
    box-shadow: var(--shadow-lg);
    z-index: 35;
    display: grid;
    gap: 0.75rem;
  }

  .diagnostics-copy {
    margin: 0;
  }

  .diagnostics-textarea {
    width: 100%;
    min-height: 280px;
    box-sizing: border-box;
    border-radius: 12px;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-color) 94%, transparent);
    color: var(--text-color);
    font-family: monospace;
    font-size: 0.8rem;
    padding: 0.8rem;
    resize: vertical;
  }

  .blocking-modal-actions {
    display: flex;
    gap: 0.55rem;
    flex-wrap: wrap;
  }

  .blocking-modal-actions button {
    flex: 1;
  }
</style>
