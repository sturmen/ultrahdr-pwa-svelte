<script lang="ts">
  import {
    describeOfflineReadiness,
    formatOfflineBundleBytes,
    formatOfflineValidatedAt,
    type OfflineReadinessState,
  } from "./offline-readiness";

  export let state: OfflineReadinessState | null = null;
  export let onValidate: () => void | Promise<void> = () => {};
  export let onRepair: () => void | Promise<void> = () => {};

  $: offlineReadinessSummary = describeOfflineReadiness(state);
  $: offlineBundleSizeLabel = formatOfflineBundleBytes(state?.offlineBundleTotalBytes);
  $: offlineBundleValidatedAtLabel = formatOfflineValidatedAt(state?.bundleLastValidatedAt);
</script>

<section
  class={`offline-readiness-card ${offlineReadinessSummary.tone}`}
  data-testid="offline-readiness-card"
  aria-live="polite"
>
  <div class="offline-readiness-copy">
    <p class="offline-readiness-eyebrow">Offline readiness</p>
    <h2>{offlineReadinessSummary.title}</h2>
    <p>Confirm the AI models and encoders are cached before you lose connectivity.</p>
    <div class="offline-readiness-metadata">
      {#if state?.offlineBundleAssetCount}
        <span>{state.offlineBundleAssetCount} assets</span>
      {/if}
      {#if offlineBundleSizeLabel}
        <span>{offlineBundleSizeLabel}</span>
      {/if}
      {#if offlineBundleValidatedAtLabel}
        <span>Last checked: {offlineBundleValidatedAtLabel}</span>
      {/if}
    </div>
    {#if state?.bundleDiagnostics}
      <div class="offline-readiness-diagnostics">
        {#if Number(state.bundleDiagnostics.missingAssetCount) > 0}
          <span>Missing assets: {state.bundleDiagnostics.missingAssetCount}</span>
        {/if}
        {#if Number(state.bundleDiagnostics.mismatchedAssetCount) > 0}
          <span>Corrupt assets: {state.bundleDiagnostics.mismatchedAssetCount}</span>
        {/if}
      </div>
    {/if}
    {#if state?.offlineBundleActionError}
      <p class="offline-readiness-error">{state.offlineBundleActionError}</p>
    {/if}
  </div>
  <div class="offline-readiness-actions">
    <button
      type="button"
      class="footer-link"
      on:click={() => void onValidate()}
      disabled={state?.offlineBundleActionInFlight}
    >
      {#if state?.offlineBundleActionInFlight && state.offlineReadinessAction === "validate"}
        Validating...
      {:else}
        Validate offline bundle
      {/if}
    </button>
    <button
      type="button"
      class="footer-link"
      on:click={() => void onRepair()}
      disabled={state?.offlineBundleActionInFlight}
    >
      {#if state?.offlineBundleActionInFlight && state.offlineReadinessAction === "repair"}
        Repairing...
      {:else}
        Repair offline bundle
      {/if}
    </button>
  </div>
</section>

<style>
  .offline-readiness-card {
    display: grid;
    gap: 0.9rem;
    padding: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--border-subtle);
    background:
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.92),
        rgba(244, 247, 250, 0.96)
      ),
      var(--surface);
  }

  .offline-readiness-card.ready {
    border-color: rgba(21, 128, 61, 0.28);
  }

  .offline-readiness-card.warning {
    border-color: rgba(180, 83, 9, 0.34);
  }

  .offline-readiness-card h2,
  .offline-readiness-card p {
    margin: 0;
  }

  .offline-readiness-eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.72rem;
    color: var(--text-secondary);
  }

  .offline-readiness-metadata,
  .offline-readiness-diagnostics,
  .offline-readiness-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .offline-readiness-metadata span,
  .offline-readiness-diagnostics span {
    padding: 0.35rem 0.55rem;
    border-radius: 999px;
    background: var(--surface-muted);
    color: var(--text-secondary);
    font-size: 0.88rem;
  }

  .offline-readiness-error {
    color: var(--queue-failed);
  }
</style>
