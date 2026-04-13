import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 420, height: 900, deviceScaleFactor: 2 });

const errors = [];
page.on('pageerror', err => errors.push(err.message));
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

// ─── SCENARIO 1: Fresh start ───
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: 'audit-01-fresh.png', fullPage: true });
console.log('✓ 1/8 Fresh dashboard');

// ─── SCENARIO 2: Complete a quiz (debug mode = 1 question) ───
const btns1 = await page.$$('button');
for (const btn of btns1) {
  const t = await btn.evaluate(el => el.textContent || '');
  if (t.includes('Découvrir')) { await btn.click(); break; }
}
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: 'audit-02-quiz-guided.png', fullPage: true });
console.log('✓ 2/8 Quiz guided');

// Answer + navigate through
for (let i = 0; i < 10; i++) {
  const allBtns = await page.$$('button');
  let acted = false;
  for (const btn of allBtns) {
    const t = await btn.evaluate(el => (el.textContent || '').trim());
    const disabled = await btn.evaluate(el => el.disabled);
    if (!disabled && (t.includes('suivante') || t.includes('résultat'))) {
      await btn.click(); acted = true; await new Promise(r => setTimeout(r, 300)); break;
    }
  }
  if (acted) continue;
  for (const btn of allBtns) {
    const t = await btn.evaluate(el => (el.textContent || '').trim());
    const disabled = await btn.evaluate(el => el.disabled);
    if (!disabled && t.length > 0 && t.length < 15 && !t.includes('Continuer') && !t.includes('Découvrir')) {
      await btn.click(); await new Promise(r => setTimeout(r, 400)); break;
    }
  }
}
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: 'audit-03-end-screen.png', fullPage: true });
console.log('✓ 3/8 End screen');

// Click Continuer
for (const btn of await page.$$('button')) {
  const t = await btn.evaluate(el => el.textContent || '');
  if (t.includes('Continuer')) { await btn.click(); break; }
}
await new Promise(r => setTimeout(r, 2000));
// Click overlay to dismiss if present
try { await page.click('div[style*="position: fixed"]'); } catch {}
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: 'audit-04-after-session.png', fullPage: true });
console.log('✓ 4/8 Dashboard after 1 session');

// ─── SCENARIO 3: Advanced state with diamond + crown ───
await page.evaluate(() => {
  localStorage.setItem('orthographe-progress', JSON.stringify({
    userId: 'local', createdAt: '2026-04-01',
    streak: { current: 8, longest: 12, lastActiveDate: '2026-04-13' },
    coins: 450, shields: 1,
    shop: { owned: ['theme-dark-blue'], equipped: { theme: null, flame: null, title: null, victoryAnimation: null, dashboardBackground: null }, activeBoosts: { doubleCoins: false }, inventory: { revealHint: 2, rematch: 1, modeSniper: 0, questionMystery: 3 } },
    milestones: { firstSession: true, streak7: true, streak14: false, streak30: false, streak60: false, streak100: false },
    weeklyChest: { lastOpened: null }, firstQuizDone: true,
    rules: {
      'ces-ses': {
        level: 4, guidedSessionsCompleted: 6, guidedSessionsAbove80: 5, guidedBestScore: 95,
        directSessionsCompleted: 5, directSessionsAbove80: 5, directBestScore: 100, directConsecutiveAbove90: 3,
        sm2: { easiness: 2.5, interval: 6, repetitions: 1, nextReviewDate: '2026-04-15', lastReviewScore: 95, diamondHealth: 1.0 },
        recentlyShown: [], questionStats: {}
      },
      'er-e-ez-ais-ait': {
        level: 3, guidedSessionsCompleted: 4, guidedSessionsAbove80: 3, guidedBestScore: 90,
        directSessionsCompleted: 3, directSessionsAbove80: 3, directBestScore: 85, directConsecutiveAbove90: 1,
        sm2: null, recentlyShown: [], questionStats: {}
      },
    }
  }));
});
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: 'audit-05-advanced.png', fullPage: true });
console.log('✓ 5/8 Advanced state (diamond + crown)');

// ─── SCENARIO 4: Open shop ───
for (const btn of await page.$$('button')) {
  const t = await btn.evaluate(el => el.textContent || '');
  if (t.includes('🛒') || t.includes('450') || t.includes('Shop')) {
    await btn.click(); break;
  }
}
await new Promise(r => setTimeout(r, 1000));
await page.screenshot({ path: 'audit-06-shop.png', fullPage: true });
console.log('✓ 6/8 Shop');

// Try buying something — click first Acheter button
for (const btn of await page.$$('button')) {
  const t = await btn.evaluate(el => el.textContent || '');
  if (t.includes('Acheter')) { await btn.click(); await new Promise(r => setTimeout(r, 500)); break; }
}
await page.screenshot({ path: 'audit-07-shop-confirm.png', fullPage: true });
console.log('✓ 7/8 Shop confirmation dialog');

// Cancel
for (const btn of await page.$$('button')) {
  const t = await btn.evaluate(el => el.textContent || '');
  if (t.includes('Annuler')) { await btn.click(); break; }
}

// Go back to dashboard
for (const btn of await page.$$('button')) {
  const t = await btn.evaluate(el => el.textContent || '');
  if (t.includes('Retour') || t.includes('←')) { await btn.click(); break; }
}
await new Promise(r => setTimeout(r, 1000));

// ─── SCENARIO 5: Tarnished diamond ───
await page.evaluate(() => {
  const p = JSON.parse(localStorage.getItem('orthographe-progress'));
  p.rules['ces-ses'].sm2.nextReviewDate = '2026-04-09';
  p.rules['ces-ses'].sm2.diamondHealth = 0.35;
  localStorage.setItem('orthographe-progress', JSON.stringify(p));
});
await page.reload({ waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: 'audit-08-tarnished.png', fullPage: true });
console.log('✓ 8/8 Tarnished diamond');

// ─── REPORT ───
if (errors.length) {
  console.log('\n⚠ JS Errors (' + errors.length + '):');
  errors.slice(0, 5).forEach(e => console.log('  ' + e.substring(0, 120)));
} else {
  console.log('\n✓ No JS errors across all scenarios');
}

await browser.close();
