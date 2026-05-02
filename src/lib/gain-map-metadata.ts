import { DEFAULT_MAX_CONTENT_BOOST } from './max-content-boost.js';

type Triple = [number, number, number];

export interface GainMapMetadata {
  gainMapMin: number[];
  gainMapMax: number[];
  gamma: number[];
  offsetSdr: number[];
  offsetHdr: number[];
  hdrCapacityMin: number;
  hdrCapacityMax: number;
  parsedGainMapMin?: number[];
  parsedGainMapMax?: number[];
  parsedGamma?: number[];
  parsedOffsetSdr?: number[];
  parsedOffsetHdr?: number[];
  parsedHdrCapacityMin?: number;
  parsedHdrCapacityMax?: number;
}

type NumericReadResult =
  | { present: false; value: null }
  | { present: true; value: number | null };

type TripleReadResult =
  | { present: false; value: null }
  | { present: true; value: Triple | null };

function decodeLatin1(bytes: Uint8Array): string {
  if (!(bytes instanceof Uint8Array)) {
    return '';
  }
  try {
    return new TextDecoder('latin1').decode(bytes);
  } catch {
    let text = '';
    for (let i = 0; i < bytes.length; i += 1) {
      text += String.fromCharCode(bytes[i] ?? 0);
    }
    return text;
  }
}

function toTriple(value: number): Triple {
  return [value, value, value];
}

function normalizeTripleValues(values: number[]): Triple | null {
  if (values.length === 1) {
    return toTriple(values[0] as number);
  }
  if (values.length >= 3) {
    return [values[0] as number, values[1] as number, values[2] as number];
  }
  return null;
}

function exp2(value: number): number {
  return 2 ** value;
}

function exp2Triple(values: Triple): Triple {
  return [exp2(values[0]), exp2(values[1]), exp2(values[2])];
}

function allFinite(values: readonly number[]): boolean {
  return values.every((value) => Number.isFinite(value));
}

function isValidLinearMetadata(metadata: GainMapMetadata): boolean {
  if (
    !allFinite([
      ...metadata.gainMapMin,
      ...metadata.gainMapMax,
      ...metadata.gamma,
      ...metadata.offsetSdr,
      ...metadata.offsetHdr,
      metadata.hdrCapacityMin,
      metadata.hdrCapacityMax,
    ])
  ) {
    return false;
  }

  for (let index = 0; index < 3; index += 1) {
    if (metadata.gainMapMin[index] <= 0) {
      return false;
    }
    if (metadata.gainMapMax[index] < metadata.gainMapMin[index]) {
      return false;
    }
    if (metadata.gamma[index] <= 0) {
      return false;
    }
    if (metadata.offsetSdr[index] < 0 || metadata.offsetHdr[index] < 0) {
      return false;
    }
  }

  return metadata.hdrCapacityMin >= 1 && metadata.hdrCapacityMax > metadata.hdrCapacityMin;
}

export function buildGainMapMetadata(maxContentBoost = DEFAULT_MAX_CONTENT_BOOST): GainMapMetadata {
  const safeMaxContentBoost = Number.isFinite(maxContentBoost) && maxContentBoost > 0
    ? maxContentBoost
    : DEFAULT_MAX_CONTENT_BOOST;
  const normalizedMaxContentBoost = Math.max(1.0, safeMaxContentBoost);
  const log2MaxBoost = Math.log2(normalizedMaxContentBoost);
  const gamma = 1.0;
  const offsetSdr = 0.0;

  return {
    gainMapMin: [1.0, 1.0, 1.0],
    gainMapMax: toTriple(normalizedMaxContentBoost),
    gamma: toTriple(gamma),
    offsetSdr: toTriple(offsetSdr),
    offsetHdr: [0, 0, 0],
    hdrCapacityMin: 1.0,
    hdrCapacityMax: normalizedMaxContentBoost,
    parsedGainMapMin: [0, 0, 0],
    parsedGainMapMax: toTriple(log2MaxBoost),
    parsedGamma: toTriple(gamma),
    parsedOffsetSdr: toTriple(offsetSdr),
    parsedOffsetHdr: [0, 0, 0],
    parsedHdrCapacityMin: 0,
    parsedHdrCapacityMax: log2MaxBoost,
  };
}

function readScalarAttribute(decoded: string, name: string): NumericReadResult {
  const regex = new RegExp(`hdrgm:${name}=["']([^"']+)["']`, 'i');
  const match = decoded.match(regex);
  if (!match) {
    return { present: false, value: null };
  }

  const parsed = Number(match[1]);
  return {
    present: true,
    value: Number.isFinite(parsed) ? parsed : null,
  };
}

function readTripleSequence(decoded: string, name: string): TripleReadResult {
  const sectionRegex = new RegExp(
    `<hdrgm:${name}>[\\s\\S]*?<rdf:Seq>([\\s\\S]*?)<\\/rdf:Seq>[\\s\\S]*?<\\/hdrgm:${name}>`,
    'i',
  );
  const sectionMatch = decoded.match(sectionRegex);
  if (!sectionMatch) {
    return { present: false, value: null };
  }

  const section = sectionMatch[1] ?? '';
  const liMatches = Array.from(
    section.matchAll(/<rdf:li>\s*([^<]+?)\s*<\/rdf:li>/gi),
  );
  const values = liMatches.map((entry) => Number(entry[1]));
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    return { present: true, value: null };
  }

  return {
    present: true,
    value: normalizeTripleValues(values),
  };
}

function readTripleField(decoded: string, name: string): TripleReadResult {
  const sequence = readTripleSequence(decoded, name);
  if (sequence.present) {
    return sequence;
  }

  const scalar = readScalarAttribute(decoded, name);
  if (!scalar.present) {
    return { present: false, value: null };
  }

  return {
    present: true,
    value: scalar.value === null ? null : toTriple(scalar.value),
  };
}

function applyLog2TripleField(
  decoded: string,
  name: string,
  apply: (linear: Triple, parsed: Triple) => void,
): boolean {
  const result = readTripleField(decoded, name);
  if (!result.present) {
    return true;
  }
  if (result.value === null) {
    return false;
  }
  apply(exp2Triple(result.value), result.value);
  return true;
}

function applyDirectTripleField(
  decoded: string,
  name: string,
  apply: (value: Triple) => void,
): boolean {
  const result = readTripleField(decoded, name);
  if (!result.present) {
    return true;
  }
  if (result.value === null) {
    return false;
  }
  apply(result.value);
  return true;
}

function applyLog2ScalarField(
  decoded: string,
  name: string,
  apply: (linear: number, parsed: number) => void,
): boolean {
  const result = readScalarAttribute(decoded, name);
  if (!result.present) {
    return true;
  }
  if (result.value === null) {
    return false;
  }
  apply(exp2(result.value), result.value);
  return true;
}

export function parseHdrGainMapMetadataFromText(decoded: string): GainMapMetadata | null {
  const hasHdrGainMapMarkers = decoded
    && (
      decoded.includes('hdrgm:Version')
      || decoded.includes('<hdrgm:GainMapMin>')
      || decoded.includes('<hdrgm:GainMapMax>')
      || decoded.includes('hdrgm:GainMapMin=')
      || decoded.includes('hdrgm:GainMapMax=')
      || decoded.includes('hdrgm:HDRCapacityMax=')
    );
  if (!hasHdrGainMapMarkers) {
    return null;
  }

  const fallback = buildGainMapMetadata(DEFAULT_MAX_CONTENT_BOOST);
  const metadata: GainMapMetadata = {
    ...fallback,
    gainMapMin: [...fallback.gainMapMin],
    gainMapMax: [...fallback.gainMapMax],
    gamma: [...fallback.gamma],
    offsetSdr: [...fallback.offsetSdr],
    offsetHdr: [...fallback.offsetHdr],
    parsedGainMapMin: fallback.parsedGainMapMin ? [...fallback.parsedGainMapMin] : undefined,
    parsedGainMapMax: fallback.parsedGainMapMax ? [...fallback.parsedGainMapMax] : undefined,
    parsedGamma: fallback.parsedGamma ? [...fallback.parsedGamma] : undefined,
    parsedOffsetSdr: fallback.parsedOffsetSdr ? [...fallback.parsedOffsetSdr] : undefined,
    parsedOffsetHdr: fallback.parsedOffsetHdr ? [...fallback.parsedOffsetHdr] : undefined,
  };

  let parsedGainMapMaxFromSource = false;
  const parsedSuccessfully = [
    applyLog2TripleField(decoded, 'GainMapMin', (linear, parsed) => {
      metadata.gainMapMin = linear;
      metadata.parsedGainMapMin = parsed;
    }),
    applyLog2TripleField(decoded, 'GainMapMax', (linear, parsed) => {
      metadata.gainMapMax = linear;
      metadata.parsedGainMapMax = parsed;
      parsedGainMapMaxFromSource = true;
    }),
    applyDirectTripleField(decoded, 'Gamma', (value) => {
      metadata.gamma = value;
      metadata.parsedGamma = value;
    }),
    applyDirectTripleField(decoded, 'OffsetSDR', (value) => {
      metadata.offsetSdr = value;
      metadata.parsedOffsetSdr = value;
    }),
    applyDirectTripleField(decoded, 'OffsetHDR', (value) => {
      metadata.offsetHdr = value;
      metadata.parsedOffsetHdr = value;
    }),
    applyLog2ScalarField(decoded, 'HDRCapacityMin', (linear, parsed) => {
      metadata.hdrCapacityMin = linear;
      metadata.parsedHdrCapacityMin = parsed;
    }),
    applyLog2ScalarField(decoded, 'HDRCapacityMax', (linear, parsed) => {
      metadata.hdrCapacityMax = linear;
      metadata.parsedHdrCapacityMax = parsed;
      if (!parsedGainMapMaxFromSource) {
        metadata.gainMapMax = toTriple(linear);
        metadata.parsedGainMapMax = toTriple(parsed);
      }
    }),
  ].every(Boolean);

  if (!parsedSuccessfully || !isValidLinearMetadata(metadata)) {
    return null;
  }

  return metadata;
}

export function parseHdrGainMapMetadataFromBuffer(fileBuffer: Uint8Array): GainMapMetadata | null {
  return parseHdrGainMapMetadataFromText(decodeLatin1(fileBuffer));
}

export function extractHdrGainMapHeadroomFromBuffer(fileBuffer: Uint8Array): number | null {
  const decoded = decodeLatin1(fileBuffer);
  if (!decoded) {
    return null;
  }

  const match = decoded.match(/<HDRGainMap:HDRGainMapHeadroom>\s*([0-9.+\-eE]+)\s*<\/HDRGainMap:HDRGainMapHeadroom>/i)
    || decoded.match(/HDRGainMapHeadroom="([0-9.+\-eE]+)"/i);

  if (!match) {
    return null;
  }

  const headroom = Number.parseFloat(match[1] as string);
  if (!Number.isFinite(headroom) || headroom <= 0) {
    return null;
  }

  return headroom;
}
