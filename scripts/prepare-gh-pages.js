#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function ensureNoJekyllFile({
  rootDirectory = rootDir,
  distDirectory = path.join(rootDirectory, 'dist'),
} = {}) {
  if (!fs.existsSync(distDirectory)) {
    throw new Error(`dist directory not found at ${distDirectory}. Run \`npm run build\` first.`);
  }

  const noJekyllPath = path.join(distDirectory, '.nojekyll');
  if (!fs.existsSync(noJekyllPath)) {
    fs.writeFileSync(
      noJekyllPath,
      '# Disable Jekyll so GitHub Pages serves files that start with underscores.\n',
      'utf8',
    );
  }

  return noJekyllPath;
}

function main() {
  try {
    const noJekyllPath = ensureNoJekyllFile();
    console.log(`Prepared GitHub Pages output: ${noJekyllPath}`);
  } catch (error) {
    console.error('\nERROR:', error.message);
    process.exit(1);
  }
}

const isDirectExecution = process.argv[1]
  && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectExecution) {
  main();
}
