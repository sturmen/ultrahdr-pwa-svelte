/**
 * Detach an ArrayBuffer so its bytes become eligible for GC immediately,
 * even if the view object owning it (e.g. a DOM ImageData) has readonly
 * properties. Uses ArrayBuffer.prototype.transfer when present, then
 * structuredClone-with-transfer, then zero-fill as a last resort.
 */
export function detachArrayBuffer(buffer: ArrayBufferLike | null | undefined): void {
  if (!buffer || buffer.byteLength === 0) {
    return;
  }
  const anyBuffer = buffer as ArrayBuffer & { transfer?: () => ArrayBuffer };
  if (typeof anyBuffer.transfer === 'function') {
    try {
      anyBuffer.transfer();
      return;
    } catch {
      // Fall through to structuredClone path.
    }
  }
  try {
    structuredClone(anyBuffer, { transfer: [anyBuffer] });
    return;
  } catch {
    // Last resort: zero the bytes. Does not free memory but scrubs content.
    try {
      new Uint8Array(anyBuffer).fill(0);
    } catch {
      // Buffer already detached or otherwise unusable — nothing more to do.
    }
  }
}
