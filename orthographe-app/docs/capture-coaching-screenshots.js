#!/usr/bin/env node
/**
 * Captures screenshots of all coaching messages by rendering MotivationBanner
 * in isolation via a special /docs/coaching-preview route.
 *
 * Usage:
 *   BASE_URL=http://localhost:5173 node docs/capture-coaching-screenshots.js
 */
import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
const BASE = process.env.BASE_URL || 'http://localhost:5173';

// Load coaching messages
const messages = JSON.parse(
  readFileSync(join(__dirname, 'coaching-messages.json'), 'utf-8')
);

const MOBILE = { width: 390, height: 200 }; // Short viewport for banner-only capture

async function main() {
  console.log(`\nCapturing ${messages.length} coaching message screenshots...\n`);
  const browser = await chromium.launch();

  // We'll render each message by navigating to a special preview page
  // that the docs plugin serves at /docs/coaching-preview?idx=N
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const ctx = await browser.newContext({ viewport: MOBILE });
    const page = await ctx.newPage();

    try {
      await page.goto(`${BASE}/docs/coaching-preview?idx=${i}`, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(600); // wait for banner animation
      const path = join(SCREENSHOTS_DIR, `coaching-${msg.arcId}.png`);
      await page.screenshot({ path, fullPage: false });
      console.log(`  📸 coaching-${msg.arcId}.png — ${msg.message.slice(0, 60)}...`);
    } catch (err) {
      console.log(`  ⚠️  ${msg.arcId} failed: ${err.message.slice(0, 80)}`);
    }

    await page.close();
    await ctx.close();
  }

  await browser.close();
  console.log(`\n✅ Done!\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
