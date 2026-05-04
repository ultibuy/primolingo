/**
 * Generates PWA icons from favicon.svg using Playwright.
 * Run: node scripts/gen-pwa-icons.mjs
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

const svgSrc = readFileSync(join(root, 'public/favicon.svg'), 'utf-8');

// Regular icon SVG — square background (no rx), full content
const regularSvg = svgSrc.replace('rx="22.37"', 'rx="0"');

// Maskable icon SVG — square background (full bleed), content scaled to 80% safe zone.
// All gradients from the source SVG are preserved in <defs> so flames and rocket window render correctly.
const maskableSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bggrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#1e1e2e"/>
      <stop offset="0.5" stop-color="#2d2b55"/>
      <stop offset="1" stop-color="#1a1a2e"/>
    </linearGradient>
    <linearGradient id="rgrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#c4b5fd"/>
      <stop offset="1" stop-color="#a78bfa"/>
    </linearGradient>
    <linearGradient id="fgrad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fbbf24"/>
      <stop offset="1" stop-color="#fb923c"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#bggrad)"/>
  <g transform="translate(10 10) scale(0.8)">
    ${svgSrc
      .replace(/<svg[^>]*>/, '')
      .replace(/<\/svg>/, '')
      .replace(/<defs>[\s\S]*?<\/defs>/, '')
      .replace(/<rect[^/]*(fill="url\(#bggrad\)")[^/]*\/>/, '')}
  </g>
</svg>`;

async function render(svgString, size, outPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`
    <!doctype html><html><head>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{width:${size}px;height:${size}px;overflow:hidden}</style>
    </head><body>
    <img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}"
         width="${size}" height="${size}" style="display:block"/>
    </body></html>
  `);
  await page.waitForLoadState('networkidle');
  const buf = await page.screenshot({ clip: { x: 0, y: 0, width: size, height: size } });
  writeFileSync(outPath, buf);
  await browser.close();
  console.log(`✓ ${outPath} (${size}×${size})`);
}

await render(regularSvg,  192, join(root, 'public/icons/icon-192.png'));
await render(regularSvg,  512, join(root, 'public/icons/icon-512.png'));
await render(maskableSvg, 512, join(root, 'public/icons/icon-512-maskable.png'));

console.log('Done.');
