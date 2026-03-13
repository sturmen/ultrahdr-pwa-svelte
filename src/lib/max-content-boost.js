export const MIN_MAX_CONTENT_BOOST_STOPS = 0;
export const MAX_MAX_CONTENT_BOOST_STOPS = 5;
export const DEFAULT_MAX_CONTENT_BOOST_STOPS = 3;
export const MAX_CONTENT_BOOST_STEP = 0.1;

export const MAX_CONTENT_BOOST_STOPS_RANGE = Object.freeze({
  min: MIN_MAX_CONTENT_BOOST_STOPS,
  max: MAX_MAX_CONTENT_BOOST_STOPS,
  step: MAX_CONTENT_BOOST_STEP,
});

export function clampMaxContentBoostStops(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_MAX_CONTENT_BOOST_STOPS;
  }
  return Math.max(
    MIN_MAX_CONTENT_BOOST_STOPS,
    Math.min(MAX_MAX_CONTENT_BOOST_STOPS, numeric),
  );
}

export function convertStopsToMaxContentBoost(stops) {
  return 2 ** clampMaxContentBoostStops(stops);
}

export const DEFAULT_MAX_CONTENT_BOOST = convertStopsToMaxContentBoost(
  DEFAULT_MAX_CONTENT_BOOST_STOPS,
);
