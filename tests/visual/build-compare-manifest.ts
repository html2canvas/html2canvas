/**
 * build-compare-manifest.ts
 *
 * Scans the reftests.spec.ts-snapshots/ directory and produces
 * snapshot-manifest.json consumed by compare.html.
 *
 * Usage: ts-node tests/visual/build-compare-manifest.ts
 *        (or via: npm run build:compare)
 */

import fs from 'fs';
import path from 'path';

const SNAP_DIR = path.resolve(__dirname, 'reftests.spec.ts-snapshots');
const OUT_FILE = path.resolve(__dirname, 'snapshot-manifest.json');
const PLATFORM = 'linux';
const BROWSERS = ['chromium', 'firefox', 'webkit'];

// Collect test names from the chromium snapshots (always the baseline)
const suffix = `-chromium-${PLATFORM}.png`;
const names = fs
    .readdirSync(SNAP_DIR)
    .filter(f => f.endsWith(suffix))
    .map(f => f.slice(0, -suffix.length))
    .sort();

fs.writeFileSync(OUT_FILE, JSON.stringify(names, null, 2) + '\n');

console.log(`✔ snapshot-manifest.json — ${names.length} tests`);
console.log(`  Browsers checked: ${BROWSERS.join(', ')}`);
