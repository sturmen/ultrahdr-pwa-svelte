import { transformImageData } from '../image-utils.js';
import type { ImageDataLike } from '../image-utils.js';

type Assert<T extends true> = T;
type IsAssignable<From, To> = From extends To ? true : false;

type TransformArguments = Parameters<typeof transformImageData>;
type TransformReturn = ReturnType<typeof transformImageData>;

type _transformAcceptsImageDataLike = Assert<IsAssignable<ImageDataLike, TransformArguments[0]>>;
type _transformReturnsImageDataPromise = Assert<IsAssignable<TransformReturn, Promise<ImageData>>>;

export {};
