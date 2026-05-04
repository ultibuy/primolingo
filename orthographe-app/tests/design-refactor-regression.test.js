/**
 * Design-system regression checks for the remaining PrimoLingo refactor.
 *
 * These are the Playwright checks used to review the partial refactor work.
 * They intentionally focus on the bugs found during review:
 *   - React Router crash from partial coaching data / markCoachingShown
 *   - visible emoji left in child-facing surfaces
 *   - malformed EndScreen ranges such as "1-0 reponses justes"
 *   - invalid HTML nesting warnings from icons rendered inside <p>
 *
 * Usage:
 *   npm run dev -- --host 127.0.0.1 --port 5173
 *   BASE_URL=http://127.0.0.1:5173 node tests/design-refactor-regression.test.js
 */

import assert from 'assert';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots', 'design-refactor');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const UID = 'localhost-dev';
const CHILD_ID = 'design-refactor-child';
const PROGRESS_KEY = `local:progress:${UID}:${CHILD_ID}`;
const CHILDREN_KEY = `local:children:${UID}`;
const SETTINGS_KEY = `local:childSettings:${UID}:${CHILD_ID}`;

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
};

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const BAD_CONSOLE_RE = /React Router caught|Cannot set properties of undefined|markCoachingShown|cannot contain a nested|hydration error|TypeError/i;

let passed = 0;
let failed = 0;

function today(offsetDays = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function baseProgress(overrides = {}) {
  return {
    userId: 'local',
    createdAt: today(-10),
    coins: 20,
    shields: 0,
    streak: { current: 1, longest: 1, lastActiveDate: today(-1) },
    dailyActivity: { date: today(-1), count: 1, yesterdayCount: 1, bestDaily: 1 },
    milestones: {
      firstSession: true,
      streak7: false,
      streak14: false,
      streak30: false,
      streak60: false,
      streak100: false,
    },
    rules: {
      'a-a-as': {
        level: 0,
        guidedSessionsCompleted: 0,
        guidedSessionsAbove80: 0,
        guidedBestScore: 0,
        directSessionsCompleted: 0,
        directSessionsAbove80: 0,
        directBestScore: 0,
        directConsecutiveAbove90: 0,
        sm2: null,
        recentTrophy: null,
        recentlyShown: [],
        questionStats: {},
      },
    },
    shop: {
      owned: [],
      equipped: { theme: null, flame: null, title: null, victoryAnimation: null },
      activeBoosts: {
        doubleCoins: false,
        doubleCoinsRemainingSessions: 0,
        doubleCoinsBonusEarned: 0,
        doubleCoinsLastPurchasedWeek: null,
      },
      mysteryImages: {},
      inventory: { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 },
    },
    weeklyChest: { lastOpened: null },
    parentalCode: null,
    statsHistory: [],
    // Deliberately partial: this reproduced the React Router crash found in review.
    coaching: {},
    ...overrides,
  };
}

async function installDebugState(page, { progress = baseProgress(), questionCount = 1 } = {}) {
  await page.addInitScript(({ uid, childId, progressKey, childrenKey, settingsKey, progressValue, questionCountValue }) => {
    localStorage.setItem('ortho_debug', '1');
    localStorage.setItem('debug_uid', uid);
    localStorage.setItem('debug_child_name', 'Playwright');
    localStorage.setItem(childrenKey, JSON.stringify([
      { id: childId, name: 'Playwright', avatar: '', createdAt: '2026-01-01' },
    ]));
    localStorage.setItem(progressKey, JSON.stringify(progressValue));
    localStorage.setItem(settingsKey, JSON.stringify({ prodQuestionCount: questionCountValue }));
  }, {
    uid: UID,
    childId: CHILD_ID,
    progressKey: PROGRESS_KEY,
    childrenKey: CHILDREN_KEY,
    settingsKey: SETTINGS_KEY,
    progressValue: progress,
    questionCountValue: questionCount,
  });
}

async function newPage(browser, viewport) {
  const page = await browser.newPage();
  await page.setViewportSize(viewport);
  const consoleMessages = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error' || BAD_CONSOLE_RE.test(text)) {
      consoleMessages.push(text);
    }
  });
  page.on('pageerror', (error) => {
    consoleMessages.push(`${error.name}: ${error.message}`);
  });
  page.__consoleMessages = consoleMessages;
  return page;
}

async function waitForAppLoaded(page) {
  await page.waitForFunction(() => !document.body.innerText.includes('Chargement'), undefined, { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(700);
}

async function screenshot(page, name) {
  await page.screenshot({ path: join(SCREENSHOTS_DIR, `${name}.png`), fullPage: false });
}

async function bodyText(page) {
  return page.evaluate(() => document.body.innerText || '');
}

function assertNoBadConsole(page, label) {
  const bad = page.__consoleMessages.filter((msg) => BAD_CONSOLE_RE.test(msg));
  assert.strictEqual(bad.length, 0, `${label}: console errors found:\n${bad.join('\n\n')}`);
}

async function assertNoVisibleEmoji(page, label) {
  const text = await bodyText(page);
  assert(!EMOJI_RE.test(text), `${label}: visible emoji found in body text:\n${text}`);
}

async function clickButtonContaining(page, label) {
  const clicked = await page.evaluate((needle) => {
    const buttons = [...document.querySelectorAll('button')];
    const target = buttons.find((button) => button.innerText.includes(needle));
    if (!target) return false;
    target.click();
    return true;
  }, label);
  assert(clicked, `Button containing "${label}" not found`);
}

async function answerOneQuestionAndFinish(page) {
  await page.waitForTimeout(500);
  const answered = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const forbidden = [
      'Commencer',
      'Question suivante',
      'Voir le resultat final',
      'Voir le résultat final',
      'Continuer',
      'Fermer',
      'Retour',
    ];
    const target = buttons.find((button) => {
      const text = button.innerText.trim();
      if (!text) return false;
      return !forbidden.some((label) => text.includes(label));
    });
    if (!target) return false;
    target.click();
    return true;
  });
  assert(answered, 'Could not click an answer button');
  await page.waitForTimeout(500);

  const clickedFinish = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const finish = buttons.find((button) => /Voir le r[eé]sultat final|Question suivante|Continuer/.test(button.innerText));
    if (!finish) return false;
    finish.click();
    return true;
  });
  assert(clickedFinish, 'Could not click final/next button after answering');
  await page.waitForTimeout(2500);
}

async function runTest(name, fn) {
  process.stdout.write(`  ${name} ... `);
  try {
    await fn();
    passed += 1;
    console.log('OK');
  } catch (error) {
    failed += 1;
    console.log(`FAIL\n${error.stack || error.message}`);
  }
}

async function testDashboardCrashAndEmoji(browser) {
  const page = await newPage(browser, VIEWPORTS.mobile);
  await installDebugState(page, {
    // partial coaching object is intentional: this caught the markCoachingShown crash.
    progress: baseProgress({ coaching: {} }),
    questionCount: 1,
  });
  await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
  await waitForAppLoaded(page);
  await screenshot(page, '01-dashboard-mobile');
  const text = await bodyText(page);
  assert(!text.includes('Une erreur est survenue'), 'React Router error boundary is visible');
  assert(!text.includes('Unexpected Application Error'), 'Raw React Router error page is visible');
  assertNoBadConsole(page, 'dashboard');
  await assertNoVisibleEmoji(page, 'dashboard');
  await page.close();
}

async function testBonusModalNoEmoji(browser) {
  const page = await newPage(browser, VIEWPORTS.mobile);
  await installDebugState(page, {
    progress: baseProgress({
      coins: 200,
      streak: { current: 0, longest: 0, lastActiveDate: today(-1) },
      milestones: { firstSession: false, streak7: false, streak14: false, streak30: false, streak60: false, streak100: false },
      coaching: { shown: {}, lastShownByArc: {}, dailyShownCount: { date: null, count: 0 }, lastBannerArc: null },
    }),
    questionCount: 1,
  });
  await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
  await waitForAppLoaded(page);
  await clickButtonContaining(page, 'Découvrir');
  await page.waitForTimeout(800);
  await screenshot(page, '02-bonus-modal-mobile');
  const text = await bodyText(page);
  assert(text.includes('Bonus') || text.includes('bienvenue'), 'Expected first quiz bonus modal to be visible');
  assertNoBadConsole(page, 'bonus modal');
  await assertNoVisibleEmoji(page, 'bonus modal');
  await page.close();
}

async function testEndScreenSmallSession(browser) {
  const page = await newPage(browser, VIEWPORTS.mobile);
  await installDebugState(page, {
    progress: baseProgress({
      coins: 200,
      streak: { current: 0, longest: 0, lastActiveDate: today() },
      milestones: { firstSession: true, streak7: false, streak14: false, streak30: false, streak60: false, streak100: false },
      coaching: { shown: {}, lastShownByArc: {}, dailyShownCount: { date: null, count: 0 }, lastBannerArc: null },
    }),
    questionCount: 1,
  });
  await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
  await waitForAppLoaded(page);
  await clickButtonContaining(page, 'Découvrir');
  await answerOneQuestionAndFinish(page);
  await screenshot(page, '03-end-screen-one-question-mobile');
  const text = await bodyText(page);
  assert(text.includes('Session terminée'), 'Expected EndScreen');
  assert(!/\b\d+\s*-\s*\d+\s+r[eé]ponses justes/i.test(text), `Invalid answer range found:\n${text}`);
  assert(!text.includes('1-0'), `Invalid "1-0" range found:\n${text}`);
  assertNoBadConsole(page, 'end screen 1-question session');
  await page.close();
}

async function testSeoPagesNoEmoji(browser) {
  const page = await newPage(browser, VIEWPORTS.mobile);
  await page.goto(`${BASE_URL}/regles/a-a-as`, { waitUntil: 'networkidle', timeout: 30000 });
  await waitForAppLoaded(page);
  await screenshot(page, '04-rule-page-mobile');
  assertNoBadConsole(page, 'rule page');
  await assertNoVisibleEmoji(page, 'rule page');
  await page.close();
}

async function main() {
  console.log(`Design refactor Playwright checks against ${BASE_URL}`);
  const browser = await chromium.launch({ headless: true });
  await runTest('Dashboard mobile: no React Router crash, no visible emoji', () => testDashboardCrashAndEmoji(browser));
  await runTest('First quiz bonus popup: SVG/reward styling, no visible emoji', () => testBonusModalNoEmoji(browser));
  await runTest('EndScreen with 1 question: no invalid ranges or HTML nesting errors', () => testEndScreenSmallSession(browser));
  await runTest('SEO rule page: no hook crash, no visible emoji', () => testSeoPagesNoEmoji(browser));
  await browser.close();

  console.log(`\nPassed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Screenshots: ${SCREENSHOTS_DIR}`);
  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
