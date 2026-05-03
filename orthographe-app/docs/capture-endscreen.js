#!/usr/bin/env node
/**
 * Captures EndScreen screenshots via debug fixtures.
 * Usage: BASE_URL=http://localhost:5173 node docs/capture-endscreen.js
 */
import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, 'screenshots');
const BASE = process.env.BASE_URL || 'http://localhost:5173';

const CASES = [
  'perfect-3',
  'good-10',
  'errors-10',
  'no-character-perfect',
  'no-character-fail',
  'level-progress',
  'no-objective',
];

async function main() {
  console.log(`\nCapturing EndScreen screenshots from ${BASE}\n`);
  const browser = await chromium.launch();

  for (const caseName of CASES) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();

    await page.goto(`${BASE}/debug/end-screen?case=${caseName}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500); // debugSkipAnimations = instant, just wait for render

    // Verify EndScreen rendered
    const hasContent = await page.locator('text=Session terminée').count();
    if (hasContent > 0) {
      // Full viewport screenshot
      await page.screenshot({ path: join(DIR, `end-screen-${caseName}.png`), fullPage: false });
      console.log(`  📸 end-screen-${caseName}.png`);

      // Scroll to see coins/recap
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(200);
      await page.screenshot({ path: join(DIR, `end-screen-${caseName}-coins.png`), fullPage: false });
      console.log(`  📸 end-screen-${caseName}-coins.png`);
    } else {
      console.log(`  ⚠️  ${caseName}: EndScreen not rendered`);
    }

    await ctx.close();
  }

  await browser.close();

  // Also create aliases for the doc references (fin-score, fin-pieces, fin-recap)
  const { copyFileSync } = await import('fs');
  try {
    copyFileSync(join(DIR, 'end-screen-perfect-3.png'), join(DIR, 'fin-score.png'));
    copyFileSync(join(DIR, 'end-screen-good-10-coins.png'), join(DIR, 'fin-pieces.png'));
    copyFileSync(join(DIR, 'end-screen-errors-10-coins.png'), join(DIR, 'fin-recap.png'));
    console.log('\n  Aliases created: fin-score.png, fin-pieces.png, fin-recap.png');
  } catch {}

  console.log(`\n✅ Done!\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
