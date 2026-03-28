<script lang="ts">
  import {
    describeOfflineReadiness,
    formatOfflineBundleBytes,
    type OfflineReadinessState,
  } from "./offline-readiness";

  export let state: OfflineReadinessState | null = null;
  export let onValidate: () => void | Promise<void> = () => {};
  export let onRepair: () => void | Promise<void> = () => {};

  $: offlineReadinessSummary = describeOfflineReadiness(state);
  $: offlineBundleSizeLabel = formatOfflineBundleBytes(state?.offlineBundleTotalBytes);
  $: missingAssetIdsLabel = Array.isArray(state?.bundleDiagnostics?.missingAssetIds)
    ? state.bundleDiagnostics.missingAssetIds.filter((assetId) => typeof assetId === "string" && assetId.trim().length > 0).join(", ")
    : "";
  $: mismatchedAssetIdsLabel = Array.isArray(state?.bundleDiagnostics?.mismatchedAssetIds)
    ? state.bundleDiagnostics.mismatchedAssetIds.filter((assetId) => typeof assetId === "string" && assetId.trim().length > 0).join(", ")
    : "";
</script>

<section
  class={`offline-readiness-card compact ${offlineReadinessSummary.tone}`}
  data-testid="offline-readiness-card"
  aria-live="polite"
>
  <div class="offline-readiness-copy">
    <p class="offline-readiness-title">{offlineReadinessSummary.title}</p>
    <div class="offline-readiness-metadata">
      {#if state?.offlineBundleAssetCount}
        <span>{state.offlineBundleAssetCount} assets</span>
      {/if}
      {#if offlineBundleSizeLabel}
        <span>{offlineBundleSizeLabel}</span>
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
      {#if missingAssetIdsLabel || mismatchedAssetIdsLabel}
        <div class="offline-readiness-details">
          {#if missingAssetIdsLabel}
            <p><strong>Missing asset IDs:</strong> {missingAssetIdsLabel}</p>
          {/if}
          {#if mismatchedAssetIdsLabel}
            <p><strong>Corrupt asset IDs:</strong> {mismatchedAssetIdsLabel}</p>
          {/if}
        </div>
      {/if}
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
        Validate
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
        Repair
      {/if}
    </button>
  </div>
</section>

<style>
  .offline-readiness-card {
    display: grid;
    gap: 0.38rem;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .offline-readiness-card p {
    margin: 0;
  }

  .offline-readiness-title {
    font-size: 0.96rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .offline-readiness-card.ready .offline-readiness-title {
    color: color-mix(in srgb, var(--success, #15803d) 80%, var(--text-primary));
  }

  .offline-readiness-card.warning .offline-readiness-title {
    color: color-mix(in srgb, #b45309 80%, var(--text-primary));
  }

  .offline-readiness-metadata,
  .offline-readiness-diagnostics,
  .offline-readiness-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .offline-readiness-details {
    display: grid;
    gap: 0.2rem;
    margin-top: 0.1rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
    word-break: break-word;
  }

  .offline-readiness-metadata span,
  .offline-readiness-diagnostics span {
    padding: 0.2rem 0.45rem;
    border-radius: 999px;
    background: var(--surface-muted);
    color: var(--text-secondary);
    font-size: 0.78rem;
  }

  .offline-readiness-details p {
    margin: 0;
  }

  .offline-readiness-error {
    color: var(--queue-failed);
    font-size: 0.8rem;
  }

  .offline-readiness-actions {
    margin-top: 0.05rem;
  }
</style>
