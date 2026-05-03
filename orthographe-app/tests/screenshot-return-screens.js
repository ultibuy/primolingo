/**
 * screenshot-return-screens.js
 *
 * Captures mobile screenshots of the ReturnScreen (retour après absence) :
 *   - retour-absence-intro.png    : step intro "Retour après une pause"
 *   - retour-absence-bouclier.png : step "Flamme en danger" with shield proposal
 *
 * Usage: node tests/screenshot-return-screens.js
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
const CHILD_ID  = 'local-child-return';
const PROGRESS_KEY = `local:progress:${DEBUG_UID}:${CHILD_ID}`;
const CHILDREN_KEY = `local:children:${DEBUG_UID}`;
const MOBILE = { width: 390, height: 844 };

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function localDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function makeProgressWithShield() {
  // lastActiveDate 2 days ago → daysMissed = 1 → streakSaveable with 1 shield
  return {
    userId: 'local',
    coins: 300,
    shields: 1,
    streak: {
      current: 7,
      longest: 12,
      lastActiveDate: localDateStr(-2),
    },
    milestones: { firstSession: true },
    rules: {
      'a-a-as': {
        level: 1,
        guidedSessionsCompleted: 3,
        guidedSessionsAbove80: 3,
        guidedBestScore: 90,
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
  const progress = makeProgressWithShield();
  await page.evaluate(({ progressKey, childrenKey, childId, prog }) => {
    localStorage.setItem(progressKey, JSON.stringify(prog));
    localStorage.setItem(childrenKey, JSON.stringify([
      { id: childId, name: 'Damien', avatar: '🐼', createdAt: '2026-01-01' },
    ]));
  }, { progressKey: PROGRESS_KEY, childrenKey: CHILDREN_KEY, childId: CHILD_ID, prog: progress });

  // Navigate to child app
  await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
  try {
    await page.waitForFunction(() => !document.body.innerText.includes('Chargement'), undefined, { timeout: 10000 });
  } catch (_) {}
  await delay(800);

  // Step 1 — Intro ("Retour après une pause")
  const introVisible = await page.evaluate(() => {
    const els = document.querySelectorAll('h2');
    for (const el of els) {
      if (el.textContent.includes('Retour après')) return true;
    }
    return false;
  });

  if (!introVisible) {
    console.warn('WARNING: ReturnScreen intro not visible — check progress/date setup');
    await browser.close();
    return;
  }

  const introPath = join(SCREENSHOTS_DIR, 'retour-absence-intro.png');
  await page.screenshot({ path: introPath, fullPage: false });
  console.log(`✓ Saved ${introPath}`);

  // Click "Continuer" to advance to shield step
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.textContent.trim() === 'Continuer') { btn.click(); return; }
    }
  });
  await delay(600);

  // Step 2 — Shield proposal ("Flamme en danger")
  const shieldVisible = await page.evaluate(() => {
    const els = document.querySelectorAll('h2');
    for (const el of els) {
      if (el.textContent.includes('Flamme en danger')) return true;
    }
    return false;
  });

  if (!shieldVisible) {
    console.warn('WARNING: Shield step not visible');
  } else {
    const shieldPath = join(SCREENSHOTS_DIR, 'retour-absence-bouclier.png');
    await page.screenshot({ path: shieldPath, fullPage: false });
    console.log(`✓ Saved ${shieldPath}`);
  }

  await browser.close();
  console.log('Done.');
}

run().catch((err) => { console.error(err); process.exit(1); });
