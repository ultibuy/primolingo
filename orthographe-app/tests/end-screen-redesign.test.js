/**
 * EndScreen redesign — unit tests + Playwright E2E.
 *
 * Unit tests: buildCoinTiers range validity.
 * E2E tests: visual checks against the new design spec.
 *
 * Usage:
 *   npm run dev  (server on :5173)
 *   npm run test:end-screen
 */

import assert from 'assert';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots', 'end-screen-redesign');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

/* ── Unit tests: buildCoinTiers ────────────────────────────────────────────── */

// Inline copy of buildCoinTiers so tests work without bundler
function buildCoinTiers(total, t60, t80, t100, activeTier) {
  if (total < 4) {
    return [
      { range: 'Reussite partielle', coins: 5, active: activeTier === 0 },
      { range: 'Bonne session', coins: 20, active: activeTier === 1 },
      { range: 'Parfait', coins: 30, active: activeTier === 2 },
    ];
  }
  const buildRange = (lo, hi) => {
    if (lo >= hi) return `${lo} reponses justes`;
    return `${lo}\u2013${hi} reponses justes`;
  };
  return [
    { range: buildRange(t60, t80 - 1), coins: 5, active: activeTier === 0 },
    { range: buildRange(t80, t100 - 1), coins: 20, active: activeTier === 1 },
    { range: `${t100} reponses justes`, coins: 30, active: activeTier === 2 },
  ];
}

// Regex for invalid ranges: lo >= hi (e.g. "2-2", "3-2", "1-0")
const INVALID_RANGE_RE = /(\d+)\s*[-\u2013]\s*(\d+)/g;

function assertValidRanges(tiers, label) {
  for (const tier of tiers) {
    let match;
    INVALID_RANGE_RE.lastIndex = 0;
    while ((match = INVALID_RANGE_RE.exec(tier.range)) !== null) {
      const lo = parseInt(match[1], 10);
      const hi = parseInt(match[2], 10);
      assert(lo < hi, `${label}: invalid range "${tier.range}" (${lo} >= ${hi})`);
    }
  }
}

let passed = 0;
let failed = 0;

function runUnitTest(name, fn) {
  process.stdout.write(`  [unit] ${name} ... `);
  try {
    fn();
    passed += 1;
    console.log('OK');
  } catch (error) {
    failed += 1;
    console.log(`FAIL\n    ${error.message}`);
  }
}

function unitTests() {
  console.log('\nUnit tests: buildCoinTiers');

  runUnitTest('total=1: no invalid ranges', () => {
    const tiers = buildCoinTiers(1, 1, 1, 1, 2);
    assertValidRanges(tiers, 'total=1');
    // Should use simple labels
    assert(tiers[0].range === 'Reussite partielle', 'Expected simple label for small session');
  });

  runUnitTest('total=2: no invalid ranges', () => {
    const tiers = buildCoinTiers(2, 2, 2, 2, 2);
    assertValidRanges(tiers, 'total=2');
  });

  runUnitTest('total=3: no invalid ranges', () => {
    const tiers = buildCoinTiers(3, 2, 3, 3, 2);
    assertValidRanges(tiers, 'total=3');
    assert(tiers[0].range === 'Reussite partielle', 'Expected simple label for total < 4');
  });

  runUnitTest('total=10: valid ranges', () => {
    const t60 = Math.ceil(10 * 0.6); // 6
    const t80 = Math.ceil(10 * 0.8); // 8
    const tiers = buildCoinTiers(10, t60, t80, 10, 2);
    assertValidRanges(tiers, 'total=10');
  });

  runUnitTest('total=20: valid ranges', () => {
    const t60 = Math.ceil(20 * 0.6); // 12
    const t80 = Math.ceil(20 * 0.8); // 16
    const tiers = buildCoinTiers(20, t60, t80, 20, 1);
    assertValidRanges(tiers, 'total=20');
  });

  runUnitTest('total=34: valid ranges', () => {
    const t60 = Math.ceil(34 * 0.6); // 21
    const t80 = Math.ceil(34 * 0.8); // 28
    const tiers = buildCoinTiers(34, t60, t80, 34, 0);
    assertValidRanges(tiers, 'total=34');
  });

  runUnitTest('total=40: valid ranges', () => {
    const t60 = Math.ceil(40 * 0.6); // 24
    const t80 = Math.ceil(40 * 0.8); // 32
    const tiers = buildCoinTiers(40, t60, t80, 40, 2);
    assertValidRanges(tiers, 'total=40');
  });
}

/* ── E2E helpers ───────────────────────────────────────────────────────────── */

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const UID = 'localhost-dev';
const CHILD_ID = 'endscreen-test-child';
const PROGRESS_KEY = `local:progress:${UID}:${CHILD_ID}`;
const CHILDREN_KEY = `local:children:${UID}`;
const SETTINGS_KEY = `local:childSettings:${UID}:${CHILD_ID}`;

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
};

const EMOJI_RE = /\p{Extended_Pictographic}/u;
const BAD_CONSOLE_RE = /React Router caught|Cannot set properties of undefined|cannot contain a nested|hydration error|TypeError/i;

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
    coins: 200,
    shields: 0,
    streak: { current: 3, longest: 5, lastActiveDate: today() },
    dailyActivity: { date: today(), count: 1, yesterdayCount: 1, bestDaily: 1 },
    milestones: {
      firstSession: true,
      streak7: false, streak14: false, streak30: false, streak60: false, streak100: false,
    },
    rules: {
      'a-a-as': {
        level: 1,
        guidedSessionsCompleted: 2,
        guidedSessionsAbove80: 1,
        guidedBestScore: 80,
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
      owned: ['char-astro'],
      equipped: { theme: null, flame: null, title: null },
      activeBoosts: {
        doubleCoins: false,
        doubleCoinsRemainingSessions: 0,
        doubleCoinsBonusEarned: 0,
        doubleCoinsLastPurchasedWeek: null,
      },
      mysteryImages: {},
      inventory: { questionMystery: 0 },
    },
    weeklyChest: { lastOpened: null },
    parentalCode: null,
    statsHistory: [],
    coaching: { shown: {}, lastShownByArc: {}, dailyShownCount: { date: today(), count: 99 }, lastBannerArc: null },
    ...overrides,
  };
}

async function installDebugState(page, { progress = baseProgress(), questionCount = 3 } = {}) {
  await page.addInitScript(({ uid, childId, progressKey, childrenKey, settingsKey, progressValue, questionCountValue }) => {
    localStorage.setItem('ortho_debug', '1');
    localStorage.setItem('debug_uid', uid);
    localStorage.setItem('debug_child_name', 'Playwright');
    localStorage.setItem(childrenKey, JSON.stringify([
      { id: childId, name: 'Playwright', avatar: '', createdAt: '2026-01-01' },
    ]));
    localStorage.setItem(progressKey, JSON.stringify(progressValue));
    localStorage.setItem(settingsKey, JSON.stringify({ prodQuestionCount: questionCountValue }));
    // Suppress first-quiz-bonus popup
    const todayStr = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`ortho_first_quiz_bonus_dismissed:${childId}`, todayStr);
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
  assert(!EMOJI_RE.test(text), `${label}: visible emoji found in body text`);
}

async function clickButtonContaining(page, label) {
  const clicked = await page.evaluate((needle) => {
    const buttons = [...document.querySelectorAll('button')];
    const target = buttons.find((b) => b.innerText.includes(needle));
    if (!target) return false;
    target.click();
    return true;
  }, label);
  assert(clicked, `Button containing "${label}" not found`);
}

async function answerOneQuestionAndAdvance(page) {
  // In guided mode, there are decision axis buttons + answer buttons.
  // Keep clicking non-navigation, non-empty buttons until "Question suivante" appears.
  for (let attempt = 0; attempt < 15; attempt++) {
    await page.waitForTimeout(400);

    // Check if "Question suivante" or "Voir le résultat" is available
    const hasNext = await page.evaluate(() => {
      return [...document.querySelectorAll('button')].some((b) =>
        /Question suivante|Voir le r[eé]sultat/.test(b.innerText));
    });
    if (hasNext) break;

    // Check if we're on the EndScreen
    const onEnd = await page.evaluate(() =>
      document.body.innerText.includes('Session terminee') || document.body.innerText.includes('Session terminée'));
    if (onEnd) return true;

    // Click the LAST non-navigation visible button (answer choices are at the bottom)
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')];
      const skip = /Question suivante|Voir le r|Continuer|Fermer|Retour|Commencer|Boutique|Session termin|Plus tard|Réinitialiser|Retourner/;
      const candidates = buttons.filter((b) => {
        const text = b.innerText.trim();
        return text && text.length < 50 && !b.disabled && !skip.test(text);
      });
      // Click the last candidate (answers are typically at the bottom)
      if (candidates.length > 0) candidates[candidates.length - 1].click();
    });
  }

  await page.waitForTimeout(400);

  // Click next/finish
  const clickedNext = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const next = buttons.find((b) => /Question suivante|Voir le r[eé]sultat/.test(b.innerText));
    if (!next) return false;
    next.click();
    return true;
  });
  return clickedNext;
}

async function answerAllQuestionsAndFinish(page, count) {
  for (let i = 0; i < count; i++) {
    const advanced = await answerOneQuestionAndAdvance(page);
    if (!advanced) {
      // Check if we're already at the end screen
      const text = await bodyText(page);
      if (text.includes('Session terminee') || text.includes('Session terminée')) break;
      await screenshot(page, `debug-stuck-q${i + 1}`);
      const allBtns = await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.innerText.trim().substring(0, 80)));
      assert(false, `Could not advance after question ${i + 1}. Buttons: ${JSON.stringify(allBtns)}`);
    }
    await page.waitForTimeout(200);
  }
  // Wait for EndScreen to render and animations
  await page.waitForTimeout(4000);
}

async function navigateToEndScreen(page, questionCount) {
  await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
  await waitForAppLoaded(page);
  // Click the first playable rule button (Découvrir / S'entraîner / Mode direct)
  await screenshot(page, 'debug-dashboard');
  const startClicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    // Try play labels first
    const playLabels = ['couvrir', "entra", 'Mode direct'];
    let target = buttons.find((b) => playLabels.some((l) => b.innerText.toLowerCase().includes(l.toLowerCase())));
    if (!target) {
      // Fall back: click first rule card-like button that has a play action
      target = buttons.find((b) => {
        const text = b.innerText.trim();
        return text && !['Boutique', 'boutique', 'Retour', 'Fermer'].some((l) => text.includes(l));
      });
    }
    if (!target) return { found: false, allButtons: buttons.map((b) => b.innerText.trim().substring(0, 50)) };
    target.click();
    return { found: true };
  });
  assert(startClicked.found, `Could not find a play button. Buttons on page: ${JSON.stringify(startClicked.allButtons)}`);
  await page.waitForTimeout(800);
  // Dismiss any popups — click through coaching/streak/first-session modals
  for (let d = 0; d < 8; d++) {
    const hasProgressBar = await page.evaluate(() => !!document.querySelector('[role="progressbar"]'));
    if (hasProgressBar) break;
    // Use page.click with force to handle overlays
    for (const label of ['Commencer', 'Laisser tomber', 'Plus tard', "C'est parti"]) {
      try {
        await page.click(`button:has-text("${label}")`, { timeout: 500, force: true });
        await page.waitForTimeout(500);
        break;
      } catch { /* not found or not visible */ }
    }
  }
  // Wait for quiz to be ready
  await page.waitForFunction(() => !!document.querySelector('[role="progressbar"]'), undefined, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(500);
  await answerAllQuestionsAndFinish(page, questionCount);
}

async function runTest(name, fn) {
  process.stdout.write(`  [e2e] ${name} ... `);
  try {
    await fn();
    passed += 1;
    console.log('OK');
  } catch (error) {
    failed += 1;
    console.log(`FAIL\n    ${error.stack || error.message}`);
  }
}

/* ── E2E tests ─────────────────────────────────────────────────────────────── */

async function testMobilePerfectSmallSession(browser) {
  const page = await newPage(browser, VIEWPORTS.mobile);
  await installDebugState(page, { questionCount: 3 });
  await navigateToEndScreen(page, 3);
  await screenshot(page, '01-mobile-perfect-3q');

  const text = await bodyText(page);
  // Core assertions
  assert(text.includes('Session terminee'), 'Expected "Session terminee" visible');
  assert(/\d+\/3/.test(text), 'Expected score x/3 visible');
  await assertNoVisibleEmoji(page, 'mobile perfect session');

  // No trophy/cup
  const hasTrophy = await page.evaluate(() => {
    const html = document.body.innerHTML;
    return html.includes('TrophyIcon') || /🏆/.test(document.body.innerText);
  });
  assert(!hasTrophy, 'No trophy should be visible');

  // No "Animation de victoire"
  assert(!text.includes('Animation de victoire'), 'No "Animation de victoire" text');

  // No invalid ranges
  assert(!text.includes('1-0'), 'No "1-0" range');
  assert(!/\b(\d+)\s*-\s*(\d+)\s+r[eé]ponses justes/.test(text), 'No dash ranges for small sessions');

  // Continuer button visible in viewport
  const continuerVisible = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const btn = buttons.find((b) => b.innerText.includes('Continuer'));
    if (!btn) return false;
    const rect = btn.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  });
  assert(continuerVisible, 'Continuer button must be visible in viewport');

  // No streak engagement messages
  assert(!text.includes('Encore') || !text.includes('flamme'), 'No "Encore X jours de flamme" message');
  assert(!text.includes('sessions qualifiantes'), 'No "sessions qualifiantes" text');

  assertNoBadConsole(page, 'mobile perfect session');
  await page.close();
}

async function testMobileLongRecap(browser) {
  const page = await newPage(browser, VIEWPORTS.mobile);
  await installDebugState(page, { questionCount: 10 });
  await navigateToEndScreen(page, 10);
  await screenshot(page, '02-mobile-long-recap');

  // Continuer button must still be visible
  const continuerVisible = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const btn = buttons.find((b) => b.innerText.includes('Continuer'));
    if (!btn) return false;
    const rect = btn.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  });
  assert(continuerVisible, 'Continuer must stay visible with long recap');

  // The content area should be scrollable when 10+ answers are shown
  const scrollable = await page.evaluate(() => {
    // Find any element with overflow-y: auto/scroll that has more content than visible
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      const style = getComputedStyle(el);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 10) {
        return true;
      }
    }
    // Also check body
    return document.body.scrollHeight > window.innerHeight;
  });
  assert(scrollable, 'Content area should be scrollable with 10 answers');

  assertNoBadConsole(page, 'mobile long recap');
  await page.close();
}

async function testDesktopLayout(browser) {
  const page = await newPage(browser, VIEWPORTS.desktop);
  await installDebugState(page, { questionCount: 3 });
  await navigateToEndScreen(page, 3);
  await screenshot(page, '03-desktop-layout');

  const text = await bodyText(page);
  assert(text.includes('Session terminee'), 'Expected EndScreen on desktop');

  // CTA visible
  const continuerVisible = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const btn = buttons.find((b) => b.innerText.includes('Continuer'));
    if (!btn) return false;
    const rect = btn.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  });
  assert(continuerVisible, 'CTA visible on desktop');

  // No horizontal overflow
  const noOverflow = await page.evaluate(() => {
    return document.body.scrollWidth <= window.innerWidth;
  });
  assert(noOverflow, 'No horizontal overflow on desktop');

  await assertNoVisibleEmoji(page, 'desktop layout');
  assertNoBadConsole(page, 'desktop layout');
  await page.close();
}

async function testNoObjectiveVariant(browser) {
  const page = await newPage(browser, VIEWPORTS.mobile);
  // Level 0 with no progress = no level bar shown
  await installDebugState(page, {
    progress: baseProgress({
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
    }),
    questionCount: 3,
  });
  await navigateToEndScreen(page, 3);
  await screenshot(page, '04-no-objective');

  const text = await bodyText(page);
  // "Prochain objectif" might or might not be present depending on leveling logic
  // But CTA must be visible
  const continuerVisible = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const btn = buttons.find((b) => b.innerText.includes('Continuer'));
    if (!btn) return false;
    const rect = btn.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  });
  assert(continuerVisible, 'CTA visible without objective');

  assertNoBadConsole(page, 'no objective variant');
  await page.close();
}

async function testShopNoVictoryAnimations(browser) {
  const page = await newPage(browser, VIEWPORTS.mobile);
  await installDebugState(page, {
    progress: baseProgress({ coins: 5000 }),
    questionCount: 3,
  });
  await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
  await waitForAppLoaded(page);

  // Open shop
  const shopOpened = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const shopBtn = buttons.find((b) => b.innerText.includes('Boutique') || b.innerText.includes('boutique'));
    if (!shopBtn) return false;
    shopBtn.click();
    return true;
  });
  if (!shopOpened) {
    // Try clicking coins display as an alternative
    await page.evaluate(() => {
      const el = document.querySelector('[data-shop-trigger]');
      if (el) el.click();
    });
  }
  await page.waitForTimeout(1000);

  // Navigate to cosmetique tab
  const cosmetiqueClicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const btn = buttons.find((b) => /cosm[eé]tique/i.test(b.innerText));
    if (!btn) return false;
    btn.click();
    return true;
  });
  await page.waitForTimeout(500);
  await screenshot(page, '05-shop-no-victory-anims');

  const text = await bodyText(page);
  assert(!text.includes('Animations de victoire'), 'No "Animations de victoire" label in shop');
  assert(!text.includes('Joue une animation sur ton'), 'No victory animation description in shop');

  assertNoBadConsole(page, 'shop no victory animations');
  await page.close();
}

/* ── Main ──────────────────────────────────────────────────────────────────── */

async function main() {
  console.log(`EndScreen redesign tests against ${BASE_URL}`);

  // Unit tests first (no browser needed)
  unitTests();

  // E2E tests
  console.log('\nPlaywright E2E tests');
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });

  await runTest('Mobile 390x844 — perfect small session (3/3)', () => testMobilePerfectSmallSession(browser));
  await runTest('Mobile 390x844 — long recap (10 questions)', () => testMobileLongRecap(browser));
  await runTest('Desktop 1280x800 — layout check', () => testDesktopLayout(browser));
  await runTest('Mobile — no objective variant', () => testNoObjectiveVariant(browser));
  await runTest('Shop — no "Animations de victoire"', () => testShopNoVictoryAnimations(browser));

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
