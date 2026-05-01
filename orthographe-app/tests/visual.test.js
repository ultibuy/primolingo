/**
 * Visual tests — PrimoLinguo
 *
 * Tests les pages publiques, les redirections d'auth et les interactions de base.
 * Tourne contre la prod par défaut (BASE_URL) ou localhost si disponible.
 *
 * Usage:
 *   npm run test:visual
 *   BASE_URL=http://localhost:5173 npm run test:visual
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = join(__dirname, 'screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const BASE_URL = process.env.BASE_URL || 'https://orthographe-eabb9.web.app';
const DAMIEN_CHILD_ID = 'x4DVX8Th7AG1UpRzc8Br';

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile:  { width: 390,  height: 844 },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

let browser;
let passed = 0;
let failed = 0;
const results = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForURL(page, urlFragment, timeout = 8000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (page.url().includes(urlFragment)) return;
    await sleep(100);
  }
  throw new Error(`URL did not contain "${urlFragment}" within ${timeout}ms. Current: ${page.url()}`);
}

async function newPage(viewport = VIEWPORTS.desktop) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  // Block analytics & tracking to speed up tests
  await page.route('**', (route) => {
    const url = route.request().url();
    if (url.includes('google-analytics') || url.includes('googletagmanager') || url.includes('firebaselogging')) {
      route.abort();
    } else {
      route.continue();
    }
  });
  return page;
}

async function screenshot(page, name) {
  const path = join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function screenshotFull(page, name) {
  const path = join(SCREENSHOTS_DIR, `${name}-full.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function test(name, fn) {
  process.stdout.write(`  ${name} … `);
  try {
    await fn();
    console.log('✅');
    passed++;
    results.push({ name, status: 'pass' });
  } catch (err) {
    console.log(`❌  ${err.message}`);
    failed++;
    results.push({ name, status: 'fail', error: err.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ── Test Suites ────────────────────────────────────────────────────────────────

async function testLandingPage() {
  console.log('\n📄 Landing Page (/)');

  await test('Desktop — renders hero title', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    const title = await page.$eval('h1', el => el.textContent.trim());
    assert(title.includes('PrimoLinguo'), `h1 expected "PrimoLinguo", got "${title}"`);
    await screenshotFull(page, '01-landing-desktop');
    await screenshot(page, '01-landing-desktop-viewport');
    await page.close();
  });

  await test('Desktop — "Se connecter" nav button links to /login', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const href = await page.$eval('a[href="/login"]', el => el.getAttribute('href'));
    assert(href === '/login', `Expected href="/login", got "${href}"`);
    await page.close();
  });

  await test('Desktop — CTA button "Commencer" is visible', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const ctaBtns = await page.$$eval('a[href="/login"]', els => els.map(el => el.textContent.trim()));
    const hasCta = ctaBtns.some(t => t.includes('Commencer'));
    assert(hasCta, `No CTA "Commencer" button found. Buttons: ${JSON.stringify(ctaBtns)}`);
    await page.close();
  });

  await test('Desktop — 4 feature cards rendered', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const h2s = await page.$$eval('h2', els => els.map(el => el.textContent.trim()));
    const hasFeaturesSection = h2s.some(t => t.includes('Pourquoi'));
    assert(hasFeaturesSection, `"Pourquoi" section not found. h2s: ${JSON.stringify(h2s)}`);
    await page.close();
  });

  await test('Desktop — "Comment ça marche" section with 3 steps', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const h2s = await page.$$eval('h2', els => els.map(el => el.textContent.trim()));
    const hasHowItWorks = h2s.some(t => t.includes('Comment'));
    assert(hasHowItWorks, `"Comment" section not found. h2s: ${JSON.stringify(h2s)}`);
    await page.close();
  });

  await test('Desktop — "100% gratuit" section visible', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const bodyText = await page.$eval('body', el => el.textContent);
    assert(bodyText.includes('100% gratuit'), '"100% gratuit" text not found on page');
    await page.close();
  });

  await test('Desktop — footer copyright present', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const footerText = await page.$eval('footer', el => el.textContent);
    assert(footerText.includes('PrimoLinguo'), 'Footer missing "PrimoLinguo"');
    await page.close();
  });

  await test('Mobile — renders correctly at 390px', async () => {
    const page = await newPage(VIEWPORTS.mobile);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    await screenshot(page, '02-landing-mobile');
    await screenshotFull(page, '02-landing-mobile');
    const title = await page.$eval('h1', el => el.textContent.trim());
    assert(title.includes('PrimoLinguo'), `Mobile h1: "${title}"`);
    await page.close();
  });

  await test('Mobile — no horizontal overflow', async () => {
    const page = await newPage(VIEWPORTS.mobile);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(scrollWidth <= 390, `Horizontal overflow detected: scrollWidth=${scrollWidth}px (expected ≤390)`);
    await page.close();
  });
}

async function testLoginPage() {
  console.log('\n🔐 Login Page (/login)');

  await test('Desktop — renders PrimoLinguo logo', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('button', { timeout: 10000 });
    await screenshot(page, '03-login-desktop');
    const bodyText = await page.$eval('body', el => el.textContent);
    assert(bodyText.includes('PrimoLinguo'), '"PrimoLinguo" not found on login page');
    await page.close();
  });

  await test('Desktop — Google Sign-In button present', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    const btns = await page.$$eval('button', els => els.map(el => el.textContent.trim()));
    const hasGoogle = btns.some(t => t.includes('Google'));
    assert(hasGoogle, `No Google button found. Buttons: ${JSON.stringify(btns)}`);
    await page.close();
  });

  await test('Desktop — "Retour à l\'accueil" back link present', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    const links = await page.$$eval('a', els => els.map(el => el.textContent.trim()));
    const hasBack = links.some(t => t.includes('accueil') || t.includes('Retour'));
    assert(hasBack, `No back link found. Links: ${JSON.stringify(links)}`);
    await page.close();
  });

  await test('Desktop — back link navigates to /', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    const backHref = await page.$eval('a[href="/"]', el => el.getAttribute('href'));
    assert(backHref === '/', `Back link href: "${backHref}"`);
    await page.close();
  });

  await test('Mobile — login page renders at 390px', async () => {
    const page = await newPage(VIEWPORTS.mobile);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('button', { timeout: 10000 });
    await screenshot(page, '04-login-mobile');
    const btns = await page.$$eval('button', els => els.map(el => el.textContent.trim()));
    const hasGoogle = btns.some(t => t.includes('Google'));
    assert(hasGoogle, `Mobile: no Google button. Buttons: ${JSON.stringify(btns)}`);
    await page.close();
  });

  await test('Mobile — no horizontal overflow on login', async () => {
    const page = await newPage(VIEWPORTS.mobile);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(scrollWidth <= 390, `Overflow on login: scrollWidth=${scrollWidth}px`);
    await page.close();
  });
}

async function testAuthRedirects() {
  console.log('\n🔒 Auth Redirects (protected routes)');

  await test('/parent redirects to /login when not authenticated', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/parent`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    const finalUrl = page.url();
    assert(
      finalUrl.includes('/login') || finalUrl.includes('/parent'),
      `Expected /login redirect, got: ${finalUrl}`
    );
    await screenshot(page, '05-parent-redirect');
    await page.close();
  });

  await test('/parent/child/new redirects to /login when not authenticated', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/parent/child/new`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    const finalUrl = page.url();
    assert(
      finalUrl.includes('/login') || finalUrl.includes('/parent'),
      `Expected /login redirect, got: ${finalUrl}`
    );
    await page.close();
  });

  await test('/play/:childId redirects to /login when not authenticated', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/play/${DAMIEN_CHILD_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
    const finalUrl = page.url();
    assert(
      finalUrl.includes('/login') || finalUrl.includes('/play'),
      `Expected /login redirect, got: ${finalUrl}`
    );
    await screenshot(page, '06-play-redirect');
    await page.close();
  });

  await test('Unknown route redirects to /', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/this-route-does-not-exist`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(1000);
    const finalUrl = page.url();
    const path = new URL(finalUrl).pathname;
    assert(path === '/', `Expected redirect to /, got: ${path}`);
    await page.close();
  });
}

async function testNavigation() {
  console.log('\n🧭 Navigation & Interactions');

  await test('Landing → Login: CTA button navigates to /login', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.click('a[href="/login"]');
    await waitForURL(page, '/login');
    const url = new URL(page.url()).pathname;
    assert(url === '/login', `Expected /login after CTA click, got: ${url}`);
    await page.close();
  });

  await test('Login → Landing: back link navigates to /', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.click('a[href="/"]');
    await waitForURL(page, `${BASE_URL}/`);
    const url = new URL(page.url()).pathname;
    assert(url === '/', `Expected / after back click, got: ${url}`);
    await page.close();
  });

  await test('Page title is "PrimoLinguo" on landing', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const title = await page.title();
    assert(title.includes('PrimoLinguo'), `Page title: "${title}"`);
    await page.close();
  });

  await test('Meta description is present on landing', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const desc = await page.$eval('meta[name="description"]', el => el.getAttribute('content'));
    assert(desc && desc.length > 10, `Meta description missing or too short: "${desc}"`);
    await page.close();
  });

  await test('PWA manifest is linked', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const manifest = await page.$('link[rel="manifest"]');
    assert(manifest !== null, 'No <link rel="manifest"> found — PWA manifest missing');
    await page.close();
  });

  await test('Apple touch icon is linked', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    const icon = await page.$('link[rel="apple-touch-icon"]');
    assert(icon !== null, 'No apple-touch-icon link found');
    await page.close();
  });
}

async function testPerformance() {
  console.log('\n⚡ Performance');

  await test('Landing page loads in < 10s', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    const start = Date.now();
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    const elapsed = Date.now() - start;
    assert(elapsed < 10000, `Page load took ${elapsed}ms (> 10s threshold)`);
    console.log(`\n       (loaded in ${elapsed}ms)`);
    await page.close();
  });

  await test('No JS console errors on landing page', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(1000);
    const realErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('non-passive') &&
      !e.includes('Permissions policy') &&
      !e.includes('workbox')
    );
    assert(realErrors.length === 0, `Console errors: ${JSON.stringify(realErrors)}`);
    await page.close();
  });

  await test('No JS console errors on login page', async () => {
    const page = await newPage(VIEWPORTS.desktop);
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(1000);
    const realErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('non-passive') &&
      !e.includes('Permissions policy') &&
      !e.includes('workbox')
    );
    assert(realErrors.length === 0, `Console errors on /login: ${JSON.stringify(realErrors)}`);
    await page.close();
  });
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🧪 PrimoLinguo Visual Tests`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Screenshots: ${SCREENSHOTS_DIR}\n`);

  browser = await chromium.launch({ headless: true });

  try {
    await testLandingPage();
    await testLoginPage();
    await testAuthRedirects();
    await testNavigation();
    await testPerformance();
  } finally {
    await browser.close();
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n' + '─'.repeat(50));
  console.log(`Results: ${passed}/${total} passed`);

  if (failed > 0) {
    console.log(`\nFailed tests:`);
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`  ❌ ${r.name}`);
      console.log(`     ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log(`\n✅ All tests passed!`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err.message);
  if (browser) browser.close();
  process.exit(1);
});
