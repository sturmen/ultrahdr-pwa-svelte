import * as UTIFNamespace from '../../third_party/UTIF.js/UTIF.js';

const runtimeGlobal = typeof globalThis !== 'undefined' ? globalThis : undefined;
const runtimeSelf = runtimeGlobal?.self;
const namespaceLookup =
  UTIFNamespace && typeof UTIFNamespace === 'object'
    ? (key) => UTIFNamespace[key]
    : () => undefined;

function isUtifApi(candidate) {
  return Boolean(
    candidate &&
      typeof candidate.decode === 'function' &&
      typeof candidate.decodeImage === 'function' &&
      typeof candidate.toRGBA8 === 'function'
  );
}

function resolveUtifFromNamespace(namespaceObject) {
  if (!namespaceObject || typeof namespaceObject !== 'object') {
    return null;
  }

  const directCandidates = [
    namespaceLookup('default'),
    namespaceLookup('module.exports'),
    namespaceLookup('UTIF'),
    namespaceObject,
  ];

  for (const candidate of directCandidates) {
    if (isUtifApi(candidate)) {
      return candidate;
    }
  }

  for (const value of Object.values(namespaceObject)) {
    if (isUtifApi(value)) {
      return value;
    }
  }

  return null;
}

const UTIF =
  resolveUtifFromNamespace(UTIFNamespace) ||
  (isUtifApi(runtimeGlobal?.UTIF) ? runtimeGlobal.UTIF : null) ||
  (isUtifApi(runtimeSelf?.UTIF) ? runtimeSelf.UTIF : null);

if (!isUtifApi(UTIF)) {
  throw new Error('Vendored UTIF.js export does not expose expected decode APIs');
}

const utifAdapter = {
  decode: (...args) => UTIF.decode(...args),
  decodeImage: (...args) => UTIF.decodeImage(...args),
  toRGBA8: (...args) => UTIF.toRGBA8(...args),
};

export default utifAdapter;
