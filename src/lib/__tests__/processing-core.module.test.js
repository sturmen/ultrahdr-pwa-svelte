/**
 * @vitest-environment jsdom
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('processing-core module source', () => {
  it('uses the shared gain-map metadata helper without redeclaring it locally', () => {
    const filePath = path.resolve(process.cwd(), 'src/lib/processing-core.js');
    const source = fs.readFileSync(filePath, 'utf8');

    expect(source).toMatch(/import\s*{[\s\S]*\bbuildGainMapMetadata\b[\s\S]*}\s*from '\.\/gain-map-metadata\.js';/);
    expect(source).not.toMatch(/\nfunction buildGainMapMetadata\(/);
  });
});
