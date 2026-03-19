import { canvasToBlob, imageDataToDrawable, transformImageData } from '../image-utils.js';
import type { ImageDataLike } from '../image-utils.js';

type Assert<T extends true> = T;
type IsAssignable<From, To> = From extends To ? true : false;

type TransformArguments = Parameters<typeof transformImageData>;
type TransformReturn = ReturnType<typeof transformImageData>;
type DrawableArguments = Parameters<typeof imageDataToDrawable>;
type DrawableReturn = ReturnType<typeof imageDataToDrawable>;
type BlobArguments = Parameters<typeof canvasToBlob>;
type BlobReturn = ReturnType<typeof canvasToBlob>;

type _transformAcceptsImageDataLike = Assert<IsAssignable<ImageDataLike, TransformArguments[0]>>;
type _transformReturnsImageDataPromise = Assert<IsAssignable<TransformReturn, Promise<ImageData>>>;
type _drawableAcceptsImageDataLike = Assert<IsAssignable<ImageDataLike, DrawableArguments[0]>>;
type _drawableReturnsCanvasImageSourcePromise = Assert<IsAssignable<DrawableReturn, Promise<CanvasImageSource>>>;
type _blobAcceptsOffscreenCanvas = Assert<IsAssignable<OffscreenCanvas, BlobArguments[0]>>;
type _blobReturnsBlobPromise = Assert<IsAssignable<BlobReturn, Promise<Blob>>>;

export {};
