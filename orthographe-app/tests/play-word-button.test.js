/**
 * PlayWordButton — diagnostic Playwright
 * Lance sur le dev server (localhost:5175) avec debug_child_name injecté.
 *
 * Usage: node tests/play-word-button.test.js
 */

import { chromium } from 'playwright';

const BASE = 'http://localhost:5175';
const CHILD_ROUTE = '/child/x4DVX8Th7AG1UpRzc8Br'; // Damien

// Minimal progress to unlock a dictée quiz immediately
const FAKE_PROGRESS = {
  coins: 9999,
  streak: { current: 5, lastActiveDate: new Date().toISOString().slice(0, 10) },
  rules: {},
  shop: { owned: [] },
};

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const ctx = await browser.newContext({
    permissions: ['microphone'],
  });
  const page = await ctx.newPage();

  // Collect console & errors
  const logs = [];
  page.on('console', m => logs.push(`[${m.type()}] ${m.text()}`));
  page.on('pageerror', e => logs.push(`[ERROR] ${e.message}`));

  // Track audio network requests
  const audioRequests = [];
  page.on('request', req => {
    if (req.url().includes('/audio/')) audioRequests.push({ url: req.url(), method: req.method() });
  });
  const audioResponses = [];
  page.on('response', res => {
    if (res.url().includes('/audio/')) audioResponses.push({ url: res.url(), status: res.status() });
  });

  console.log('1. Opening app…');
  await page.goto(BASE, { waitUntil: 'networkidle' });

  // Inject debug child name to bypass auth
  await page.evaluate(() => {
    localStorage.setItem('debug_child_name', 'Debug');
  });

  console.log('2. Navigating to child route…');
  await page.goto(`${BASE}${CHILD_ROUTE}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('3. Clicking Dictée tab…');
  const dicteeTab = await page.locator('button', { hasText: 'Dictée' }).first();
  await dicteeTab.click();
  await page.waitForTimeout(500);

  console.log('4. Clicking first Commencer button…');
  const commencerBtn = await page.locator('button', { hasText: 'Commencer' }).first();
  await commencerBtn.click();
  await page.waitForTimeout(1500);

  // Screenshot before clicking audio
  await page.screenshot({ path: 'tests/screenshots/audio-before.png' });

  console.log('5. Looking for Écouter button…');
  const ecouterBtn = await page.locator('button[aria-label*="couter"]').first();
  const exists = await ecouterBtn.count();
  console.log(`   Écouter button found: ${exists > 0}`);

  if (exists > 0) {
    // Check initial waveform bar heights
    const barsBefore = await page.evaluate(() => {
      const bars = document.querySelectorAll('button[aria-label*="couter"] span[style*="height"]');
      return Array.from(bars).map(b => b.style.height);
    });
    console.log(`   Bars before click (first 5): ${barsBefore.slice(0, 5).join(', ')}`);

    console.log('6. Clicking Écouter…');
    await ecouterBtn.click();
    await page.waitForTimeout(300);

    const barsAfter = await page.evaluate(() => {
      const bars = document.querySelectorAll('button[aria-label*="couter"] span[style*="height"]');
      return Array.from(bars).map(b => b.style.height);
    });
    console.log(`   Bars after click  (first 5): ${barsAfter.slice(0, 5).join(', ')}`);

    const isAnimating = JSON.stringify(barsBefore) !== JSON.stringify(barsAfter);
    console.log(`   Animation started: ${isAnimating}`);

    // Check isPlaying state via button style
    const pillBg = await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label*="couter"]');
      return btn ? btn.style.background : 'not found';
    });
    console.log(`   Pill background (playing=purple): ${pillBg}`);

    // Wait and check if animation stops
    console.log('7. Waiting 6s to see if animation stops…');
    await page.waitForTimeout(6000);

    const barsFinal = await page.evaluate(() => {
      const bars = document.querySelectorAll('button[aria-label*="couter"] span[style*="height"]');
      return Array.from(bars).map(b => b.style.height);
    });
    console.log(`   Bars after 6s     (first 5): ${barsFinal.slice(0, 5).join(', ')}`);

    const stoppedAnimating = JSON.stringify(barsAfter) !== JSON.stringify(barsFinal)
      ? 'still changing'
      : 'stopped';
    console.log(`   Animation state: ${stoppedAnimating}`);

    await page.screenshot({ path: 'tests/screenshots/audio-after-6s.png' });
  }

  console.log('\n--- Audio network ---');
  if (audioRequests.length === 0) {
    console.log('  ⚠ No audio requests made');
  }
  audioRequests.forEach(r => console.log(`  REQ  ${r.url}`));
  audioResponses.forEach(r => console.log(`  RES  ${r.status}  ${r.url}`));

  console.log('\n--- Console logs ---');
  logs.forEach(l => console.log(' ', l));

  // Check speechSynthesis availability
  const speechInfo = await page.evaluate(() => {
    const ss = window.speechSynthesis;
    if (!ss) return { available: false };
    const voices = ss.getVoices();
    return {
      available: true,
      voiceCount: voices.length,
      frVoices: voices.filter(v => v.lang.startsWith('fr')).map(v => v.name),
      speaking: ss.speaking,
      pending: ss.pending,
    };
  });
  console.log('\n--- SpeechSynthesis ---');
  console.log(JSON.stringify(speechInfo, null, 2));

  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
