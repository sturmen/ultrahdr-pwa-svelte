export const IMAGE_MAX_LONG_EDGE = 16384;
export const GMNET_MAX_LONG_EDGE = IMAGE_MAX_LONG_EDGE / 2;
/**
 * Hard cap on HDR-intent payload long edge before libultrahdr encode.
 *
 * libultrahdr's HDR-intent encode (`JpegR::encodeJPEGR` API-0) allocates
 * multiple simultaneous full-resolution working buffers (HDR intent + SDR
 * RGBA8888 tonemap + gainmap + YCbCr) that together exceed the wasm32
 * contiguous-allocation budget at high resolutions. Empirically, 96 MP
 * (12000x8000) hits `std::bad_alloc -> abort()`; ~50 MP works. Cap matches
 * `GMNET_MAX_LONG_EDGE` so HDR-intent inputs share the same downscale
 * ceiling as the GMNet generated-gainmap path.
 */
export const HDR_INTENT_MAX_LONG_EDGE = GMNET_MAX_LONG_EDGE;

export const PWA_UPDATE_SNACKBAR_COPY = {
  ready: "A new version is ready.",
  pendingUntilIdle: "Reload will happen when processing becomes idle.",
} as const;

export const PWA_UPDATE_SNACKBAR_RELOAD_LABEL = {
  idle: "Reload",
  pendingUntilIdle: "Waiting for idle...",
  applying: "Updating...",
} as const;

export const PWA_UPDATE_SNACKBAR_DISMISS_LABEL = "Dismiss";

export const FLOATING_SETTINGS_BUTTON_BOTTOM =
  "calc(env(safe-area-inset-bottom, 0px) + 4.8rem)";

export const FLOATING_SETTINGS_BUTTON_LIFTED_BOTTOM =
  "calc(env(safe-area-inset-bottom, 0px) + 9.6rem)";
