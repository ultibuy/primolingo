/**
 * screenshot-level-popups.js
 *
 * Captures mobile screenshots of the 4 level help popups (Bronze, Argent, Couronne, Diamant).
 * Saves to docs/screenshots/popup-bronze.png, popup-argent.png, popup-couronne.png, popup-diamant.png
 *
 * Usage: node tests/screenshot-level-popups.js
 * Requires: dev server on http://localhost:5173
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, '../docs/screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const DEBUG_UID = 'localhost-dev';
const CHILD_ID  = 'local-child';
const PROGRESS_KEY = `local:progress:${DEBUG_UID}:${CHILD_ID}`;
const CHILDREN_KEY = `local:children:${DEBUG_UID}`;
const MOBILE = { width: 390, height: 844 };

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function makeProgress() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  return {
    userId: 'local',
    coins: 500,
    shields: 0,
    streak: { current: 3, longest: 3, lastActiveDate: todayStr },
    milestones: { firstSession: true, streak7: false, streak14: false, streak30: false, streak60: false, streak100: false },
    rules: {
      'a-a-as': {
        level: 1,
        guidedSessionsCompleted: 1,
        guidedSessionsAbove80: 0,
        guidedBestScore: 75,
      },
    },
    shop: {
      owned: ['char-panda'],
      equipped: { theme: null, flame: null, title: null, victoryAnimation: null },
      activeBoosts: { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsBonusEarned: 0, doubleCoinsLastPurchasedWeek: null },
      mysteryImages: null,
      inventory: { questionMystery: 0 },
    },
    coaching: {
      shown: {}, lastShownByArc: {},
      dailyShownCount: { date: null, count: 0 },
      lastBannerArc: null,
    },
  };
}

const LEVELS = [
  { key: 'bronze',  label: 'Bronze',   file: 'popup-bronze.png' },
  { key: 'silver',  label: 'Argent',   file: 'popup-argent.png' },
  { key: 'crown',   label: 'Couronne', file: 'popup-couronne.png' },
  { key: 'diamond', label: 'Diamant',  file: 'popup-diamant.png' },
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize(MOBILE);

  // Block analytics
  await page.route('**', (route) => {
    const url = route.request().url();
    if (url.includes('google-analytics') || url.includes('googletagmanager') || url.includes('firebaselogging')) {
      route.abort();
    } else {
      route.continue();
    }
  });

  // Seed localStorage
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ progressKey, childrenKey, childId, progress }) => {
    localStorage.setItem(progressKey, JSON.stringify(progress));
    localStorage.setItem(childrenKey, JSON.stringify([
      { id: childId, name: 'Debug', avatar: '🦊', createdAt: '2026-01-01' },
    ]));
  }, { progressKey: PROGRESS_KEY, childrenKey: CHILDREN_KEY, childId: CHILD_ID, progress: makeProgress() });

  // Navigate to child app
  await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
  try {
    await page.waitForFunction(() => !document.body.innerText.includes('Chargement'), undefined, { timeout: 10000 });
  } catch (_) {}
  await delay(800);

  for (const level of LEVELS) {
    console.log(`  Capturing ${level.file}...`);

    // Click the level node in LevelPath by finding the span with the level label
    // LevelPath renders spans with text Bronze / Argent / Couronne / Diamant inside clickable divs
    const clicked = await page.evaluate((label) => {
      // Find all spans with this exact text in a progressbar
      const progressbars = document.querySelectorAll('[role="progressbar"]');
      for (const pb of progressbars) {
        const spans = pb.querySelectorAll('span');
        for (const span of spans) {
          if (span.textContent.trim() === label) {
            // Click the parent div (the node container)
            const nodeDiv = span.parentElement;
            if (nodeDiv) { nodeDiv.click(); return true; }
          }
        }
      }
      return false;
    }, level.label);

    if (!clicked) {
      console.warn(`  WARNING: could not find node for ${level.label}`);
      continue;
    }

    // Wait for the popup to appear (look for the role=dialog)
    try {
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    } catch (_) {
      console.warn(`  WARNING: popup did not appear for ${level.label}`);
      continue;
    }
    await delay(400); // let animations settle

    // Screenshot full page in mobile
    const outPath = join(SCREENSHOTS_DIR, level.file);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`  ✓ Saved ${outPath}`);

    // Close popup by clicking outside (the backdrop)
    await page.evaluate(() => {
      const overlay = document.querySelector('[style*="position: fixed"][style*="inset: 0"]');
      if (overlay) overlay.click();
    });
    await delay(300);
  }

  await browser.close();
  console.log('Done.');
}

run().catch((err) => { console.error(err); process.exit(1); });
