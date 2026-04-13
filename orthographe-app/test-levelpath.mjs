import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
// Use a wider viewport like a real desktop/laptop
await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

// Set up state with diamond level rule to see the LevelPath
await page.evaluate(() => {
  localStorage.setItem('orthographe-progress', JSON.stringify({
    userId: 'local', createdAt: '2026-04-01',
    streak: { current: 8, longest: 8, lastActiveDate: '2026-04-13' },
    coins: 500, shields: 1,
    shop: { owned: [], equipped: { theme: null, flame: null, title: null, victoryAnimation: null, dashboardBackground: null }, activeBoosts: { doubleCoins: false }, inventory: { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 } },
    milestones: { firstSession: true, streak7: true, streak14: false, streak30: false, streak60: false, streak100: false },
    weeklyChest: { lastOpened: null }, firstQuizDone: true,
    rules: {
      'er-e-ez-ais-ait': {
        level: 4,
        guidedSessionsCompleted: 5, guidedSessionsAbove80: 4, guidedBestScore: 95,
        directSessionsCompleted: 4, directSessionsAbove80: 4, directBestScore: 100, directConsecutiveAbove90: 3,
        sm2: { easiness: 2.5, interval: 6, repetitions: 1, nextReviewDate: '2026-04-10', lastReviewScore: 90, diamondHealth: 0.5 },
        recentlyShown: [], questionStats: {}
      },
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

// Full page screenshot at desktop width
await page.screenshot({ path: 'levelpath-desktop-full.png', fullPage: true });

// Now crop just the first rule card to see the LevelPath detail
// Find the first RuleCard element and screenshot it
const cards = await page.$$('div[style*="borderRadius"]');
for (const card of cards) {
  const text = await card.evaluate(el => el.textContent || '');
  if (text.includes('-er') && text.includes('Bronze')) {
    await card.screenshot({ path: 'levelpath-card-closeup.png' });
    console.log('✓ Captured LevelPath closeup on terminaisons card');
    break;
  }
}

// Also test level 3 (couronne) card
for (const card of cards) {
  const text = await card.evaluate(el => el.textContent || '');
  if (text.includes('ces') && text.includes('Bronze')) {
    await card.screenshot({ path: 'levelpath-card-crown.png' });
    console.log('✓ Captured LevelPath closeup on crown card');
    break;
  }
}

console.log('✓ Done');
await browser.close();
