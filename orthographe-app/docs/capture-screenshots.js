#!/usr/bin/env node
/**
 * Captures reference screenshots for functional documentation.
 * Injects specific localStorage states to trigger every screen.
 * Runs against the dev server (npm run dev).
 *
 * Usage: BASE_URL=http://localhost:5173 node docs/capture-screenshots.js
 */
import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, 'screenshots');
const BASE = process.env.BASE_URL || 'http://localhost:5173';
const MOBILE = { width: 390, height: 844 };
const UID = 'localhost-dev';
const CHILD = 'local-child';
const PROGRESS_KEY = `local:progress:${UID}:${CHILD}`;
const SETTINGS_KEY = `local:adminSettings:${UID}`;
const PIN_KEY = `local:parentalPin:${UID}`;

let browser;

function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
const today = new Date().toISOString().slice(0, 10);

async function mobile() { return browser.newContext({ viewport: MOBILE }); }

async function snap(page, name, opts = {}) {
  await page.screenshot({ path: join(DIR, `${name}.png`), fullPage: !!opts.full });
  console.log(`  📸 ${name}.png`);
}

async function injectState(ctx, progress, extras = {}) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.evaluate(({ pk, prog, sk, settings, pnk, pin }) => {
    localStorage.setItem(pk, JSON.stringify(prog));
    if (settings) localStorage.setItem(sk, JSON.stringify(settings));
    if (pin) localStorage.setItem(pnk, JSON.stringify(pin));
  }, { pk: PROGRESS_KEY, prog: progress, sk: SETTINGS_KEY, settings: extras.settings || null, pnk: PIN_KEY, pin: extras.pin || null });
  await page.close();
}

async function goChild(ctx) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/play/${CHILD}`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  return page;
}

async function dismissAll(page) {
  for (let i = 0; i < 5; i++) {
    const c = page.locator('[aria-label="Fermer"]').first();
    if (await c.count() > 0 && await c.isVisible().catch(() => false)) {
      await c.click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(300);
    } else { await page.keyboard.press('Escape').catch(() => {}); break; }
  }
}

// ── Progress factories ───────────────────────────────────────────────────────

const freshProgress = () => ({
  userId: 'local', createdAt: today,
  streak: { current: 0, longest: 0, lastActiveDate: null },
  coins: 0, shields: 0,
  shop: { owned: [], equipped: { theme: null, flame: null, title: null, victoryAnimation: null }, activeBoosts: {}, mysteryImages: {}, inventory: { questionMystery: 0 } },
  milestones: { firstSession: false }, weeklyChest: { lastOpened: null },
  firstQuizDone: false, pinLockout: { failedAttempts: 0, lockedUntil: 0 },
  rules: {}, coaching: { shown: {}, lastShownByArc: {}, dailyShownCount: { date: null, count: 0 } },
  statsHistory: [], dailyActivity: { date: today, count: 0 },
});

const advancedProgress = () => {
  const p = freshProgress();
  p.coins = 500; p.shields = 1;
  p.streak = { current: 12, longest: 18, lastActiveDate: today };
  p.firstQuizDone = true; p.milestones.firstSession = true;
  p.shop.owned = ['panda'];
  p.rules = {
    'a-a-as': { level: 3, guidedSessionsCompleted: 6, guidedSessionsAbove80: 5, directSessionsAbove80: 3, directConsecutiveAbove90: 0 },
    'ce-se': { level: 2, directUnlocked: true, guidedSessionsCompleted: 4, guidedSessionsAbove80: 3, directSessionsAbove80: 1 },
    'son-sont': { level: 1, guidedSessionsCompleted: 2, guidedSessionsAbove80: 1 },
    'ou-ou': { level: 4, hasDiamond: true, sm2: { interval: 6, repetitions: 2, easeFactor: 2.5, nextReviewDate: daysAgo(-2), lastReviewScore: 95, diamondHealth: 0.9 }, guidedSessionsCompleted: 8, directSessionsAbove80: 5, directConsecutiveAbove90: 3 },
  };
  p.dailyActivity = { date: today, count: 3 };
  p.statsHistory = [{ date: today, sessions: 3 }, { date: daysAgo(1), sessions: 2 }];
  return p;
};

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nCapturing docs screenshots from ${BASE}\n`);
  browser = await chromium.launch();

  // 01 — Login (local dev — no auth)
  console.log('01 — Login');
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await snap(p, '01-connexion-accueil'); await ctx.close(); }

  // 01b — Email auth flows (prod only — uses test account)
  const PROD = 'https://www.primolingo.fr';
  const TEST_EMAIL = 'test-parent@primolingo.fr';
  const TEST_PASS = 'Test1234!';
  console.log('01b — Email auth (prod)');
  // Login page
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${PROD}/login`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(1500);
    await snap(p, '01-login-email');
    // Fill form
    await p.fill('input[type=email]', TEST_EMAIL);
    await p.fill('input[type=password]', TEST_PASS);
    await p.waitForTimeout(300);
    await snap(p, '01-login-email-filled');
    // Submit
    await p.click('button[type=submit]');
    await p.waitForURL('**/parent**', { timeout: 10000 }).catch(() => {});
    await p.waitForTimeout(2000);
    await snap(p, '01-login-success');
    console.log('  email login → ' + p.url());
    await ctx.close(); }
  // Register mode
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${PROD}/login`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(1000);
    const toggle = p.locator('button:has-text("Pas encore de compte")');
    if (await toggle.count() > 0) { await toggle.click(); await p.waitForTimeout(500); }
    await snap(p, '01-register-email');
    await ctx.close(); }
  // Wrong password
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${PROD}/login`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(1000);
    await p.fill('input[type=email]', TEST_EMAIL);
    await p.fill('input[type=password]', 'mauvais');
    await p.click('button[type=submit]');
    await p.waitForTimeout(3000);
    await snap(p, '01-login-error');
    await ctx.close(); }

  // 18 — SEO
  console.log('18 — SEO');
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${BASE}/`, { waitUntil: 'networkidle' }); await snap(p, 'seo-landing', { full: true });
    await p.goto(`${BASE}/regles`, { waitUntil: 'networkidle' }); await snap(p, 'seo-index', { full: true });
    await p.goto(`${BASE}/regles/a-a-as`, { waitUntil: 'networkidle' }); await snap(p, 'seo-regle', { full: true });
    const sb = p.locator('button', { hasText: 'Tester avec votre enfant' });
    if (await sb.count() > 0) { await sb.scrollIntoViewIfNeeded(); await sb.click(); await p.waitForTimeout(600); await snap(p, 'seo-quiz'); }
    await ctx.close(); }

  // 03 — Dashboard
  console.log('03 — Dashboard');
  { const ctx = await mobile(); await injectState(ctx, advancedProgress(), { settings: { prodQuestionCount: 20 } });
    const p = await goChild(ctx); await dismissAll(p);
    await snap(p, 'dashboard-accueil', { full: true }); await snap(p, 'dashboard-flamme'); await ctx.close(); }

  // 04 — Flamme popup
  console.log('04 — Flamme');
  { const ctx = await mobile(); await injectState(ctx, advancedProgress());
    const p = await goChild(ctx); await dismissAll(p);
    const f = p.locator('.streak-help-trigger').first();
    if (await f.count() > 0) { await f.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(600); await snap(p, 'flamme-active'); }
    await ctx.close(); }

  // 04b — Return screen
  console.log('04b — Retour absence');
  { const ctx = await mobile();
    const prog = advancedProgress(); prog.streak = { current: 8, longest: 12, lastActiveDate: daysAgo(3) }; prog.dailyActivity = { date: daysAgo(3), count: 2 };
    await injectState(ctx, prog);
    const p = await goChild(ctx); await p.waitForTimeout(1000);
    const ret = p.locator('text=/flamme|retour|absence|sauver|Reprendre/i');
    if (await ret.count() > 0) { await snap(p, 'retour-absence'); } else { console.log('  ⚠️  ReturnScreen not triggered'); }
    await ctx.close(); }

  // 05 — Rules
  console.log('05 — Règles');
  { const ctx = await mobile(); await injectState(ctx, advancedProgress());
    const p = await goChild(ctx); await dismissAll(p);
    await p.evaluate(() => window.scrollTo(0, 350)); await p.waitForTimeout(300); await snap(p, 'regles-liste'); await ctx.close(); }
  { const ctx = await mobile(); await injectState(ctx, advancedProgress());
    const p = await goChild(ctx); await dismissAll(p);
    const t = p.locator('button', { hasText: 'a / à / as' }).first();
    if (await t.count() > 0) { await t.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(600); await snap(p, 'regle-memo'); }
    await ctx.close(); }

  // 06 — Quiz guidé
  console.log('06 — Quiz guidé');
  { const ctx = await mobile();
    const prog = freshProgress(); prog.coins = 200; prog.firstQuizDone = true; prog.milestones.firstSession = true;
    await injectState(ctx, prog);
    const p = await goChild(ctx); await dismissAll(p);
    const btn = p.locator('button', { hasText: /Découvrir/ }).first();
    if (await btn.count() > 0) {
      await btn.scrollIntoViewIfNeeded(); await btn.click({ timeout: 5000 }).catch(() => {});
      await p.waitForTimeout(1500); await dismissAll(p);
      await snap(p, 'quiz-question');
      const btns = await p.locator('button').filter({ hasNotText: /Fermer|Plus tard|Continuer/ }).all();
      for (const b of btns) { if (await b.isVisible().catch(() => false) && !(await b.isDisabled().catch(() => true))) { await b.click().catch(() => {}); break; } }
      await p.waitForTimeout(600); await snap(p, 'quiz-feedback');
    }
    await ctx.close(); }

  // 07 — Quiz direct
  console.log('07 — Quiz direct');
  { const ctx = await mobile(); await injectState(ctx, advancedProgress());
    const p = await goChild(ctx); await dismissAll(p);
    const btn = p.locator('button', { hasText: 'Mode direct' }).first();
    if (await btn.count() > 0) {
      await btn.scrollIntoViewIfNeeded(); await btn.click({ timeout: 5000 }).catch(() => {});
      await p.waitForTimeout(1500); await dismissAll(p); await snap(p, 'quiz-direct');
    } else { console.log('  ⚠️  No direct mode'); }
    await ctx.close(); }

  // 08 — Diamant
  console.log('08 — Diamant');
  { const ctx = await mobile();
    const prog = advancedProgress(); prog.rules['ou-ou'].sm2.nextReviewDate = today; prog.rules['ou-ou'].sm2.diamondHealth = 0.55;
    await injectState(ctx, prog);
    const p = await goChild(ctx); await dismissAll(p);
    await snap(p, 'diamant-obtenu', { full: true });
    const rev = p.locator('button', { hasText: /Réviser/ }).first();
    if (await rev.count() > 0) { await rev.scrollIntoViewIfNeeded(); await snap(p, 'diamant-revue'); }
    await ctx.close(); }

  // 09 — EndScreen (3 question session)
  console.log('09 — EndScreen');
  { const ctx = await mobile();
    const prog = freshProgress(); prog.coins = 200; prog.firstQuizDone = true; prog.milestones.firstSession = true;
    prog.streak = { current: 5, longest: 5, lastActiveDate: daysAgo(1) };
    await injectState(ctx, prog, { settings: { prodQuestionCount: 3 } });
    const p = await goChild(ctx); await dismissAll(p);
    const btn = p.locator('button', { hasText: /Découvrir|S'entraîner/ }).first();
    if (await btn.count() > 0) {
      await btn.scrollIntoViewIfNeeded(); await btn.click({ timeout: 5000 }).catch(() => {});
      await p.waitForTimeout(1500); await dismissAll(p);
      // Answer questions: click ALL visible enabled buttons (axis options + choices)
      for (let q = 0; q < 60; q++) {
        if (await p.locator('text=Session terminée').count() > 0) break;
        // Click any visible enabled button that's not a nav/close button
        const clicked = await p.evaluate(() => {
          const skip = /fermer|plus tard|continuer|suivant|quiz|grammaire|vocabulaire|dictée/i;
          const btns = [...document.querySelectorAll('button')].filter(b => {
            if (b.disabled || b.offsetParent === null) return false;
            if (skip.test(b.textContent)) return false;
            const r = b.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          });
          if (btns.length > 0) { btns[0].click(); return true; }
          return false;
        });
        if (!clicked) {
          // Try "Suivant" or "Valider"
          const next = p.locator('button', { hasText: /Suivant|Valider/ }).first();
          if (await next.count() > 0 && await next.isVisible().catch(() => false)) { await next.click().catch(() => {}); }
        }
        await p.waitForTimeout(350);
      }
      if (await p.locator('text=Session terminée').count() > 0) {
        await p.waitForTimeout(3500);
        await snap(p, 'fin-score');
        await p.evaluate(() => window.scrollTo(0, 250)); await p.waitForTimeout(300); await snap(p, 'fin-pieces');
        await p.evaluate(() => window.scrollTo(0, 600)); await p.waitForTimeout(300); await snap(p, 'fin-recap');
      } else { console.log('  ⚠️  EndScreen not reached'); }
    }
    await ctx.close(); }

  // 10 — Dictée
  console.log('10 — Dictée');
  { const ctx = await mobile(); await injectState(ctx, advancedProgress());
    const p = await goChild(ctx); await dismissAll(p);
    const tab = p.locator('button', { hasText: /Vocabulaire/ }).first();
    if (await tab.count() > 0) {
      await tab.click({ timeout: 5000 }).catch(() => {}); await p.waitForTimeout(500);
      await snap(p, 'dictee-onglet', { full: true });
      const start = p.locator('button', { hasText: /Commencer/ }).first();
      if (await start.count() > 0) { await start.scrollIntoViewIfNeeded(); await start.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(1000); await snap(p, 'dictee-quiz'); }
    }
    await ctx.close(); }

  // 11/12/13 — Boutique / Persos / Mystère
  console.log('11-13 — Boutique');
  { const ctx = await mobile(); await injectState(ctx, advancedProgress());
    const p = await goChild(ctx); await dismissAll(p);
    // Try to open shop — click the coin counter area at the top
    await p.evaluate(() => {
      // Find element containing CoinIcon SVG near a number
      const allEls = document.querySelectorAll('div, span, button');
      for (const el of allEls) {
        const style = window.getComputedStyle(el);
        if (style.cursor !== 'pointer') continue;
        if (!el.querySelector('svg')) continue;
        const text = el.textContent.trim();
        if (/^\d+$/.test(text) || /^\d+\s*$/.test(text)) {
          el.click();
          return true;
        }
      }
      return false;
    });
    await p.waitForTimeout(1000);
    if (await p.locator('text=Cosmétique').count() > 0) {
      await snap(p, 'boutique-cosmetique', { full: true });
      for (const [tab, name] of [['Boost', 'boutique-boost'], ['Persos', 'persos-liste'], [/mystère/i, 'mystere-grille']]) {
        const t = p.locator('button', { hasText: tab }).first();
        if (await t.count() > 0) { await t.click().catch(() => {}); await p.waitForTimeout(400); await snap(p, name, { full: true }); }
      }
      // Persos emotions — expand first character
      const expand = p.locator('button', { hasText: /Persos/ }).first();
      if (await expand.count() > 0) {
        await expand.click().catch(() => {}); await p.waitForTimeout(400);
        // Click on the panda to expand emotions
        const pandaCard = p.locator('text=Panda').first();
        if (await pandaCard.count() > 0) { await pandaCard.click().catch(() => {}); await p.waitForTimeout(500); await snap(p, 'persos-emotions'); }
      }
    } else { console.log('  ⚠️  Shop not opened'); }
    await ctx.close(); }

  // 15 — Coaching
  console.log('15 — Coaching');
  { const ctx = await mobile(); await injectState(ctx, advancedProgress());
    const p = await goChild(ctx); await p.waitForTimeout(500);
    const banner = p.locator('[data-testid="motivation-banner"]');
    if (await banner.count() > 0) { await snap(p, 'coaching-bienvenue'); }
    await ctx.close(); }

  // 16 — Parent dashboard + wizard
  console.log('16 — Parent dashboard + wizard');

  // 16a — Wizard step 1 (PIN) : no wizard state in localStorage → wizard opens at step 1
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await p.evaluate((uid) => {
      // Ensure no wizard state so the wizard opens from scratch
      localStorage.removeItem(`local:onboardingWizard:${uid}`);
    }, UID);
    await p.goto(`${BASE}/parent`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await p.waitForTimeout(800);
    await snap(p, '02-wizard-step1-pin');
    await ctx.close(); }

  // 16b — Wizard step 2 (add children)
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await p.evaluate((uid) => {
      localStorage.setItem(`local:onboardingWizard:${uid}`, JSON.stringify({
        completedSteps: [1], step4DeviceYes: false, dismissed: false,
      }));
      localStorage.setItem(`local:parentalPin:${uid}`, JSON.stringify({ hash: 'x', salt: 'y' }));
    }, UID);
    await p.goto(`${BASE}/parent`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await p.waitForTimeout(800);
    await snap(p, '02-wizard-step2-children');
    await ctx.close(); }

  // 16c — Wizard step 3 (bookmark parent page)
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await p.evaluate((uid) => {
      localStorage.setItem(`local:onboardingWizard:${uid}`, JSON.stringify({
        completedSteps: [1, 2], step4DeviceYes: false, dismissed: false,
      }));
    }, UID);
    await p.goto(`${BASE}/parent`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await p.waitForTimeout(800);
    await snap(p, '02-wizard-step3-bookmark');
    await ctx.close(); }

  // 16d — Wizard step 4 (device choice — same device, oui)
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await p.evaluate((uid) => {
      localStorage.setItem(`local:onboardingWizard:${uid}`, JSON.stringify({
        completedSteps: [1, 2, 3], step4DeviceYes: false, dismissed: false,
      }));
    }, UID);
    await p.goto(`${BASE}/parent`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await p.waitForTimeout(800);
    // Click "Oui" to show child links
    const ouiBtn = p.locator('button', { hasText: 'Oui' });
    if (await ouiBtn.count() > 0) { await ouiBtn.click().catch(() => {}); await p.waitForTimeout(400); }
    await snap(p, '02-wizard-step4-device');
    await ctx.close(); }

  // 16e — Wizard step 5 (done)
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await p.evaluate((uid) => {
      localStorage.setItem(`local:onboardingWizard:${uid}`, JSON.stringify({
        completedSteps: [1, 2, 3, 4], step4DeviceYes: true, dismissed: false,
      }));
    }, UID);
    await p.goto(`${BASE}/parent`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await p.waitForTimeout(800);
    await snap(p, '02-wizard-step5-done');
    await ctx.close(); }

  // 16f — Parent dashboard (wizard dismissed, with children)
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await p.evaluate((uid) => {
      localStorage.setItem(`local:onboardingWizard:${uid}`, JSON.stringify({
        completedSteps: [1, 2, 3, 4, 5], step4DeviceYes: true, dismissed: true,
      }));
    }, UID);
    await p.goto(`${BASE}/parent`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await p.waitForTimeout(800);
    await snap(p, 'parent-dashboard', { full: true });
    await ctx.close(); }

  // 16g — Parent dashboard with "first quiz" coaching nudge (child with 0 sessions)
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await p.evaluate(({ pk, prog, uid }) => {
      localStorage.setItem(pk, JSON.stringify(prog));
      localStorage.setItem(`local:onboardingWizard:${uid}`, JSON.stringify({ dismissed: true }));
    }, { pk: PROGRESS_KEY, prog: freshProgress(), uid: UID });
    await p.goto(`${BASE}/parent`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await p.waitForTimeout(800);
    await snap(p, 'parent-dashboard-coaching-nudge', { full: true });
    await ctx.close(); }

  // 16h — Bookmark banner on child space (opened from onboarding)
  { const ctx = await mobile(); const p = await ctx.newPage();
    await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await p.evaluate(({ pk, prog, tipKey }) => {
      localStorage.setItem(pk, JSON.stringify(prog));
      // Ensure banner not dismissed
      localStorage.removeItem(tipKey);
    }, { pk: PROGRESS_KEY, prog: freshProgress(), tipKey: `ortho_bookmark_tip:${CHILD}` });
    await p.goto(`${BASE}/play/${CHILD}?from=onboarding`, { waitUntil: 'networkidle', timeout: 15000 });
    await p.waitForTimeout(1500);
    const banner = p.locator('text=favori');
    if (await banner.count() > 0) { await snap(p, '02-bookmark-banner'); }
    else { console.log('  ⚠️  Bookmark banner not found'); }
    await ctx.close(); }

  // 17 — PIN
  console.log('17 — PIN');
  { const ctx = await mobile();
    await injectState(ctx, advancedProgress(), { pin: { hash: 'fakehash', salt: 'fakesalt', createdAt: today } });
    const p = await goChild(ctx); await dismissAll(p);
    const pinBtn = p.locator('button', { hasText: /Papa|Maman|Parent|Demander/ }).first();
    if (await pinBtn.count() > 0) {
      await pinBtn.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(600);
      await snap(p, 'pin-saisie');
      const digits = p.locator('button', { hasText: /^[0-9]$/ });
      for (let i = 0; i < 4; i++) { const d = digits.nth(i); if (await d.count() > 0) await d.click().catch(() => {}); await p.waitForTimeout(100); }
      await p.waitForTimeout(600); await snap(p, 'pin-erreur');
    }
    await ctx.close(); }

  await browser.close();
  const pngs = readdirSync(DIR).filter(f => f.endsWith('.png') && !f.startsWith('coaching-') && !f.startsWith('docs-'));
  console.log(`\n✅ ${pngs.length} app screenshots captured!\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
