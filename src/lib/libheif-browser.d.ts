declare const libheifFactory: (options: {
    wasmBinary: ArrayBuffer;
    locateFile: (path: string) => string;
}) => Promise<unknown>;

export default libheifFactory;
