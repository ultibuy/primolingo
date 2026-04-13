import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

const errors = [];
page.on('pageerror', err => errors.push(err.message));
page.on('console', msg => { if (msg.type() === 'log') console.log('  [page]', msg.text()); });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

await page.evaluate(() => {
  localStorage.setItem('orthographe-progress', JSON.stringify({
    userId: 'local', createdAt: '2026-04-01',
    streak: { current: 5, longest: 5, lastActiveDate: '2026-04-13' },
    coins: 300, shields: 0,
    shop: { owned: [], equipped: { theme: null, flame: null, title: null, victoryAnimation: null, dashboardBackground: null }, activeBoosts: { doubleCoins: false }, inventory: { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 } },
    milestones: { firstSession: true, streak7: false, streak14: false, streak30: false, streak60: false, streak100: false },
    weeklyChest: { lastOpened: null }, firstQuizDone: true,
    rules: {
      'ces-ses': {
        level: 3,
        guidedSessionsCompleted: 4, guidedSessionsAbove80: 3, guidedBestScore: 90,
        directSessionsCompleted: 3, directSessionsAbove80: 3, directBestScore: 85, directConsecutiveAbove90: 1,
        sm2: null, recentlyShown: [], questionStats: {}
      },
    }
  }));
});

await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));

// Use page.evaluate to find and click the Bronze node
const clicked = await page.evaluate(() => {
  // Find all spans with "Bronze" text
  const spans = document.querySelectorAll('span');
  for (const span of spans) {
    if (span.textContent.trim() === 'Bronze') {
      // The clickable div is the parent flex column container
      const container = span.parentElement;
      if (container) {
        container.click();
        return 'clicked container of Bronze span';
      }
    }
  }
  return 'not found';
});
console.log('Click result:', clicked);

await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: 'level-help-bronze.png', fullPage: false });

if (errors.length) console.log('Errors:', errors.slice(0, 3));
console.log('✓ Done');
await browser.close();
