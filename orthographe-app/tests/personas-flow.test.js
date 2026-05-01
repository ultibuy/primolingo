import assert from 'assert';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const DEBUG_UID = 'playwright-test-uid';
const CHILD_ID = 'test-child';
const DEBUG_PROGRESS_KEY = `debug_progress:${DEBUG_UID}:${CHILD_ID}`;

function todayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function clickButtonContaining(page, text) {
  const clicked = await page.evaluate((label) => {
    const buttons = [...document.querySelectorAll('button')];
    const target = buttons.find((button) => button.textContent.includes(label));
    if (!target) return false;
    target.click();
    return true;
  }, text);
  assert(clicked, `Button containing "${text}" not found`);
}

async function waitForText(page, text) {
  await page.waitForFunction(
    (value) => document.body.innerText.toLowerCase().includes(value.toLowerCase()),
    text,
    {}
  );
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.setViewportSize({ width: 1440, height: 1200 });

  const debugProgress = {
    userId: 'local',
    createdAt: todayMinus(5),
    streak: { current: 5, longest: 7, lastActiveDate: todayMinus(1) },
    coins: 2000,
    shields: 1,
    shop: {
      owned: [],
      equipped: { theme: null, flame: null, title: null, victoryAnimation: null },
      activeBoosts: { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsBonusEarned: 0, doubleCoinsLastPurchasedWeek: null },
      mysteryImages: {},
      inventory: { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 },
    },
    milestones: {
      firstSession: true,
      streak7: false,
      streak14: false,
      streak30: false,
      streak60: false,
      streak100: false,
    },
    weeklyChest: { lastOpened: null },
    parentalCode: null,
    rules: {
      'a-a-as': {
        level: 2,
        guidedSessionsCompleted: 3,
        guidedSessionsAbove80: 3,
        guidedBestScore: 100,
        directSessionsCompleted: 1,
        directSessionsAbove80: 1,
        directBestScore: 100,
        directConsecutiveAbove90: 0,
        sm2: null,
        recentTrophy: null,
        recentlyShown: [],
        questionStats: {},
      },
    },
  };

  await page.addInitScript(({ progressKey, progress, uid }) => {
    localStorage.setItem('ortho_debug', '1');
    localStorage.setItem('debug_uid', uid);
    localStorage.setItem('debug_child_name', 'Playwright');
    localStorage.setItem(progressKey, JSON.stringify(progress));
  }, { progressKey: DEBUG_PROGRESS_KEY, progress: debugProgress, uid: DEBUG_UID });

  await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
  await waitForText(page, 'Playwright');
  await page.screenshot({ path: '/tmp/playwright-01-dashboard.png', fullPage: true });

  await clickButtonContaining(page, '🛒');
  await waitForText(page, 'Boutique');
  await clickButtonContaining(page, 'Persos');
  await waitForText(page, 'Personnages et émotions');

  await clickButtonContaining(page, 'Acheter 500');
  await clickButtonContaining(page, 'Confirmer');
  await waitForText(page, '✓ Possédé');

  await clickButtonContaining(page, 'Dodo');
  await clickButtonContaining(page, 'Confirmer');
  await waitForText(page, '💤 Dodo');
  await page.screenshot({ path: '/tmp/playwright-02-shop-popup.png', fullPage: true });
  await clickButtonContaining(page, 'Fermer');

  const coinText = await page.evaluate(() => document.body.innerText);
  assert(coinText.includes('1350'), 'Expected 1350 coins after purchases');

  await clickButtonContaining(page, 'Retour');
  await waitForText(page, 'Playwright');

  await clickButtonContaining(page, 'Mode direct');
  await waitForText(page, 'Bonus de 10');
  await clickButtonContaining(page, 'Commencer');

  await page.waitForSelector('[role="progressbar"]');
  const hasCharacterSprite = await page.evaluate(() => {
    const bar = document.querySelector('[role="progressbar"]');
    if (!bar || !bar.parentElement) return false;
    return !!bar.parentElement.querySelector('svg');
  });
  assert(hasCharacterSprite, 'Expected active character sprite above quiz progress bar');

  const answered = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const target = buttons.find((button) => {
      const text = button.textContent.trim();
      return text && !['Question suivante →', 'Voir le résultat final'].includes(text) && text !== 'Commencer';
    });
    if (!target) return false;
    target.click();
    return true;
  });
  assert(answered, 'Expected to click a quiz answer');

  await page.waitForFunction(() => /Bravo !|Raté !/.test(document.body.innerText));
  await page.screenshot({ path: '/tmp/playwright-03-quiz.png', fullPage: true });

  const stillHasCharacterSprite = await page.evaluate(() => {
    const bar = document.querySelector('[role="progressbar"]');
    if (!bar || !bar.parentElement) return false;
    return !!bar.parentElement.querySelector('svg');
  });
  assert(stillHasCharacterSprite, 'Expected character sprite to remain visible after answering');

  const filteredErrors = consoleErrors.filter((entry) => {
    return !entry.includes('Failed to load resource')
      && !entry.includes('FirebaseError')
      && !entry.includes('ERR_BLOCKED_BY_CLIENT');
  });
  assert(filteredErrors.length === 0, `Unexpected console errors: ${JSON.stringify(filteredErrors)}`);

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
