import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 420, height: 900, deviceScaleFactor: 2 });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

// Set up progress with diamonds at various health levels
await page.evaluate(() => {
  localStorage.setItem('orthographe-progress', JSON.stringify({
    userId: 'local',
    createdAt: '2026-04-01',
    streak: { current: 12, longest: 12, lastActiveDate: '2026-04-12' },
    coins: 580,
    shields: 2,
    shop: { owned: [], equipped: { theme: null, flame: null, title: null, victoryAnimation: null, dashboardBackground: null }, activeBoosts: { doubleCoins: false } },
    milestones: { firstSession: true, streak7: true, streak14: false, streak30: false, streak60: false, streak100: false },
    weeklyChest: { lastOpened: null },
    firstQuizDone: true,
    rules: {
      'ces-ses': {
        level: 5,
        guidedSessionsCompleted: 6, guidedSessionsAbove80: 5, guidedBestScore: 95,
        directSessionsCompleted: 6, directSessionsAbove80: 6, directBestScore: 100,
        directConsecutiveAbove90: 3,
        sm2: { easiness: 2.5, interval: 15, repetitions: 2, nextReviewDate: '2026-04-20', lastReviewScore: 95, diamondHealth: 1.0 },
        recentlyShown: [], questionStats: {}
      },
      'er-e-ez-ais-ait': {
        level: 4,
        guidedSessionsCompleted: 5, guidedSessionsAbove80: 4, guidedBestScore: 90,
        directSessionsCompleted: 5, directSessionsAbove80: 5, directBestScore: 100,
        directConsecutiveAbove90: 3,
        sm2: { easiness: 2.2, interval: 6, repetitions: 1, nextReviewDate: '2026-04-08', lastReviewScore: 85, diamondHealth: 0.43 },
        recentlyShown: [], questionStats: {}
      },
    }
  }));
});

await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2500));

await page.screenshot({ path: 'diamond-1-healthy-vs-tarnished.png', fullPage: true });
console.log('✓ Screenshot 1: Healthy diamond vs tarnished diamond');

// Now set one to critically low
await page.evaluate(() => {
  const p = JSON.parse(localStorage.getItem('orthographe-progress'));
  p.rules['er-e-ez-ais-ait'].sm2.nextReviewDate = '2026-04-02'; // 10 days overdue
  p.rules['er-e-ez-ais-ait'].sm2.diamondHealth = 0.1;
  localStorage.setItem('orthographe-progress', JSON.stringify(p));
});
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2500));

await page.screenshot({ path: 'diamond-2-critical.png', fullPage: true });
console.log('✓ Screenshot 2: Critical diamond (health 0.1)');

// Show a big diamond status at different healths using a test page
await page.evaluate(() => {
  document.body.innerHTML = '';
  document.body.style.background = '#1e1e2e';
  document.body.style.display = 'flex';
  document.body.style.gap = '20px';
  document.body.style.justifyContent = 'center';
  document.body.style.alignItems = 'center';
  document.body.style.height = '100vh';
  document.body.style.flexWrap = 'wrap';
});

// Can't render React components directly, so let's just screenshot the dashboard
console.log('✓ Done');

await browser.close();
