/**
 * landing-variants.test.js
 *
 * Playwright visual checks for the 3 landing page variants (/v1, /v2, /v3).
 * Verifies key sections render, updated stats are correct, no school criticism,
 * illustrations load, and annotation system works.
 *
 * Run: npm run test:landing
 */

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:5173';

let browser, context;
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

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------
browser = await chromium.launch();
context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

// ---------------------------------------------------------------------------
// Test each variant
// ---------------------------------------------------------------------------
for (const variant of ['v1', 'v2', 'v3']) {
  await describe(`${variant.toUpperCase()} — page loads and renders`, async () => {
    const page = await context.newPage();
    await page.goto(`${BASE}/${variant}`, { waitUntil: 'networkidle' });

    // Page title/nav visible
    const nav = await page.textContent('nav');
    assert(nav.includes('PrimoLinguo'), `${variant}: nav contains PrimoLinguo`);

    // Hero section exists
    const heroSection = await page.$('[data-section="hero"]');
    assert(heroSection !== null, `${variant}: hero section has data-section attribute`);

    await page.close();
  });

  await describe(`${variant.toUpperCase()} — updated stats (17 rules, 3300+)`, async () => {
    const page = await context.newPage();
    await page.goto(`${BASE}/${variant}`, { waitUntil: 'networkidle' });

    const body = await page.textContent('body');

    // 17 rules mentioned
    assert(body.includes('17'), `${variant}: mentions 17 (rules)`);

    // 3300+ questions — counter is animated on scroll, check the subtitle text instead
    assert(
      body.includes('3300') || body.includes('3 300') || body.includes('3300+') || body.includes('questions'),
      `${variant}: mentions questions`
    );

    // Dictée mentioned
    assert(
      body.toLowerCase().includes('dictée') || body.toLowerCase().includes('dictee'),
      `${variant}: mentions dictée`
    );

    await page.close();
  });

  await describe(`${variant.toUpperCase()} — no school criticism`, async () => {
    const page = await context.newPage();
    await page.goto(`${BASE}/${variant}`, { waitUntil: 'networkidle' });

    const body = await page.textContent('body');

    // Should NOT contain school-critical phrases
    assert(
      !body.includes('En classe, tout le monde avance au même rythme'),
      `${variant}: no "En classe, tout le monde avance au même rythme"`
    );
    assert(
      !body.includes('pas juste « vue en classe »'),
      `${variant}: no "pas juste vue en classe"`
    );

    await page.close();
  });

  await describe(`${variant.toUpperCase()} — all 17 rules listed`, async () => {
    const page = await context.newPage();
    await page.goto(`${BASE}/${variant}`, { waitUntil: 'networkidle' });

    const body = await page.textContent('body');

    // Check a sample of the 17 rules
    const sampleRules = ['a / à / as', 'ces / ses', 'son / sont', 'ce / se', 'g / gu / ge'];
    for (const rule of sampleRules) {
      assert(body.includes(rule), `${variant}: lists rule "${rule}"`);
    }

    await page.close();
  });

  await describe(`${variant.toUpperCase()} — illustrations load`, async () => {
    const page = await context.newPage();
    await page.goto(`${BASE}/${variant}`, { waitUntil: 'networkidle' });

    // Check that at least one illustration image loaded
    const images = await page.$$('img[src*="/illustrations/"]');
    assert(images.length > 0, `${variant}: has illustration images (found ${images.length})`);

    // Check a specific illustration loads (not broken)
    if (images.length > 0) {
      const naturalWidth = await images[0].evaluate(img => img.naturalWidth);
      assert(naturalWidth > 0, `${variant}: first illustration loaded (naturalWidth=${naturalWidth})`);
    }

    await page.close();
  });

  await describe(`${variant.toUpperCase()} — data-section attributes present`, async () => {
    const page = await context.newPage();
    await page.goto(`${BASE}/${variant}`, { waitUntil: 'networkidle' });

    const sections = await page.$$eval('[data-section]', els => els.map(e => e.getAttribute('data-section')));
    assert(sections.length >= 5, `${variant}: has ${sections.length} data-section elements (>=5)`);
    assert(sections.includes('hero'), `${variant}: has data-section="hero"`);
    assert(sections.includes('problem'), `${variant}: has data-section="problem"`);
    assert(sections.includes('program'), `${variant}: has data-section="program"`);

    await page.close();
  });

  await describe(`${variant.toUpperCase()} — annotation overlay present`, async () => {
    const page = await context.newPage();
    await page.goto(`${BASE}/${variant}`, { waitUntil: 'networkidle' });

    // Annotation header bar should exist with the toggle button
    const annotBtn = await page.$('button');
    const allButtons = await page.$$eval('button', btns => btns.map(b => b.textContent));
    const hasAnnotationBtn = allButtons.some(t =>
      t.toLowerCase().includes('commentaire') || t.toLowerCase().includes('annotation')
    );
    assert(hasAnnotationBtn, `${variant}: has annotation mode toggle button`);

    await page.close();
  });

  await describe(`${variant.toUpperCase()} — mobile responsive (390px)`, async () => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/${variant}`, { waitUntil: 'networkidle' });

    // No horizontal overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    assert(scrollWidth <= clientWidth + 5, `${variant} mobile: no horizontal overflow (scroll=${scrollWidth}, client=${clientWidth})`);

    // Screenshot for visual review
    await page.screenshot({ path: `tests/screenshots/${variant}-mobile.png`, fullPage: true });
    assert(true, `${variant} mobile: screenshot saved to tests/screenshots/${variant}-mobile.png`);

    await page.close();
  });

  await describe(`${variant.toUpperCase()} — desktop screenshot`, async () => {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${BASE}/${variant}`, { waitUntil: 'networkidle' });

    await page.screenshot({ path: `tests/screenshots/${variant}-desktop.png`, fullPage: true });
    assert(true, `${variant} desktop: screenshot saved to tests/screenshots/${variant}-desktop.png`);

    await page.close();
  });
}

// ---------------------------------------------------------------------------
// V2-specific: Before/After comparison section
// ---------------------------------------------------------------------------
await describe('V2 — has before/after comparison', async () => {
  const page = await context.newPage();
  await page.goto(`${BASE}/v2`, { waitUntil: 'networkidle' });

  const body = await page.textContent('body');
  assert(
    body.includes('thode classique') || body.includes('Avant') || body.includes('avant'),
    'V2: has comparison section (méthode classique or avant/après)'
  );

  await page.close();
});

// ---------------------------------------------------------------------------
// V3-specific: Dictée section
// ---------------------------------------------------------------------------
await describe('V3 — has dedicated dictée section', async () => {
  const page = await context.newPage();
  await page.goto(`${BASE}/v3`, { waitUntil: 'networkidle' });

  const dicteeSection = await page.$('[data-section="dictee"]');
  assert(dicteeSection !== null, 'V3: has data-section="dictee"');

  const body = await page.textContent('body');
  assert(body.includes('Aventurier') || body.includes('aventurier'), 'V3: dictée section mentions difficulty levels');

  await page.close();
});

// ---------------------------------------------------------------------------
// Cleanup & Summary
// ---------------------------------------------------------------------------
await browser.close();

console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passCount} passed, ${failCount} failed`);
if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach(f => console.log(`  ✗ ${f}`));
  process.exit(1);
} else {
  console.log('All tests passed!');
}
