/**
 * progress-charts.test.js
 *
 * Visual & integration tests for ProgressCharts on the parent dashboard.
 * Runs against the local dev server (auth bypassed in DEV mode).
 *
 * Usage:
 *   node tests/progress-charts.test.js
 *   BASE_URL=http://localhost:5173 node tests/progress-charts.test.js
 *
 * Requires: npm run dev running on port 5173 (or set BASE_URL)
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const BASE_URL  = process.env.BASE_URL || 'http://localhost:5173';
const CHILD_ID  = 'charts-test-child';
const UID       = 'localhost-dev';
const PROGRESS_KEY = `local:progress:${UID}:${CHILD_ID}`;
const CHILDREN_KEY = `local:children:${UID}`;

// ── Helpers ──────────────────────────────────────────────────────────────────

let browser;
let passed = 0;
let failed = 0;
const failures = [];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function test(name, fn) {
  process.stdout.write(`  ${name} … `);
  try {
    await fn();
    console.log('✅');
    passed++;
  } catch (err) {
    console.log(`❌  ${err.message}`);
    failed++;
    failures.push(`${name}: ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function screenshot(page, name) {
  await page.screenshot({ path: join(SCREENSHOTS_DIR, `charts-${name}.png`), fullPage: false });
}

function makeStatsHistory(days, baseGTotal = 0, baseDTotal = 0) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().slice(0, 10),
      gTotal: baseGTotal + (i + 1) * 2,
      dTotal: baseDTotal + (i + 1),
      l0: Math.max(0, 17 - i),
      l1: Math.min(5, i),
      l2: Math.min(4, Math.max(0, i - 5)),
      l3: Math.min(4, Math.max(0, i - 9)),
      l4: Math.min(4, Math.max(0, i - 13)),
    };
  });
}

function makeProgress(overrides = {}) {
  return {
    userId: UID,
    createdAt: '2026-01-01',
    streak: { current: 5, longest: 10, lastActiveDate: new Date().toISOString().slice(0, 10) },
    coins: 500,
    shields: 1,
    shop: {
      owned: [],
      equipped: { theme: null, flame: null, title: null, victoryAnimation: null },
      activeBoosts: { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsLastPurchasedWeek: null },
      mysteryImages: { collections: {}, daily: { date: null, count: 0 } },
      inventory: { questionMystery: 0 },
    },
    milestones: { firstSession: true, streak7: false, streak14: false, streak30: false, streak60: false, streak100: false },
    weeklyChest: { lastOpened: null },
    firstQuizDone: true,
    pinLockout: { failedAttempts: 0, lockedUntil: 0 },
    rules: {},
    coaching: { shown: {}, lastShownByArc: {}, dailyShownCount: { date: null, count: 0 }, lastBannerArc: null },
    statsHistory: [],
    ...overrides,
  };
}

async function setChildProgress(page, progress) {
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: PROGRESS_KEY, value: progress });
}

async function setChildList(page, progress) {
  // Inject a minimal child document so the dashboard can render a card
  await page.evaluate(({ key, id, value }) => {
    localStorage.setItem(key, JSON.stringify([
      { id, name: 'TestEnfant', avatar: '🐼', createdAt: '2026-01-01', progress: value },
    ]));
  }, { key: CHILDREN_KEY, id: CHILD_ID, value: progress });
}

async function newPage(viewport = { width: 390, height: 844 }) {
  const page = await browser.newPage();
  await page.setViewportSize(viewport);
  return page;
}

async function navigateToDashboard(page, progress) {
  // Navigate once to establish the origin for localStorage access
  await page.goto(`${BASE_URL}/parent`, { waitUntil: 'domcontentloaded' });
  await setChildProgress(page, progress);
  await setChildList(page, progress);
  await page.reload({ waitUntil: 'networkidle' });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

async function runTests() {
  browser = await chromium.launch({ headless: true });

  try {
    console.log('\n📊 PROGRESS CHARTS — Playwright tests\n');

    // ── 1. Dashboard renders charts with statsHistory data ──────────────────
    await test('1. Parent dashboard affiche les graphiques recharts (SVG)', async () => {
      const page = await newPage({ width: 390, height: 844 });
      const progress = makeProgress({ statsHistory: makeStatsHistory(15) });
      await navigateToDashboard(page, progress);
      await sleep(1500);

      const chartCount = await page.locator('.recharts-wrapper').count();
      assert(chartCount >= 2, `Expected at least 2 Recharts wrappers, got ${chartCount}`);
      await screenshot(page, '1-charts-render');
      await page.close();
    });

    // ── 2. Quizz chart title ────────────────────────────────────────────────
    await test('2. Titre "QUIZZ · 30 DERNIERS JOURS" visible', async () => {
      const page = await newPage({ width: 390, height: 844 });
      const progress = makeProgress({ statsHistory: makeStatsHistory(10) });
      await navigateToDashboard(page, progress);
      await sleep(1500);

      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes('QUIZZ'), 'Page should contain "QUIZZ"');
      assert(text.includes('30 DERNIERS JOURS'), 'Page should contain "30 DERNIERS JOURS"');
      await page.close();
    });

    // ── 3. Rules chart title ────────────────────────────────────────────────
    await test('3. Titre "RÈGLES MAÎTRISÉES" visible', async () => {
      const page = await newPage({ width: 390, height: 844 });
      const progress = makeProgress({ statsHistory: makeStatsHistory(10) });
      await navigateToDashboard(page, progress);
      await sleep(1500);

      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes('RÈGLES'), 'Page should contain "RÈGLES"');
      assert(text.includes('MAÎTRISÉES'), 'Page should contain "MAÎTRISÉES"');
      await page.close();
    });

    // ── 4. No charts (or empty state) when statsHistory is empty ───────────
    await test('4. Pas de graphique recharts quand statsHistory est vide', async () => {
      const page = await newPage({ width: 390, height: 844 });
      const progress = makeProgress({ statsHistory: [] });
      await navigateToDashboard(page, progress);
      await sleep(1500);

      const chartCount = await page.locator('.recharts-wrapper').count();
      const text = await page.evaluate(() => document.body.innerText);
      const showsEmpty = text.includes('Pas encore de données');
      assert(chartCount === 0 && showsEmpty, `Expected empty state without charts (charts=${chartCount}, showsEmpty=${showsEmpty})`);
      await screenshot(page, '4-empty-state');
      await page.close();
    });

    // ── 5. Total quizz count in header ─────────────────────────────────────
    await test('5. Total quizz affiché correctement dans le header', async () => {
      const history = makeStatsHistory(10);
      // Last entry: gTotal=22, dTotal=11 → total = 33
      const lastEntry = history[history.length - 1];
      const expectedTotal = lastEntry.gTotal + lastEntry.dTotal;

      const page = await newPage({ width: 390, height: 844 });
      const progress = makeProgress({ statsHistory: history });
      await navigateToDashboard(page, progress);
      await sleep(1500);

      const text = await page.evaluate(() => document.body.innerText);
      assert(text.includes(String(expectedTotal)), `Expected total ${expectedTotal} to appear on page`);
      await page.close();
    });

    // ── 6. Screenshot mobile (390px) ──────────────────────────────────────
    await test('6. Screenshot mobile (390px) — les graphiques ne débordent pas', async () => {
      const page = await newPage({ width: 390, height: 844 });
      const progress = makeProgress({ statsHistory: makeStatsHistory(20) });
      await navigateToDashboard(page, progress);
      await sleep(1500);

      // Check no horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
          || document.body.scrollWidth > window.innerWidth;
      });
      assert(!overflow, 'Page should not overflow horizontally on mobile');
      await screenshot(page, '6-mobile-390');
      await page.close();
    });

    // ── 7. Screenshot desktop (1280px) ──────────────────────────────────────
    await test('7. Screenshot desktop (1280px) — rendu complet', async () => {
      const page = await newPage({ width: 1280, height: 900 });
      const progress = makeProgress({ statsHistory: makeStatsHistory(25) });
      await navigateToDashboard(page, progress);
      await sleep(1500);

      await screenshot(page, '7-desktop-1280');
      const chartCount = await page.locator('.recharts-wrapper').count();
      assert(chartCount >= 2, `Expected at least 2 Recharts wrappers on desktop, got ${chartCount}`);
      await page.close();
    });

    // ── 8. Première entrée ne gonfle pas le total hebdomadaire ────────────────
    await test('8. Première entrée courte histoire ne gonfle pas le total 7 jours', async () => {
      // Simule un utilisateur dont l'historique commence il y a 3 jours (cas backfill récent).
      // La première entrée a un gTotal élevé (100) — sans le fix, il serait compté comme
      // 100 quizz "ce jour-là" et gonflerait le total hebdomadaire.
      const today = new Date();
      const makeDay = (daysAgo, gTotal, dTotal) => {
        const d = new Date(today);
        d.setDate(d.getDate() - daysAgo);
        return { date: d.toISOString().slice(0, 10), gTotal, dTotal, l0: 5, l1: 1, l2: 1, l3: 1, l4: 1 };
      };
      const shortHistory = [
        makeDay(3, 100, 20), // première entrée : cumulatif élevé
        makeDay(2, 102, 21),
        makeDay(1, 105, 22),
        makeDay(0, 108, 23), // aujourd'hui : 3 quizz grammaire + 1 dictée = 4
      ];
      // Deltas corrects : 0 + 3 + 3 + 3 + 1 + 1 + 1 = 13 (sans la première entrée)
      // Avec bug : 100+20 + 2+1 + 3+1 + 3+1 = 131

      const page = await newPage({ width: 390, height: 844 });
      const progress = makeProgress({ statsHistory: shortHistory });
      await navigateToDashboard(page, progress);
      await sleep(1500);

      const text = await page.evaluate(() => document.body.innerText);
      // Le total affiché "ces 7 derniers jours" doit être 13, certainement pas > 50
      const match = text.match(/\+(\d+) ces 7 derniers jours/);
      assert(match !== null, 'Le label "+X ces 7 derniers jours" doit être présent');
      const weekTotal = parseInt(match[1], 10);
      assert(weekTotal <= 20, `Total 7 jours trop élevé (${weekTotal}) — la première entrée gonfle probablement le total (bug delta)`);
      assert(weekTotal >= 8, `Total 7 jours trop faible (${weekTotal}) — les deltas ne sont pas comptés`);
      await page.close();
    });

  } finally {
    await browser.close();
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failures.length > 0) {
    console.log('\nFailed tests:');
    failures.forEach(f => console.log(`  ✗ ${f}`));
    process.exit(1);
  } else {
    console.log('All tests passed! ✅');
  }
}

runTests().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
