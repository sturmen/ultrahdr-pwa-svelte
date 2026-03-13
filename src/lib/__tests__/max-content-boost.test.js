/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';

describe('max-content-boost config', () => {
  it('defines a shared stop range and default', async () => {
    const {
      DEFAULT_MAX_CONTENT_BOOST_STOPS,
      MAX_CONTENT_BOOST_STOPS_RANGE,
      MAX_MAX_CONTENT_BOOST_STOPS,
      MIN_MAX_CONTENT_BOOST_STOPS,
    } = await import('../max-content-boost.js');

    expect(MIN_MAX_CONTENT_BOOST_STOPS).toBe(0);
    expect(MAX_MAX_CONTENT_BOOST_STOPS).toBe(5);
    expect(DEFAULT_MAX_CONTENT_BOOST_STOPS).toBe(3);
    expect(MAX_CONTENT_BOOST_STOPS_RANGE).toEqual({
      min: 0,
      max: 5,
      step: 0.1,
    });
  });

  it('converts stops to linear boost and clamps to the supported range', async () => {
    const {
      DEFAULT_MAX_CONTENT_BOOST,
      clampMaxContentBoostStops,
      convertStopsToMaxContentBoost,
    } = await import('../max-content-boost.js');

    expect(DEFAULT_MAX_CONTENT_BOOST).toBe(8);
    expect(clampMaxContentBoostStops(-1)).toBe(0);
    expect(clampMaxContentBoostStops(7)).toBe(5);
    expect(convertStopsToMaxContentBoost(0)).toBe(1);
    expect(convertStopsToMaxContentBoost(3)).toBe(8);
    expect(convertStopsToMaxContentBoost(5)).toBe(32);
    expect(convertStopsToMaxContentBoost(9)).toBe(32);
    expect(convertStopsToMaxContentBoost(Number.NaN)).toBe(8);
  });
});
