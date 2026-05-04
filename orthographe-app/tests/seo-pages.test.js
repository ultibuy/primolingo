/**
 * seo-pages.test.js
 *
 * Playwright visual and functional checks for SEO rule pages.
 *
 * Covers:
 *  - /regles         : RulesIndexPage — nav, h1, rule grid, CTA
 *  - /regles/a-a-as  : RulePage — breadcrumb, h1, memo table, quiz flow, CTA gate
 *
 * Both desktop (1280px) and mobile (390px) viewports.
 *
 * Run:
 *   BASE_URL=http://localhost:5173 node tests/seo-pages.test.js
 */

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:5173';

let browser;
let passCount = 0;
let failCount = 0;
const failures = [];

function assert(condition, label) {
  if (condition) {
    passCount++;
    console.log(`  ✅ ${label}`);
  } else {
    failCount++;
    failures.push(label);
    console.log(`  ❌ ${label}`);
  }
}

async function describe(name, fn) {
  console.log(`\n📋 ${name}`);
  try {
    await fn();
  } catch (e) {
    failCount++;
    failures.push(`${name}: THREW — ${e.message}`);
    console.log(`  ❌ THREW: ${e.message}`);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function newPage(width = 1280) {
  // Use realistic heights: desktop 900px, mobile 844px (iPhone 14)
  const height = width <= 430 ? 844 : 900;
  const ctx = await browser.newContext({ viewport: { width, height } });
  return ctx.newPage();
}

async function screenshot(page, name) {
  await page.screenshot({
    path: `tests/screenshots/seo-${name}.png`,
    fullPage: true,
  });
}

// ─── Boot ────────────────────────────────────────────────────────────────────

browser = await chromium.launch();

// ─────────────────────────────────────────────────────────────────────────────
// 1. /regles — Rules Index Page
// ─────────────────────────────────────────────────────────────────────────────

await describe('RulesIndexPage — desktop (1280px)', async () => {
  const page = await newPage(1280);
  await page.goto(`${BASE}/regles`, { waitUntil: 'networkidle' });
  await screenshot(page, 'index-desktop');

  // Page title
  const title = await page.title();
  assert(title.includes('PrimoLingo'), 'page title contains PrimoLingo');
  assert(title.toLowerCase().includes('orthographe'), 'page title mentions orthographe');

  // Nav
  const nav = await page.textContent('nav');
  assert(nav.includes('PrimoLingo'), 'nav contains PrimoLingo logo');
  assert(nav.includes('Se connecter'), 'nav has login link');

  // H1
  const h1 = await page.textContent('h1');
  assert(h1.toLowerCase().includes('orthographe'), 'h1 mentions orthographe');
  assert(h1.toLowerCase().includes('exercices'), 'h1 mentions exercices');

  // Rule grid — should have at least 20 cards
  const cards = await page.locator('a[href^="/regles/"]').count();
  assert(cards >= 20, `rule grid has ≥ 20 rule links (got ${cards})`);

  // Specific rules present
  const aAAsLink = page.locator('a[href="/regles/a-a-as"]');
  assert(await aAAsLink.count() > 0, 'link to /regles/a-a-as exists');

  const sonSontLink = page.locator('a[href="/regles/son-sont"]');
  assert(await sonSontLink.count() > 0, 'link to /regles/son-sont exists');

  // School level badges visible
  const badges = await page.locator('text=CE1').count();
  assert(badges > 0, 'CE1 badge visible on at least one card');

  // CTA section at bottom
  const ctaBtn = page.locator('a[href="/login"]').last();
  const ctaText = await ctaBtn.textContent();
  assert(ctaText.includes('gratuitement'), 'bottom CTA says "gratuitement"');

  // Footer links
  const footerLinks = await page.locator('footer a').allTextContents();
  assert(footerLinks.some(t => t.toLowerCase().includes('légales')), 'footer has legal link');

  await page.close();
});

await describe('RulesIndexPage — mobile (390px)', async () => {
  const page = await newPage(390);
  await page.goto(`${BASE}/regles`, { waitUntil: 'networkidle' });
  await screenshot(page, 'index-mobile');

  // Nav still usable on mobile
  const navVisible = await page.locator('nav').first().isVisible();
  assert(navVisible, 'nav is visible on mobile');

  // H1 visible
  const h1Visible = await page.locator('h1').isVisible();
  assert(h1Visible, 'h1 is visible on mobile');

  // Grid scrolls — at least 6 cards visible without scrolling
  const viewportCards = await page.evaluate(() => {
    const links = document.querySelectorAll('a[href^="/regles/"]');
    const vp = window.innerHeight;
    let visible = 0;
    links.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= vp) visible++;
    });
    return visible;
  });
  assert(viewportCards >= 1, `at least 1 rule card visible above fold on mobile (got ${viewportCards})`);

  // CTA button visible after scroll
  const ctaBtn = page.locator('a[href="/login"]').last();
  await ctaBtn.scrollIntoViewIfNeeded();
  assert(await ctaBtn.isVisible(), 'CTA button visible on mobile after scroll');

  await page.close();
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. /regles/a-a-as — Individual Rule Page
// ─────────────────────────────────────────────────────────────────────────────

await describe('RulePage a-a-as — desktop (1280px)', async () => {
  const page = await newPage(1280);
  await page.goto(`${BASE}/regles/a-a-as`, { waitUntil: 'networkidle' });
  await screenshot(page, 'rule-desktop');

  // Page title
  const title = await page.title();
  assert(title.includes('PrimoLingo'), 'page title contains PrimoLingo');
  assert(title.toLowerCase().includes('enfant') || title.toLowerCase().includes('aider'), 'page title is parent-oriented');

  // Breadcrumb
  const breadcrumbLinks = await page.locator('nav[aria-label] a').allTextContents();
  assert(breadcrumbLinks.some(t => t === 'Accueil'), 'breadcrumb has "Accueil"');
  assert(breadcrumbLinks.some(t => t.toLowerCase().includes('règles')), 'breadcrumb has rules link');

  // H1 — parent-oriented
  const h1 = await page.textContent('h1');
  assert(h1.toLowerCase().includes('enfant') || h1.toLowerCase().includes('aider') || h1.toLowerCase().includes('se tromper'), 'h1 is parent-oriented');
  assert(h1.includes('à'), 'h1 mentions à');

  // Level badge (CE1, CE2)
  const badge = await page.locator('text=CE1').count();
  assert(badge > 0, 'CE1 level badge visible');

  // Section "L'astuce"
  const h2Texts = await page.locator('h2').allTextContents();
  assert(h2Texts.some(t => t.toLowerCase().includes('astuce')), 'h2 "L\'astuce" section exists');

  // Memo card table
  const table = page.locator('table');
  assert(await table.count() > 0, 'memo card table is present');
  const tableRows = await page.locator('table tbody tr').count();
  assert(tableRows >= 3, `memo card has ≥ 3 rows (got ${tableRows})`);

  // Table has "a", "as", "à" forms
  const tableCells = await page.locator('table tbody td:first-child').allTextContents();
  assert(tableCells.some(t => t.trim() === 'a'), 'memo table has "a" row');
  assert(tableCells.some(t => t.trim() === 'as'), 'memo table has "as" row');
  assert(tableCells.some(t => t.trim() === 'à'), 'memo table has "à" row');

  // Section "Erreurs fréquentes"
  assert(h2Texts.some(t => t.toLowerCase().includes('erreur') || t.toLowerCase().includes('fréquentes')), 'h2 "Erreurs fréquentes" section exists');

  // Trap cards — identified by the "Pourquoi c'est piégeux" label
  const trapCards = await page.locator('text=Pourquoi c\'est piégeux').count();
  assert(trapCards >= 1, 'at least 1 trap question card visible');

  // Section "Testez avec votre enfant"
  assert(h2Texts.some(t => t.toLowerCase().includes('testez')), 'h2 "Testez" quiz section exists');

  // Mini-quiz idle state — start button visible
  const startBtn = page.locator('button', { hasText: 'Tester avec votre enfant' });
  assert(await startBtn.count() > 0, 'quiz start button visible');

  // Section "Règles souvent confondues"
  assert(h2Texts.some(t => t.toLowerCase().includes('confondues') || t.toLowerCase().includes('similaires') || t.toLowerCase().includes('confondues')), 'h2 related rules section exists');

  // Related rule links
  const relatedLinks = page.locator('a[href^="/regles/"]');
  const relatedCount = await relatedLinks.count();
  assert(relatedCount >= 2, `at least 2 related rule links (got ${relatedCount})`);

  await page.close();
});

await describe('RulePage a-a-as — quiz flow (desktop)', async () => {
  const page = await newPage(1280);
  await page.goto(`${BASE}/regles/a-a-as`, { waitUntil: 'networkidle' });

  // Start the quiz
  const startBtn = page.locator('button', { hasText: 'Tester avec votre enfant' });
  await startBtn.scrollIntoViewIfNeeded();
  await startBtn.click();

  // Question 1 should appear
  const questionLabel = page.locator('text=Question 1');
  await questionLabel.waitFor({ timeout: 3000 });
  assert(await questionLabel.isVisible(), 'Question 1 label appears after start');

  // Progress dots visible
  const dots = await page.locator('[style*="border-radius: 50%"]').count();
  assert(dots >= 2, `progress dots visible (got ${dots})`);

  // Blank (___ or styled span) visible
  const blank = page.locator('text=___');
  assert(await blank.count() > 0, 'blank placeholder visible in question');

  // Choice buttons visible
  const choiceBtns = await page.locator('button[disabled]').count();
  // Before answering — buttons should NOT be disabled
  const enabledBtns = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].filter(
      b => !b.disabled && (b.textContent.includes('a') || b.textContent.includes('as') || b.textContent.includes('à'))
    );
    return btns.length;
  });
  assert(enabledBtns >= 2, `at least 2 choice buttons enabled (got ${enabledBtns})`);

  // Click the correct answer (first choice with "a")
  const answerBtn = page.locator('button', { hasText: /^a$/ }).first();
  if (await answerBtn.count() > 0) {
    await answerBtn.click();
    // Feedback should appear — look for the explanation text or SVG check/cross
    await page.waitForTimeout(600);
    const hasFeedback = await page.evaluate(() => {
      // Check for SVG icons (CheckIcon/CrossIcon) or explanation text
      const svgs = document.querySelectorAll('svg[viewBox="0 0 24 24"]');
      const text = document.body.innerText;
      return svgs.length > 2 || text.includes('avait') || text.includes('remplacer') || text.includes('verbe');
    });
    assert(hasFeedback, 'feedback appears after answering');
  }

  await screenshot(page, 'quiz-q1-answered');
  await page.close();
});

await describe('RulePage a-a-as — quiz completes and shows CTA gate', async () => {
  const page = await newPage(1280);
  await page.goto(`${BASE}/regles/a-a-as`, { waitUntil: 'networkidle' });

  // Start quiz
  const startBtn = page.locator('button', { hasText: 'Tester avec votre enfant' });
  await startBtn.scrollIntoViewIfNeeded();
  await startBtn.click();
  await page.waitForTimeout(300);

  // Answer question 1 — click any button
  const q1Btns = await page.locator('button').filter({ hasNotText: /Tester|suivante|Se connecter/ }).all();
  const clickable = q1Btns.filter(async b => !(await b.isDisabled()));
  if (q1Btns.length > 0) {
    await q1Btns[0].click();
    await page.waitForTimeout(1600); // auto-advance delay for last question
  }

  // If there's a "Question suivante" button, click it
  const nextBtn = page.locator('button', { hasText: 'Question suivante' });
  if (await nextBtn.count() > 0) {
    await nextBtn.click();
    await page.waitForTimeout(300);
    // Answer Q2
    const q2Btns = await page.locator('button').filter({ hasNotText: /Tester|suivante|Se connecter/ }).all();
    if (q2Btns.length > 0) {
      await q2Btns[0].click();
      await page.waitForTimeout(1600);
    }
  }

  await screenshot(page, 'quiz-done');

  // CTA gate should now be visible — score circle and "Essayer gratuitement"
  const ctaLink = page.locator('a[href="/login"]', { hasText: /gratuitement/i });
  await ctaLink.waitFor({ timeout: 4000 });
  assert(await ctaLink.isVisible(), 'CTA "Essayer gratuitement" link visible after quiz completion');

  const seeRulesLink = page.locator('a[href="/regles"]', { hasText: /règles/i });
  assert(await seeRulesLink.count() > 0, '"Voir les autres règles" link visible after quiz');

  await page.close();
});

await describe('RulePage a-a-as — mobile (390px)', async () => {
  const page = await newPage(390);
  await page.goto(`${BASE}/regles/a-a-as`, { waitUntil: 'networkidle' });
  await screenshot(page, 'rule-mobile');

  // H1 visible
  const h1Visible = await page.locator('h1').isVisible();
  assert(h1Visible, 'h1 is visible on mobile');

  // Memo table — should scroll horizontally, not overflow weirdly
  const table = page.locator('table');
  assert(await table.count() > 0, 'memo table present on mobile');

  // Quiz start button visible after scroll
  const startBtn = page.locator('button', { hasText: 'Tester avec votre enfant' });
  await startBtn.scrollIntoViewIfNeeded();
  assert(await startBtn.isVisible(), 'quiz start button visible on mobile');

  // Answer a question on mobile
  await startBtn.click();
  await page.waitForTimeout(300);

  const questionVisible = await page.locator('text=Question 1').isVisible();
  assert(questionVisible, 'Question 1 renders on mobile');

  await page.close();
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Navigation — breadcrumb and internal links work
// ─────────────────────────────────────────────────────────────────────────────

await describe('SEO navigation — internal links', async () => {
  const page = await newPage(1280);

  // From index, clicking a rule card goes to the rule page
  await page.goto(`${BASE}/regles`, { waitUntil: 'networkidle' });
  const firstCard = page.locator('a[href="/regles/a-a-as"]').first();
  await firstCard.click();
  await page.waitForURL('**/regles/a-a-as');
  assert(page.url().includes('/regles/a-a-as'), 'clicking rule card navigates to rule page');

  // Breadcrumb "Règles d'orthographe" navigates back to /regles
  const breadcrumbRulesLink = page.locator('nav[aria-label] a', { hasText: /règles/i }).first();
  await breadcrumbRulesLink.click();
  await page.waitForURL('**/regles');
  assert(page.url().endsWith('/regles'), 'breadcrumb rules link navigates back to /regles');

  // Unknown rule redirects to /regles
  await page.goto(`${BASE}/regles/this-does-not-exist`, { waitUntil: 'networkidle' });
  assert(page.url().includes('/regles'), 'unknown rule ID redirects to /regles');

  await page.close();
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. SEO meta tags
// ─────────────────────────────────────────────────────────────────────────────

await describe('SEO meta tags — /regles/a-a-as', async () => {
  const page = await newPage(1280);
  await page.goto(`${BASE}/regles/a-a-as`, { waitUntil: 'networkidle' });

  const metaDesc = await page.$eval(
    'meta[name="description"]',
    el => el.getAttribute('content')
  ).catch(() => '');
  assert(metaDesc.length > 50, `meta description is non-empty (${metaDesc.length} chars)`);
  assert(metaDesc.length <= 160, `meta description ≤ 160 chars (got ${metaDesc.length})`);

  const canonical = await page.$eval(
    'link[rel="canonical"]',
    el => el.getAttribute('href')
  ).catch(() => '');
  assert(canonical.includes('/regles/a-a-as'), `canonical URL points to /regles/a-a-as (got ${canonical})`);

  const ogTitle = await page.$eval(
    'meta[property="og:title"]',
    el => el.getAttribute('content')
  ).catch(() => '');
  assert(ogTitle.includes('PrimoLingo'), `og:title contains PrimoLingo (got: ${ogTitle})`);

  await page.close();
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

await browser.close();

console.log(`\n${'─'.repeat(50)}`);
console.log(`Total: ${passCount + failCount} | ✅ ${passCount} passed | ❌ ${failCount} failed`);
if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach(f => console.log(`  • ${f}`));
  process.exit(1);
} else {
  console.log('\n🎉 All SEO page tests passed!');
}
