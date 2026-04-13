import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

// State with diamond rule
await page.evaluate(() => {
  localStorage.setItem('orthographe-progress', JSON.stringify({
    userId: 'local', createdAt: '2026-04-01',
    streak: { current: 5, longest: 5, lastActiveDate: '2026-04-13' },
    coins: 300, shields: 0,
    shop: { owned: [], equipped: { theme: null, flame: null, title: null, victoryAnimation: null, dashboardBackground: null }, activeBoosts: { doubleCoins: false }, inventory: { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 } },
    milestones: { firstSession: true, streak7: false }, weeklyChest: { lastOpened: null }, firstQuizDone: true,
    rules: {
      'ces-ses': {
        level: 4, guidedSessionsCompleted: 5, guidedSessionsAbove80: 4, guidedBestScore: 95,
        directSessionsCompleted: 5, directSessionsAbove80: 5, directBestScore: 100, directConsecutiveAbove90: 3,
        sm2: { easiness: 2.5, interval: 15, repetitions: 2, nextReviewDate: '2026-04-20', lastReviewScore: 95, diamondHealth: 1.0 },
        recentlyShown: [], questionStats: {}
      },
    }
  }));
});
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));

// Click on "Argent" node to test dynamic score text
const clicked = await page.evaluate(() => {
  const spans = document.querySelectorAll('span');
  for (const span of spans) {
    if (span.textContent.trim() === 'Argent') {
      span.parentElement.click();
      return 'clicked Argent';
    }
  }
  return 'not found';
});
console.log(clicked);
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: 'help-argent.png', fullPage: false });
console.log('✓ Argent popup');

// Close and click diamond icon
await page.evaluate(() => {
  // Click backdrop to close
  const overlay = document.querySelector('[role="dialog"]');
  if (overlay) overlay.closest('div[style*="position: fixed"]')?.click();
});
await new Promise(r => setTimeout(r, 500));

// Click the diamond SVG on the rule card
const diamondClicked = await page.evaluate(() => {
  // Find DiamondStatus container (cursor: pointer div)
  const divs = document.querySelectorAll('div[style*="cursor: pointer"]');
  for (const div of divs) {
    const svg = div.querySelector('svg');
    if (svg && div.closest('div[style*="borderRadius"]')) {
      div.click();
      return 'clicked diamond';
    }
  }
  return 'diamond not found';
});
console.log(diamondClicked);
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: 'help-diamond-status.png', fullPage: false });
console.log('✓ Diamond status popup');

await browser.close();
