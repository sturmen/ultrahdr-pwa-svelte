import { DEFAULT_MAX_CONTENT_BOOST } from './max-content-boost.js';

function decodeLatin1(bytes) {
  if (!(bytes instanceof Uint8Array)) {
    return '';
  }
  try {
    return new TextDecoder('latin1').decode(bytes);
  } catch {
    let text = '';
    for (let i = 0; i < bytes.length; i += 1) {
      text += String.fromCharCode(bytes[i]);
    }
    return text;
  }
}

export function buildGainMapMetadata(maxContentBoost = DEFAULT_MAX_CONTENT_BOOST) {
  const safeMaxContentBoost = Number.isFinite(maxContentBoost) && maxContentBoost > 0
    ? maxContentBoost
    : DEFAULT_MAX_CONTENT_BOOST;
  const normalizedMaxContentBoost = Math.max(1.0, safeMaxContentBoost);
  const log2MaxBoost = Math.log2(normalizedMaxContentBoost);
  const gamma = 1.0;
  const offsetSdr = 0.0;

  return {
    gainMapMin: [1.0, 1.0, 1.0],
    gainMapMax: [normalizedMaxContentBoost, normalizedMaxContentBoost, normalizedMaxContentBoost],
    gamma: [gamma, gamma, gamma],
    offsetSdr: [offsetSdr, offsetSdr, offsetSdr],
    offsetHdr: [0, 0, 0],
    hdrCapacityMin: 1.0,
    hdrCapacityMax: normalizedMaxContentBoost,
    parsedGainMapMin: [0, 0, 0],
    parsedGainMapMax: [log2MaxBoost, log2MaxBoost, log2MaxBoost],
    parsedGamma: [gamma, gamma, gamma],
    parsedOffsetSdr: [offsetSdr, offsetSdr, offsetSdr],
    parsedOffsetHdr: [0, 0, 0],
    parsedHdrCapacityMin: 0,
    parsedHdrCapacityMax: log2MaxBoost,
  };
}

export function parseHdrGainMapMetadataFromText(decoded) {
  const hasHdrGainMapMarkers = decoded
    && (
      decoded.includes('hdrgm:Version')
      || decoded.includes('<hdrgm:GainMapMin>')
      || decoded.includes('<hdrgm:GainMapMax>')
      || decoded.includes('hdrgm:HDRCapacityMax=')
    );
  if (!hasHdrGainMapMarkers) {
    return null;
  }

  const fallback = buildGainMapMetadata(DEFAULT_MAX_CONTENT_BOOST);
  const readAttribute = (name) => {
    const regex = new RegExp(`hdrgm:${name}=\"([^\\\"]+)\"`, 'i');
    const match = decoded.match(regex);
    const parsed = Number(match?.[1]);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const readTripleSequence = (name) => {
    const sectionRegex = new RegExp(
      `<hdrgm:${name}>[\\s\\S]*?<rdf:Seq>([\\s\\S]*?)<\\/rdf:Seq>[\\s\\S]*?<\\/hdrgm:${name}>`,
      'i',
    );
    const section = decoded.match(sectionRegex)?.[1];
    if (!section) {
      return null;
    }
    const liMatches = Array.from(
      section.matchAll(/<rdf:li>\s*([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*<\/rdf:li>/gi),
    );
    if (liMatches.length < 3) {
      return null;
    }
    const values = liMatches.slice(0, 3).map((entry) => Number(entry[1]));
    return values.every((value) => Number.isFinite(value)) ? values : null;
  };

  const metadata = {
    ...fallback,
    gainMapMin: [...fallback.gainMapMin],
    gainMapMax: [...fallback.gainMapMax],
    gamma: [...fallback.gamma],
    offsetSdr: [...fallback.offsetSdr],
    offsetHdr: [...fallback.offsetHdr],
  };

  const parsedGainMapMin = readTripleSequence('GainMapMin');
  const parsedGainMapMax = readTripleSequence('GainMapMax');
  const parsedGamma = readTripleSequence('Gamma');
  if (parsedGainMapMin) {
    metadata.gainMapMin = parsedGainMapMin;
  }
  if (parsedGainMapMax) {
    metadata.gainMapMax = parsedGainMapMax;
  }
  if (parsedGamma) {
    metadata.gamma = parsedGamma;
  }

  const offsetSdr = readAttribute('OffsetSDR');
  const offsetHdr = readAttribute('OffsetHDR');
  if (offsetSdr !== null) {
    metadata.offsetSdr = [offsetSdr, offsetSdr, offsetSdr];
  }
  if (offsetHdr !== null) {
    metadata.offsetHdr = [offsetHdr, offsetHdr, offsetHdr];
  }

  const hdrCapacityMin = readAttribute('HDRCapacityMin');
  const hdrCapacityMax = readAttribute('HDRCapacityMax');
  if (hdrCapacityMin !== null) {
    metadata.hdrCapacityMin = hdrCapacityMin;
  }
  if (hdrCapacityMax !== null) {
    metadata.hdrCapacityMax = hdrCapacityMax;
    if (!parsedGainMapMax && hdrCapacityMax > 0) {
      metadata.gainMapMax = [hdrCapacityMax, hdrCapacityMax, hdrCapacityMax];
    }
  }

  return metadata;
}

export function parseHdrGainMapMetadataFromBuffer(fileBuffer) {
  return parseHdrGainMapMetadataFromText(decodeLatin1(fileBuffer));
}

export function extractHdrGainMapHeadroomFromBuffer(fileBuffer) {
  const decoded = decodeLatin1(fileBuffer);
  if (!decoded) {
    return null;
  }

  const match = decoded.match(/<HDRGainMap:HDRGainMapHeadroom>\s*([0-9.+\-eE]+)\s*<\/HDRGainMap:HDRGainMapHeadroom>/i)
    || decoded.match(/HDRGainMapHeadroom="([0-9.+\-eE]+)"/i);

  if (!match) {
    return null;
  }

  const headroom = Number.parseFloat(match[1]);
  if (!Number.isFinite(headroom) || headroom <= 0) {
    return null;
  }

  return headroom;
}
