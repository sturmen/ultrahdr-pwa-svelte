<script lang="ts">
  export let open = false;
  export let acknowledgement = '';
  export let value = '';
  export let isValid = false;
  export let onCancel: () => void = () => {};
  export let onProceed: () => void = () => {};
</script>

{#if open}
  <div class="blocking-modal-backdrop" aria-hidden="true"></div>
  <div
    class="blocking-modal-card"
    data-testid="mobile-inference-warning-dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby="mobile-inference-warning-title"
    aria-describedby="mobile-inference-warning-description"
  >
    <h3 id="mobile-inference-warning-title">
      This browser has severe memory limitations
    </h3>
    <p
      class="help-text blocking-modal-copy"
      id="mobile-inference-warning-description"
    >
      This webapp may require more memory than your browser permits. Please
      try Chrome on Windows or macOS.
    </p>
    <p class="help-text blocking-modal-copy">
      Type "{acknowledgement}" to proceed anyway.
    </p>
    <input
      type="text"
      class="blocking-modal-input"
      data-testid="mobile-inference-warning-input"
      bind:value
      aria-label="Type the browser warning acknowledgement to proceed"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
    />
    <div class="blocking-modal-actions">
      <button
        type="button"
        class="secondary"
        data-testid="mobile-inference-warning-cancel"
        on:click={onCancel}
      >
        Cancel
      </button>
      <button
        type="button"
        class="primary"
        data-testid="mobile-inference-warning-proceed"
        on:click={onProceed}
        disabled={!isValid}
      >
        Continue
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

  .blocking-modal-card {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: min(92vw, 420px);
    padding: 1rem;
    border-radius: 20px;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-active) 98%, transparent);
    box-shadow: var(--shadow-lg);
    z-index: 35;
    display: grid;
    gap: 0.75rem;
  }

  .blocking-modal-card h3 {
    margin: 0;
    font-size: 1rem;
  }

  .blocking-modal-copy {
    margin: 0;
  }

  .blocking-modal-input {
    width: 100%;
    min-height: 44px;
    padding: 0.7rem 0.8rem;
    border-radius: 12px;
    border: 1px solid var(--border-subtle);
    background: color-mix(in srgb, var(--surface-color) 94%, transparent);
    color: var(--text-color);
    font-size: 0.95rem;
    box-sizing: border-box;
  }

  .blocking-modal-actions {
    display: flex;
    gap: 0.55rem;
  }

  .blocking-modal-actions button {
    flex: 1;
  }
</style>
