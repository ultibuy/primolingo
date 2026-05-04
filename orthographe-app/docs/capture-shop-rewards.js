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

  // ── Level info popups (LevelHelpPopup) ──
  // Each level needs a specific progress state so the LevelPath shows the right node.
  // We click on the colored circle at the known position to open the popup.
  const levelConfigs = [
    { name: 'bronze',   level: 1, x: 90, y: 458 },
    { name: 'argent',   level: 1, x: 155, y: 458 },
    { name: 'couronne', level: 2, x: 225, y: 458 },
    { name: 'diamant',  level: 4, x: 312, y: 530, needsGrammaireTab: true },
  ];

  const today = new Date().toISOString().slice(0, 10);
  const baseProgress = (lvl) => ({
    userId: 'local', coins: 500, shields: 0,
    streak: { current: 3, longest: 5, lastActiveDate: today },
    dailyActivity: { date: today, count: 1, yesterdayCount: 1, bestDaily: 1 },
    milestones: { firstSession: true },
    rules: { 'a-a-as': {
      level: lvl,
      guidedSessionsCompleted: lvl >= 1 ? 3 : 0,
      guidedSessionsAbove80: lvl >= 2 ? 3 : lvl >= 1 ? 1 : 0,
      guidedBestScore: 80,
      directSessionsCompleted: lvl >= 2 ? 3 : 0,
      directSessionsAbove80: lvl >= 3 ? 3 : 0,
      directBestScore: lvl >= 3 ? 90 : 0,
      directConsecutiveAbove90: lvl >= 4 ? 3 : 0,
    }},
    shop: { owned: [], equipped: {}, activeBoosts: {}, mysteryImages: {}, inventory: {} },
    coaching: { shown: {}, lastShownByArc: {}, dailyShownCount: { date: today, count: 99 } },
    statsHistory: [], parentalCode: null,
  });

  for (const cfg of levelConfigs) {
    const ctx = await browser.newContext({ viewport: MOBILE });
    const page = await ctx.newPage();
    await page.addInitScript(({ progress, today }) => {
      localStorage.setItem('ortho_debug', '1');
      localStorage.setItem('debug_uid', 'localhost-dev');
      localStorage.setItem('debug_child_name', 'Test');
      localStorage.setItem('local:children:localhost-dev', JSON.stringify([{ id: 'c1', name: 'Test', avatar: '', createdAt: '2026-01-01' }]));
      localStorage.setItem('local:childSettings:localhost-dev:c1', JSON.stringify({ prodQuestionCount: 20 }));
      localStorage.setItem('local:progress:localhost-dev:c1', JSON.stringify(progress));
      localStorage.setItem('ortho_first_quiz_bonus_dismissed:c1', today);
    }, { progress: baseProgress(cfg.level), today });

    await page.goto(`${BASE}/play/c1`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Some levels need the Grammaire tab (e.g. diamond at level 4 defaults to Vocabulaire)
    if (cfg.needsGrammaireTab) {
      await page.click('button:has-text("Grammaire")').catch(() => {});
      await page.waitForTimeout(1000);
    }

    // Try clicking by text label first, then fall back to coordinates
    const clickedByText = await page.evaluate((name) => {
      const divs = [...document.querySelectorAll('div')];
      const labels = { bronze: 'Bronze', argent: 'Argent', couronne: 'Couronne', diamant: 'Diamant' };
      const label = labels[name];
      for (const el of divs) {
        if (getComputedStyle(el).cursor === 'pointer' && el.textContent.trim() === label && el.getBoundingClientRect().y > 300) {
          el.click();
          return true;
        }
      }
      return false;
    }, cfg.name);
    if (!clickedByText) await page.mouse.click(cfg.x, cfg.y);
    await page.waitForTimeout(1200);

    const hasPopup = await page.evaluate(() => document.body.innerText.includes("C'est quoi"));
    if (hasPopup) {
      await page.screenshot({ path: join(DIR, `popup-${cfg.name}.png`), fullPage: false });
      console.log(`  📸 popup-${cfg.name}.png`);
    } else {
      console.log(`  ⚠️  popup-${cfg.name}: popup not found, trying nearby positions...`);
      let found = false;
      for (const [dx, dy] of [[0,0],[-5,0],[5,0],[0,-5],[0,5],[-10,0],[10,0]]) {
        await page.mouse.click(cfg.x + dx, cfg.y + dy);
        await page.waitForTimeout(800);
        if (await page.evaluate(() => document.body.innerText.includes("C'est quoi"))) {
          await page.screenshot({ path: join(DIR, `popup-${cfg.name}.png`), fullPage: false });
          console.log(`  📸 popup-${cfg.name}.png (at offset ${dx},${dy})`);
          found = true;
          break;
        }
      }
      if (!found) console.log(`  ❌ popup-${cfg.name}: could not open popup`);
    }
    await ctx.close();
  }

  await browser.close();
  console.log(`\n✅ Done!\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
