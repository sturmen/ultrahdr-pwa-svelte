<script>
  import { onMount } from "svelte";
  import {
    DEFAULT_PROCESSING_PREFERENCES,
    loadProcessingPreferences,
    saveProcessingPreferences,
  } from "./processing-preferences.js";

  let preferences = { ...DEFAULT_PROCESSING_PREFERENCES };
  let showAdvanced = false;

  function persist(nextPreferences) {
    preferences = saveProcessingPreferences(nextPreferences);
  }

  function handleBackendPreferenceChange(event) {
    persist({
      ...preferences,
      backendPreference: event?.target?.value,
    });
  }

  function handleCheckpointingPreferenceChange(event) {
    persist({
      ...preferences,
      gmnetCheckpointingPreference: event?.target?.value,
    });
  }

  function handleQualityChange(event) {
    persist({
      ...preferences,
      quality: Number(event?.target?.value),
    });
  }

  function handleBoostChange(event) {
    persist({
      ...preferences,
      maxContentBoostStops: Number(event?.target?.value),
    });
  }

  function handleRotationChange(event) {
    persist({
      ...preferences,
      rotation: Number(event?.target?.value),
    });
  }

  function handleBooleanChange(key, checked) {
    persist({
      ...preferences,
      [key]: Boolean(checked),
    });
  }

  onMount(() => {
    preferences = loadProcessingPreferences();
  });
</script>

<section class="home-settings card" data-testid="home-processing-settings">
  <h2>Pre-Processing Settings</h2>
  <p class="help-text">
    Configure safety-critical options before selecting files.
  </p>

  <div class="control-group horizontal">
    <label for="home-backend-preference-select">Backend</label>
    <div class="select-wrapper">
      <select
        id="home-backend-preference-select"
        data-testid="home-backend-preference-select"
        value={preferences.backendPreference}
        on:change={handleBackendPreferenceChange}
      >
        <option value="auto">Auto (Recommended)</option>
        <option value="webgpu">WebGPU</option>
        <option value="webgl">WebGL</option>
        <option value="wasm">WASM</option>
      </select>
    </div>
  </div>

  <div class="control-group horizontal">
    <label for="home-gmnet-memory-mode-select">GMNet Memory Mode</label>
    <div class="select-wrapper">
      <select
        id="home-gmnet-memory-mode-select"
        data-testid="home-gmnet-memory-mode-select"
        value={preferences.gmnetCheckpointingPreference}
        on:change={handleCheckpointingPreferenceChange}
      >
        <option value="auto">Auto (Recommended)</option>
        <option value="force">Force Checkpointing</option>
        <option value="off">In-Memory Only</option>
      </select>
    </div>
  </div>

  <button
    type="button"
    class="text-btn"
    data-testid="home-settings-expand-toggle"
    on:click={() => {
      showAdvanced = !showAdvanced;
    }}
  >
    {showAdvanced ? "Hide advanced settings" : "More settings"}
  </button>

  {#if showAdvanced}
    <div data-testid="home-settings-advanced-content">
      <div class="control-group">
        <label for="home-max-content-boost">HDR Strength (Stops)</label>
        <div class="range-wrapper">
          <input
            id="home-max-content-boost"
            data-testid="home-max-content-boost"
            type="range"
            min="0"
            max="4"
            step="0.1"
            value={preferences.maxContentBoostStops}
            on:input={handleBoostChange}
          />
          <span class="value">{preferences.maxContentBoostStops.toFixed(1)} stops</span>
        </div>
      </div>

      <div class="control-group horizontal">
        <label for="home-quality-select">Quality</label>
        <div class="select-wrapper">
          <select
            id="home-quality-select"
            data-testid="home-quality-select"
            value={preferences.quality}
            on:change={handleQualityChange}
          >
            <option value={1.0}>Lossless</option>
            <option value={0.95}>High</option>
            <option value={0.75}>Medium</option>
            <option value={0.5}>Low</option>
          </select>
        </div>
      </div>

      <div class="control-group switch-group">
        <label class="switch">
          <input
            type="checkbox"
            checked={preferences.useJpegli}
            on:change={(event) =>
              handleBooleanChange("useJpegli", event?.target?.checked)}
          />
          <span class="slider"></span>
        </label>
        <span class="switch-label">High-Quality JPEG Encoding</span>
      </div>

      <div class="control-group switch-group">
        <label class="switch">
          <input
            type="checkbox"
            checked={preferences.discardGainMap}
            on:change={(event) =>
              handleBooleanChange("discardGainMap", event?.target?.checked)}
          />
          <span class="slider"></span>
        </label>
        <span class="switch-label">Discard existing gain map(s)</span>
      </div>

      <div class="control-group switch-group">
        <label class="switch">
          <input
            type="checkbox"
            checked={preferences.stripExif}
            on:change={(event) =>
              handleBooleanChange("stripExif", event?.target?.checked)}
          />
          <span class="slider"></span>
        </label>
        <span class="switch-label">Strip EXIF data</span>
      </div>

      <div class="control-group switch-group">
        <label class="switch">
          <input
            type="checkbox"
            checked={preferences.keepScreenAwake}
            on:change={(event) =>
              handleBooleanChange("keepScreenAwake", event?.target?.checked)}
          />
          <span class="slider"></span>
        </label>
        <span class="switch-label">Keep screen awake while processing</span>
      </div>

      <div class="control-group horizontal">
        <label for="home-rotation-select">Rotation</label>
        <div class="select-wrapper">
          <select
            id="home-rotation-select"
            value={preferences.rotation}
            on:change={handleRotationChange}
          >
            <option value={0}>0°</option>
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </div>
      </div>
    </div>
  {/if}
</section>

<style>
  .home-settings {
    margin: 0 0 0.9rem;
    padding: 1rem;
    display: grid;
    gap: 0.8rem;
  }

  .home-settings h2 {
    margin: 0;
    font-size: 1rem;
  }
</style>
