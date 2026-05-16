import type {
  HdrIntentHeifResult,
  HdrIntentJpegResult,
  HdrIntentResult,
  PreservedHeifResult,
} from './processing-types.ts';

export function isHdrIntentHeifResult(input: unknown): input is HdrIntentHeifResult {
  return !!input
    && typeof input === 'object'
    && 'kind' in input
    && input.kind === 'hdr-intent-heif'
    && 'hdrIntent' in input;
}

export function isHdrIntentJpegResult(input: unknown): input is HdrIntentJpegResult {
  return !!input
    && typeof input === 'object'
    && 'kind' in input
    && input.kind === 'hdr-intent-jpeg'
    && 'hdrIntent' in input;
}

export function isHdrIntentResult(input: unknown): input is HdrIntentResult {
  return isHdrIntentHeifResult(input) || isHdrIntentJpegResult(input);
}

export function isPreservedHeifResult(input: unknown): input is PreservedHeifResult {
  return !!input
    && typeof input === 'object'
    && 'sdr' in input
    && 'gainMap' in input;
}
