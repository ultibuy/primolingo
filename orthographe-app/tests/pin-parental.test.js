/**
 * pin-parental.test.js
 *
 * Visual & functional tests for the parental PIN system.
 * Runs against localhost dev server (auth bypassed).
 *
 * Usage:
 *   node tests/pin-parental.test.js
 *
 * Requires: npm run dev running on port 5173 (or set BASE_URL)
 */

import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomBytes } from 'crypto';

// Hash a PIN the same way pin-crypto.js does (SHA-256 + salt)
function hashPinForTest(pin) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(salt + pin).digest('hex');
  return { salt, hash };
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const CHILD_ID = 'test-child';
const UID = 'localhost-dev';

// ── Helpers ──────────────────────────────────────────────────────────────────

let browser;
let passed = 0;
let failed = 0;
const results = [];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function test(name, fn) {
  process.stdout.write(`  ${name} … `);
  try {
    await fn();
    console.log('\u2705');
    passed++;
    results.push({ name, status: 'pass' });
  } catch (err) {
    console.log(`\u274C  ${err.message}`);
    failed++;
    results.push({ name, status: 'fail', error: err.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function todayMinus(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

async function screenshot(page, name) {
  await page.screenshot({ path: join(SCREENSHOTS_DIR, `pin-${name}.png`), fullPage: false });
}

async function newPage() {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  return page;
}

async function waitForText(page, text, timeout = 8000) {
  await page.waitForFunction(
    (t) => document.body.innerText.toLowerCase().includes(t.toLowerCase()),
    { timeout },
    text
  );
}

function makeProgress(overrides = {}) {
  return {
    userId: 'local',
    createdAt: todayMinus(10),
    streak: { current: 5, longest: 7, lastActiveDate: todayMinus(3) },
    coins: 500,
    shields: 0,
    shop: {
      owned: ['char-panda'],
      equipped: { theme: null, flame: null, title: null, victoryAnimation: null },
      activeBoosts: { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsBonusEarned: 0, doubleCoinsLastPurchasedWeek: null },
      mysteryImages: {},
      inventory: { questionMystery: 0 },
    },
    milestones: { firstSession: true, streak7: false, streak14: false, streak30: false, streak60: false, streak100: false },
    weeklyChest: { lastOpened: null },
    pinLockout: { failedAttempts: 0, lockedUntil: 0 },
    rules: {
      'a-a-as': { level: 2, guidedSessionsCompleted: 3, guidedSessionsAbove80: 3, guidedBestScore: 100, directSessionsCompleted: 1, directSessionsAbove80: 1, directBestScore: 100, directConsecutiveAbove90: 0, sm2: null, recentlyShown: [], questionStats: {} },
    },
    coaching: { shown: {}, lastShownByArc: {}, dailyShownCount: { date: null, count: 0 }, lastBannerArc: null },
    ...overrides,
  };
}

// ── Test: PinInput component renders ─────────────────────────────────────────

async function testPinOnReturnScreen() {
  console.log('\n\U0001F510 PIN on ReturnScreen (child inactive 3+ days)');

  await test('ReturnScreen shows "Demander à Papa" when PIN is set', async () => {
    const page = await newPage();
    const progress = makeProgress();
    // Inject progress + PIN into localStorage
    await page.evaluateOnNewDocument((uid, childId, prog, pin) => {
      localStorage.setItem(`local:progress:${uid}:${childId}`, JSON.stringify(prog));
      localStorage.setItem(`local:parentalPin:${uid}`, JSON.stringify(pin));
    }, UID, CHILD_ID, progress, hashPinForTest('1234'));

    await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    await screenshot(page, '01-return-screen');

    const bodyText = await page.$eval('body', el => el.textContent);
    assert(bodyText.includes('Demander à Papa'), '"Demander à Papa" button not found on ReturnScreen');
    await page.close();
  });

  await test('ReturnScreen hides "Demander à Papa" when no PIN set', async () => {
    const page = await newPage();
    const progress = makeProgress();
    await page.evaluateOnNewDocument((uid, childId, prog) => {
      localStorage.setItem(`local:progress:${uid}:${childId}`, JSON.stringify(prog));
      localStorage.removeItem(`local:parentalPin:${uid}`);
    }, UID, CHILD_ID, progress);

    await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    const bodyText = await page.$eval('body', el => el.textContent);
    assert(!bodyText.includes('Demander à Papa'), '"Demander à Papa" should not appear when no PIN');
    await page.close();
  });

  await test('Clicking "Demander à Papa" shows PIN input with 4 fields', async () => {
    const page = await newPage();
    const progress = makeProgress();
    await page.evaluateOnNewDocument((uid, childId, prog, pin) => {
      localStorage.setItem(`local:progress:${uid}:${childId}`, JSON.stringify(prog));
      localStorage.setItem(`local:parentalPin:${uid}`, JSON.stringify(pin));
    }, UID, CHILD_ID, progress, hashPinForTest('5678'));

    await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Click "Demander à Papa"
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Demander'));
      if (btn) btn.click();
    });
    await sleep(500);
    await screenshot(page, '02-pin-input');

    // Should have 4 input fields
    const inputCount = await page.$$eval('input[type="tel"]', els => els.length);
    assert(inputCount === 4, `Expected 4 PIN inputs, got ${inputCount}`);

    // Should show "Code parental" title
    const bodyText = await page.$eval('body', el => el.textContent);
    assert(bodyText.includes('Code parental'), '"Code parental" title not found');
    await page.close();
  });

  await test('Correct PIN saves streak and goes to dashboard', async () => {
    const page = await newPage();
    const progress = makeProgress();
    await page.evaluateOnNewDocument((uid, childId, prog, pin) => {
      localStorage.setItem(`local:progress:${uid}:${childId}`, JSON.stringify(prog));
      localStorage.setItem(`local:parentalPin:${uid}`, JSON.stringify(pin));
    }, UID, CHILD_ID, progress, '1234');

    await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Click "Demander à Papa"
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Demander'));
      if (btn) btn.click();
    });
    await sleep(500);

    // Type correct PIN: 1-2-3-4
    const inputs = await page.$$('input[type="tel"]');
    for (let i = 0; i < 4; i++) {
      await inputs[i].type(String(i + 1));
      await sleep(100);
    }
    await sleep(1500);
    await screenshot(page, '03-pin-correct');

    // Should be on dashboard (streak saved)
    const bodyText = await page.$eval('body', el => el.textContent);
    // Dashboard shows rules or "Grammaire" tab
    const onDashboard = bodyText.includes('Grammaire') || bodyText.includes('Vocabulaire');
    assert(onDashboard, 'Should be on dashboard after correct PIN');
    await page.close();
  });

  await test('Wrong PIN shows error message', async () => {
    const page = await newPage();
    const progress = makeProgress();
    await page.evaluateOnNewDocument((uid, childId, prog, pin) => {
      localStorage.setItem(`local:progress:${uid}:${childId}`, JSON.stringify(prog));
      localStorage.setItem(`local:parentalPin:${uid}`, JSON.stringify(pin));
    }, UID, CHILD_ID, progress, hashPinForTest('9999'));

    await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Demander'));
      if (btn) btn.click();
    });
    await sleep(500);

    // Type wrong PIN: 0-0-0-0
    const inputs = await page.$$('input[type="tel"]');
    for (const inp of inputs) {
      await inp.type('0');
      await sleep(100);
    }
    await sleep(800);
    await screenshot(page, '04-pin-wrong');

    const bodyText = await page.$eval('body', el => el.textContent);
    assert(
      bodyText.includes('incorrect') || bodyText.includes('tentatives'),
      'Error or lockout message should appear after wrong PIN'
    );
    await page.close();
  });

  await test('Cancel button returns to ReturnScreen intro', async () => {
    const page = await newPage();
    const progress = makeProgress();
    await page.evaluateOnNewDocument((uid, childId, prog, pin) => {
      localStorage.setItem(`local:progress:${uid}:${childId}`, JSON.stringify(prog));
      localStorage.setItem(`local:parentalPin:${uid}`, JSON.stringify(pin));
    }, UID, CHILD_ID, progress, '1234');

    await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Demander'));
      if (btn) btn.click();
    });
    await sleep(500);

    // Click "Annuler"
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Annuler'));
      if (btn) btn.click();
    });
    await sleep(500);
    await screenshot(page, '05-pin-cancelled');

    const bodyText = await page.$eval('body', el => el.textContent);
    assert(bodyText.includes('Demander à Papa'), 'Should be back to intro with "Demander à Papa"');
    await page.close();
  });
}

// ── Test: PIN setup on ParentDashboard ───────────────────────────────────────

async function testPinSetupParent() {
  console.log('\n\U0001F468\u200D\U0001F469\u200D\U0001F466 PIN Setup on ParentDashboard');

  await test('ParentDashboard shows PIN setup modal when no PIN', async () => {
    const page = await newPage();
    await page.setViewport({ width: 1280, height: 800 });
    // Clear any existing PIN
    await page.evaluateOnNewDocument((uid) => {
      localStorage.removeItem(`local:parentalPin:${uid}`);
    }, UID);

    await page.goto(`${BASE_URL}/parent`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    await screenshot(page, '06-parent-pin-setup-modal');

    const bodyText = await page.$eval('body', el => el.textContent);
    assert(
      bodyText.includes('Définissez votre code parental') || bodyText.includes('code parental'),
      'PIN setup modal should appear'
    );
    await page.close();
  });

  await test('PIN setup modal has 4 digit inputs', async () => {
    const page = await newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.evaluateOnNewDocument((uid) => {
      localStorage.removeItem(`local:parentalPin:${uid}`);
    }, UID);

    await page.goto(`${BASE_URL}/parent`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    const inputCount = await page.$$eval('input[type="tel"]', els => els.length);
    assert(inputCount === 4, `Expected 4 PIN inputs in setup modal, got ${inputCount}`);
    await page.close();
  });

  await test('PIN setup requires confirmation (enter twice)', async () => {
    const page = await newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.evaluateOnNewDocument((uid) => {
      localStorage.removeItem(`local:parentalPin:${uid}`);
    }, UID);

    await page.goto(`${BASE_URL}/parent`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Type first PIN: 4-5-6-7
    let inputs = await page.$$('input[type="tel"]');
    for (let i = 0; i < 4; i++) {
      await inputs[i].type(String(4 + i));
      await sleep(100);
    }
    await sleep(600);
    await screenshot(page, '07-parent-pin-confirm');

    // Should now ask for confirmation
    const bodyText = await page.$eval('body', el => el.textContent);
    assert(bodyText.includes('Confirmez'), 'Should ask to confirm PIN');
    await page.close();
  });

  await test('Mismatched confirmation shows error', async () => {
    const page = await newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.evaluateOnNewDocument((uid) => {
      localStorage.removeItem(`local:parentalPin:${uid}`);
    }, UID);

    await page.goto(`${BASE_URL}/parent`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Enter PIN: 1-2-3-4
    let inputs = await page.$$('input[type="tel"]');
    for (let i = 0; i < 4; i++) {
      await inputs[i].type(String(i + 1));
      await sleep(100);
    }
    await sleep(600);

    // Confirm with different PIN: 5-6-7-8
    inputs = await page.$$('input[type="tel"]');
    for (let i = 0; i < 4; i++) {
      await inputs[i].type(String(5 + i));
      await sleep(100);
    }
    await sleep(600);
    await screenshot(page, '08-parent-pin-mismatch');

    const bodyText = await page.$eval('body', el => el.textContent);
    assert(bodyText.includes('correspondent'), 'Should show mismatch error');
    await page.close();
  });

  await test('Correct confirmation saves PIN and shows dashboard', async () => {
    const page = await newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.evaluateOnNewDocument((uid) => {
      localStorage.removeItem(`local:parentalPin:${uid}`);
    }, UID);

    await page.goto(`${BASE_URL}/parent`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    // Enter PIN: 3-3-3-3
    let inputs = await page.$$('input[type="tel"]');
    for (const inp of inputs) {
      await inp.type('3');
      await sleep(100);
    }
    await sleep(600);

    // Confirm: 3-3-3-3
    inputs = await page.$$('input[type="tel"]');
    for (const inp of inputs) {
      await inp.type('3');
      await sleep(100);
    }
    await sleep(1000);
    await screenshot(page, '09-parent-pin-saved');

    const bodyText = await page.$eval('body', el => el.textContent);
    const dashboardVisible = bodyText.includes('Mes enfants') || bodyText.includes('Ajouter');
    assert(dashboardVisible, 'Dashboard should be visible after PIN setup');

    // Verify PIN was saved as hashed object in localStorage
    const savedPin = await page.evaluate((uid) => {
      return JSON.parse(localStorage.getItem(`local:parentalPin:${uid}`));
    }, UID);
    assert(savedPin && savedPin.salt && savedPin.hash, `PIN should be saved as { salt, hash }. Got: ${JSON.stringify(savedPin)}`);
    await page.close();
  });

  await test('Code button visible in header when PIN exists', async () => {
    const page = await newPage();
    await page.setViewport({ width: 1280, height: 800 });
    const hashed = hashPinForTest('4444');
    await page.evaluateOnNewDocument((uid, pinData) => {
      localStorage.setItem(`local:parentalPin:${uid}`, JSON.stringify(pinData));
    }, UID, hashed);

    await page.goto(`${BASE_URL}/parent`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    await screenshot(page, '10-parent-code-button');

    const bodyText = await page.$eval('body', el => el.textContent);
    assert(bodyText.includes('Code'), '"Code" button should be visible in header');
    await page.close();
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n\U0001F9EA PIN Parental Tests`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Screenshots: ${SCREENSHOTS_DIR}\n`);

  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    await testPinOnReturnScreen();
    await testPinSetupParent();
  } finally {
    await browser.close();
  }

  const total = passed + failed;
  console.log('\n' + '\u2500'.repeat(50));
  console.log(`Results: ${passed}/${total} passed`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  \u274C ${r.name}`);
      console.log(`     ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log(`\n\u2705 All tests passed!`);
    console.log(`\U0001F4F8 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  }
}

main().catch(err => {
  console.error('\n\U0001F4A5 Fatal error:', err.message);
  if (browser) browser.close();
  process.exit(1);
});
