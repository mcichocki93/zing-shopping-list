/**
 * Generates app icons for Zing from SVG source.
 * Run: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, '..', 'assets');

// ─── SVG designs ──────────────────────────────────────────────────────────────

// Main icon — green bg + white shopping bag + green checkmark
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Green background -->
  <rect width="1024" height="1024" fill="#4CAF50"/>

  <!-- Shopping bag body (white, rounded) -->
  <rect x="248" y="400" width="528" height="420" rx="36" ry="36" fill="white"/>

  <!-- Bag handle -->
  <path d="M370 400 L370 300 Q370 200 512 200 Q654 200 654 300 L654 400"
        fill="none" stroke="white" stroke-width="56" stroke-linecap="round"
        stroke-linejoin="round"/>

  <!-- Checkmark (dark green) -->
  <path d="M360 600 L460 710 L680 470"
        fill="none" stroke="#2E7D32" stroke-width="72"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Adaptive icon foreground — same design, transparent background
// Android clips it to a circle/squircle and adds bg from app.json
const adaptiveSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Green circle (visible area is ~66% centre) -->
  <circle cx="512" cy="512" r="440" fill="#4CAF50"/>

  <!-- Shopping bag body -->
  <rect x="268" y="420" width="488" height="390" rx="32" ry="32" fill="white"/>

  <!-- Bag handle -->
  <path d="M385 420 L385 325 Q385 215 512 215 Q639 215 639 325 L639 420"
        fill="none" stroke="white" stroke-width="52" stroke-linecap="round"
        stroke-linejoin="round"/>

  <!-- Checkmark -->
  <path d="M372 608 L466 716 L668 480"
        fill="none" stroke="#2E7D32" stroke-width="68"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Splash icon — bigger, centred on white (used with Expo splash screen)
const splashSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Green background -->
  <rect width="512" height="512" rx="80" fill="#4CAF50"/>

  <!-- Shopping bag body -->
  <rect x="120" y="198" width="272" height="218" rx="18" fill="white"/>

  <!-- Bag handle -->
  <path d="M183 198 L183 148 Q183 96 256 96 Q329 96 329 148 L329 198"
        fill="none" stroke="white" stroke-width="28" stroke-linecap="round"
        stroke-linejoin="round"/>

  <!-- Checkmark -->
  <path d="M178 298 L228 356 L342 232"
        fill="none" stroke="#2E7D32" stroke-width="36"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Favicon (very small — just the bag silhouette, no text)
const faviconSvg = `
<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" rx="8" fill="#4CAF50"/>
  <rect x="11" y="18" width="26" height="22" rx="3" fill="white"/>
  <path d="M17 18 L17 13 Q17 8 24 8 Q31 8 31 13 L31 18"
        fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <path d="M16 28 L22 34 L33 22"
        fill="none" stroke="#2E7D32" stroke-width="3.5"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// ─── Generate ─────────────────────────────────────────────────────────────────

async function generateIcon(svgString, outputPath, size) {
  await sharp(Buffer.from(svgString.trim()))
    .resize(size, size)
    .png()
    .toFile(outputPath);
  console.log(`✅  ${path.relative(process.cwd(), outputPath)} (${size}×${size})`);
}

async function main() {
  console.log('Generating Zing icons...\n');
  await generateIcon(iconSvg,     path.join(ASSETS, 'icon.png'),          1024);
  await generateIcon(adaptiveSvg, path.join(ASSETS, 'adaptive-icon.png'), 1024);
  await generateIcon(splashSvg,   path.join(ASSETS, 'splash-icon.png'),    512);
  await generateIcon(faviconSvg,  path.join(ASSETS, 'favicon.png'),         48);
  console.log('\nDone! Remember to rebuild the app to see the new icons.');
}

main().catch((err) => { console.error(err); process.exit(1); });
