export function createCanvas(width, height, errorMessage = 'Canvas not available') {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }

  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  throw new Error(errorMessage);
}

export function getCanvas2dContext(canvas, errorMessage = 'Failed to acquire 2D context') {
  const context = canvas?.getContext?.('2d');
  if (!context) {
    throw new Error(errorMessage);
  }
  return context;
}

export function createCanvasWithContext(width, height, errorMessage = 'Canvas not available') {
  const canvas = createCanvas(width, height, errorMessage);
  const ctx = getCanvas2dContext(canvas, errorMessage);
  return { canvas, ctx };
}

export async function canvasToBlob(canvas, type = 'image/png', quality = undefined) {
  if (typeof canvas?.convertToBlob === 'function') {
    return canvas.convertToBlob({ type, quality });
  }

  if (typeof canvas?.toBlob === 'function') {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error('Canvas failed to produce a Blob'));
      }, type, quality);
    });
  }

  throw new Error('Canvas blob export is not available in this environment');
}
