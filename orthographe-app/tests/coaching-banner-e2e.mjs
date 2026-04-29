/**
 * E2E test: coaching banner visible on dashboard
 *
 * Seeds localStorage with a profile that should trigger arc13.1
 * (coins ≥ 160, shields = 0, streak < 3) and verifies the banner appears.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5176';

// Minimal progress that triggers arc13.1:
// - 1 diamond rule (a-a-as, level 4) → firstSession milestone set
// - 1280 coins, 0 shields, streak = 2, played today
const TODAY = new Date().toISOString().slice(0, 10);

const PROGRESS = {
  coins: 1280,
  shields: 0,
  streak: { current: 2, best: 2, lastActiveDate: TODAY },
  milestones: { firstSession: true },
  rules: {
    'a-a-as': {
      level: 4,
      guidedSessionsCompleted: 3,
      directSessionsCompleted: 5,
      guidedSessionsAbove80: 3,
      directSessionsAbove80: 3,
      directConsecutiveAbove90: 3,
      sm2: { nextReviewDate: '2026-05-10', easeFactor: 2.5, interval: 10 },
    },
  },
  shop: { owned: [], coins: 1280 },
  coaching: {
    shown: {},
    lastShownByArc: {},
    dailyShownCount: { date: null, count: 0 },
    lastBannerArc: null,
  },
};

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Seed localStorage before navigation
  const page = await context.newPage();
  await page.goto(BASE + '/play/local-child');
  await page.evaluate((data) => {
    localStorage.setItem('local:progress:localhost-dev:local-child', JSON.stringify(data));
  }, PROGRESS);

  // Reload so the app picks up the seeded data
  await page.reload();
  await page.waitForLoadState('networkidle');

  // Wait up to 3s for the banner
  let bannerVisible = false;
  try {
    await page.waitForSelector('[data-testid="motivation-banner"]', { timeout: 3000 });
    bannerVisible = true;
  } catch {
    bannerVisible = false;
  }

  const bannerText = bannerVisible
    ? await page.textContent('[data-testid="motivation-banner"]')
    : null;

  await browser.close();

  if (bannerVisible) {
    console.log('✅ Banner visible:', bannerText?.trim().slice(0, 80));
    process.exit(0);
  } else {
    // Take screenshot for debugging
    console.error('❌ Banner NOT visible — coaching message not rendering');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('❌ Test error:', err.message);
  process.exit(1);
});
