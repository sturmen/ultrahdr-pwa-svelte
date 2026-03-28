export const MOBILE_INFERENCE_ACKNOWLEDGEMENT =
  'I will also try Chrome on Windows or macOS';

type CapabilityLike = {
  userAgent?: string;
  isAndroid?: boolean;
  isIOS?: boolean;
};

export function isSupportedDesktopChromeBrowser(
  inputCapabilities: CapabilityLike | null | undefined,
): boolean {
  const userAgent = String(inputCapabilities?.userAgent || '').toLowerCase();
  const isMobileOs = inputCapabilities?.isAndroid || inputCapabilities?.isIOS;
  const isDesktopPlatform =
    !isMobileOs &&
    !/android|iphone|ipad|ipod|mobile/.test(userAgent);
  const isChromeOrChromium =
    userAgent.includes('chromium') || userAgent.includes('chrome/');
  const isExcludedChromiumVariant =
    userAgent.includes('edg/') ||
    userAgent.includes('edgios') ||
    userAgent.includes('opr/') ||
    userAgent.includes('opera');

  return isDesktopPlatform && isChromeOrChromium && !isExcludedChromiumVariant;
}

export function isMobileInferenceAcknowledgementValid(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    value.trim().toLowerCase() ===
      MOBILE_INFERENCE_ACKNOWLEDGEMENT.toLowerCase()
  );
}
