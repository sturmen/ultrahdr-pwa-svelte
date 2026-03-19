export function createCanvasWithContext(
    width: number,
    height: number,
    missingCanvasMessage: string,
): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
};

export function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob>;
