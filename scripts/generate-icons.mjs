#!/usr/bin/env node
/**
 * Generate PNG icons from SVG sources using sharp-cli.
 * Also generates favicon.ico from the 32x32 PNG.
 *
 * Usage: node scripts/generate-icons.mjs
 * Requires: npx sharp-cli (available via wrangler dependency)
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '..', 'public');

const icons = [
  { src: 'og-image.svg',              out: 'og-image.png',              w: 1200, h: 630 },
  { src: 'twitter-card.svg',          out: 'twitter-card.png',          w: 1200, h: 630 },
  { src: 'apple-touch-icon.svg',      out: 'apple-touch-icon.png',      w: 180,  h: 180 },
  { src: 'favicon-32x32.svg',         out: 'favicon-32x32.png',         w: 32,   h: 32 },
  { src: 'favicon-16x16.svg',         out: 'favicon-16x16.png',         w: 16,   h: 16 },
  { src: 'android-chrome-192x192.svg',out: 'android-chrome-192x192.png',w: 192,  h: 192 },
  { src: 'android-chrome-512x512.svg',out: 'android-chrome-512x512.png',w: 512,  h: 512 },
];

let errors = 0;

for (const icon of icons) {
  const srcPath = resolve(PUBLIC, icon.src);
  const outPath = resolve(PUBLIC, icon.out);

  if (!existsSync(srcPath)) {
    console.error(`SKIP: ${icon.src} not found`);
    errors++;
    continue;
  }

  try {
    execSync(
      `npx sharp-cli -i "${srcPath}" -o "${outPath}" resize ${icon.w} ${icon.h}`,
      { stdio: 'pipe' }
    );
    console.log(`OK: ${icon.out} (${icon.w}x${icon.h})`);
  } catch (e) {
    console.error(`FAIL: ${icon.out} - ${e.message}`);
    errors++;
  }
}

// Generate favicon.ico from the 32x32 PNG
// ICO format: header (6 bytes) + entry (16 bytes) + PNG data
const favicon32 = resolve(PUBLIC, 'favicon-32x32.png');
const faviconIco = resolve(PUBLIC, 'favicon.ico');

if (existsSync(favicon32)) {
  try {
    const pngData = readFileSync(favicon32);

    // ICO header: reserved(2) + type(2, 1=ICO) + count(2)
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);      // reserved
    header.writeUInt16LE(1, 2);      // type = ICO
    header.writeUInt16LE(1, 4);      // 1 image

    // ICO directory entry (16 bytes)
    const entry = Buffer.alloc(16);
    entry.writeUInt8(32, 0);         // width (32 = 32px)
    entry.writeUInt8(32, 1);         // height
    entry.writeUInt8(0, 2);          // color palette
    entry.writeUInt8(0, 3);          // reserved
    entry.writeUInt16LE(1, 4);       // color planes
    entry.writeUInt16LE(32, 6);      // bits per pixel
    entry.writeUInt32LE(pngData.length, 8);  // image size
    entry.writeUInt32LE(22, 12);     // offset (6 header + 16 entry = 22)

    const ico = Buffer.concat([header, entry, pngData]);
    writeFileSync(faviconIco, ico);
    console.log('OK: favicon.ico (32x32, ICO with embedded PNG)');
  } catch (e) {
    console.error(`FAIL: favicon.ico - ${e.message}`);
    errors++;
  }
} else {
  console.error('SKIP: favicon.ico (favicon-32x32.png not found)');
  errors++;
}

console.log(`\nDone. ${errors ? errors + ' error(s)' : 'All icons generated successfully.'}`);
process.exit(errors ? 1 : 0);
