import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 420, height: 900, deviceScaleFactor: 2 });

const errors = [];
page.on('pageerror', err => errors.push(err.message));

// Fresh start
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));

// Screenshot dashboard fresh — check SVG icons, flame, level path
await page.screenshot({ path: 'anim-1-fresh.png', fullPage: true });

// Simulate some progress for richer visuals
await page.evaluate(() => {
  localStorage.setItem('orthographe-progress', JSON.stringify({
    userId: 'local',
    createdAt: '2026-04-01',
    streak: { current: 8, longest: 8, lastActiveDate: '2026-04-12' },
    coins: 340,
    shields: 1,
    shop: { owned: [], equipped: { theme: null, flame: null, title: null, victoryAnimation: null, dashboardBackground: null }, activeBoosts: { doubleCoins: false } },
    milestones: { firstSession: true, streak7: true, streak14: false, streak30: false, streak60: false, streak100: false },
    weeklyChest: { lastOpened: null },
    firstQuizDone: true,
    rules: {
      'ces-ses': {
        level: 3,
        guidedSessionsCompleted: 5,
        guidedSessionsAbove80: 4,
        guidedBestScore: 95,
        directSessionsCompleted: 3,
        directSessionsAbove80: 3,
        directBestScore: 90,
        directConsecutiveAbove90: 1,
        sm2: null,
        recentlyShown: [],
        questionStats: {}
      },
      'er-e-ez-ais-ait': {
        level: 4,
        guidedSessionsCompleted: 6,
        guidedSessionsAbove80: 5,
        guidedBestScore: 95,
        directSessionsCompleted: 5,
        directSessionsAbove80: 5,
        directBestScore: 100,
        directConsecutiveAbove90: 3,
        sm2: {
          easiness: 2.5,
          interval: 6,
          repetitions: 1,
          nextReviewDate: '2026-04-12',
          lastReviewScore: 90,
          diamondHealth: 1.0
        },
        recentlyShown: [],
        questionStats: {}
      }
    }
  }));
});
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));

// Screenshot: progress state — streak, crown, diamond, review due
await page.screenshot({ path: 'anim-2-progress.png', fullPage: true });

// Simulate tarnished diamond
await page.evaluate(() => {
  const p = JSON.parse(localStorage.getItem('orthographe-progress'));
  p.rules['er-e-ez-ais-ait'].sm2.nextReviewDate = '2026-04-08'; // 4 days overdue
  p.rules['er-e-ez-ais-ait'].sm2.diamondHealth = 0.43;
  localStorage.setItem('orthographe-progress', JSON.stringify(p));
});
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));

// Screenshot: tarnished diamond
await page.screenshot({ path: 'anim-3-tarnished.png', fullPage: true });

// Try opening shop
const shopBtn = await page.$('button');
const allBtns = await page.$$('button');
for (const btn of allBtns) {
  const text = await btn.evaluate(el => el.textContent);
  if (text.includes('340') || text.includes('🪙')) {
    await btn.click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'anim-4-shop.png', fullPage: true });
    break;
  }
}

if (errors.length) console.log('Errors:', errors);
else console.log('✓ All screenshots taken, no errors');

await browser.close();
