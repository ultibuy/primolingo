#!/usr/bin/env node
/**
 * Captures Shop + Reward popup screenshots via debug routes.
 * Usage: BASE_URL=http://localhost:5173 node docs/capture-shop-rewards.js
 */
import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, 'screenshots');
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const MOBILE = { width: 390, height: 844 };

async function main() {
  console.log(`\nCapturing Shop + Reward screenshots from ${BASE}\n`);
  const browser = await chromium.launch();

  // ── Shop tabs ──
  for (const tab of ['cosmetique', 'boost', 'persos', 'mystere']) {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/debug/shop?tab=${tab}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(DIR, `shop-${tab}.png`), fullPage: true });
    console.log(`  📸 shop-${tab}.png`);
    await ctx.close();
  }

  // Create aliases for doc references
  try {
    copyFileSync(join(DIR, 'shop-cosmetique.png'), join(DIR, 'boutique-cosmetique.png'));
    copyFileSync(join(DIR, 'shop-boost.png'), join(DIR, 'boutique-boost.png'));
    copyFileSync(join(DIR, 'shop-persos.png'), join(DIR, 'persos-liste.png'));
    copyFileSync(join(DIR, 'shop-mystere.png'), join(DIR, 'mystere-grille.png'));
    console.log('  Aliases: boutique-cosmetique, boutique-boost, persos-liste, mystere-grille');
  } catch {}

  // ── Reward popups ──
  const rewards = ['bronze', 'argent', 'couronne', 'diamant', 'streak-7', 'streak-30',
    'shield-used', 'streak-lost', 'diamond-review', 'diamond-broken'];
  for (const caseName of rewards) {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/debug/reward?case=${caseName}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await page.screenshot({ path: join(DIR, `reward-${caseName}.png`), fullPage: false });
    console.log(`  📸 reward-${caseName}.png`);
    await ctx.close();
  }

  // Create aliases for doc references
  try {
    copyFileSync(join(DIR, 'reward-argent.png'), join(DIR, 'popup-niveau.png'));
    copyFileSync(join(DIR, 'reward-couronne.png'), join(DIR, 'popup-couronne.png'));
    copyFileSync(join(DIR, 'reward-diamant.png'), join(DIR, 'popup-diamant.png'));
    console.log('  Aliases: popup-niveau, popup-couronne, popup-diamant');
  } catch {}

  await browser.close();
  console.log(`\n✅ Done!\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
