import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('build-wasm warning suppression', () => {
  it('suppresses CMake developer warnings for all wasm configure steps', () => {
    const buildWasmScript = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/build-wasm.js'),
      'utf8',
    );
    const buildJpegliScript = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/build-jpegli-wasm.js'),
      'utf8',
    );
    const buildJpegtranScript = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/build-jpegtran-wasm.js'),
      'utf8',
    );

    expect(buildWasmScript).toMatch(/emcmake cmake -Wno-dev/);
    expect(buildJpegliScript).toMatch(/emcmake cmake -Wno-dev/);
    expect(buildJpegtranScript).toMatch(/emcmake cmake -Wno-dev/);
  });

  it('avoids parallel make jobserver warnings in the ultrahdr wasm build', () => {
    const buildWasmScript = fs.readFileSync(
      path.resolve(process.cwd(), 'scripts/build-wasm.js'),
      'utf8',
    );

    expect(buildWasmScript).toMatch(/emmake make -j1/);
  });
});
