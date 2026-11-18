// scripts/strip-legacy-polyfills.js
// Next.js unconditionally ships `node_modules/next/dist/build/polyfills/polyfill-module.js`
// containing Array.prototype.at, flat, flatMap, Object.fromEntries, Object.hasOwn,
// String.prototype.trimStart, and trimEnd. All of these are baseline features in all
// modern browsers since 2022. Google PageSpeed flags them as 13.5 KiB of "Legacy JavaScript".
// This script empties the file postinstall and prebuild.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const polyfillPaths = [
  path.join(root, 'node_modules/next/dist/build/polyfills/polyfill-module.js'),
  path.join(root, 'node_modules/next/dist/build/polyfills/polyfill-nomodule.js'),
];

for (const p of polyfillPaths) {
  if (fs.existsSync(p)) {
    fs.writeFileSync(p, '// modern baseline — legacy polyfills removed for PageSpeed\n', 'utf8');
    console.log(`[strip-legacy-polyfills] Emptied ${path.relative(root, p)}`);
  }
}
