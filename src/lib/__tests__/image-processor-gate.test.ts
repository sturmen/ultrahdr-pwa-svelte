import { describe, expect, it } from 'vitest';

import {
  MOBILE_INFERENCE_ACKNOWLEDGEMENT,
  isMobileInferenceAcknowledgementValid,
  isSupportedDesktopChromeBrowser,
} from '../image-processor-gate.ts';

describe('image-processor-gate', () => {
  it('recognizes desktop chrome but excludes mobile and edge/opera variants', () => {
    expect(
      isSupportedDesktopChromeBrowser({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36',
        isAndroid: false,
        isIOS: false,
      }),
    ).toBe(true);

    expect(
      isSupportedDesktopChromeBrowser({
        userAgent:
          'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/133.0.0.0 Mobile Safari/537.36',
        isAndroid: true,
        isIOS: false,
      }),
    ).toBe(false);

    expect(
      isSupportedDesktopChromeBrowser({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',
        isAndroid: false,
        isIOS: false,
      }),
    ).toBe(false);
  });

  it('matches the mobile inference acknowledgement case-insensitively', () => {
    expect(
      isMobileInferenceAcknowledgementValid(
        `  ${MOBILE_INFERENCE_ACKNOWLEDGEMENT.toUpperCase()}  `,
      ),
    ).toBe(true);
    expect(isMobileInferenceAcknowledgementValid('nope')).toBe(false);
  });
});
