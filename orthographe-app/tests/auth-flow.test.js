/**
 * auth-flow.test.js
 *
 * E2E checks for the parent authentication flow.
 *
 * Run:
 *   BASE_URL=http://localhost:5173 node tests/auth-flow.test.js
 *   AUTH_REAL=1 BASE_URL=http://localhost:5173 node tests/auth-flow.test.js
 */

import assert from 'assert';
import { readFileSync } from 'fs';
import { chromium } from 'playwright';
import { hashPin, verifyPin } from '../src/services/pin-crypto.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const AUTH_REAL = process.env.AUTH_REAL === '1';
const TEST_EMAIL = process.env.AUTH_TEST_EMAIL || 'test-parent@primolingo.fr';
const TEST_PASSWORD = process.env.AUTH_TEST_PASSWORD || 'Test1234!';

let browser;
let passed = 0;
let failed = 0;
const failures = [];

function logPass(label) {
  passed++;
  console.log(`  ✅ ${label}`);
}

function logFail(label, error) {
  failed++;
  failures.push(`${label}: ${error.message}`);
  console.log(`  ❌ ${label}: ${error.message}`);
}

async function run(label, fn) {
  console.log(`\n📋 ${label}`);
  try {
    await fn();
    logPass(label);
  } catch (error) {
    logFail(label, error);
  }
}

async function newPage() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  // Always disable the dev auto-login so the real login page is visible.
  // AUTH_REAL adds the L03b real-credentials test on top of the same setup.
  await page.addInitScript(() => {
    localStorage.setItem('ortho_disable_dev_auth', '1');
  });
  return page;
}

async function goto(page, path) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
}

async function bodyText(page) {
  return page.locator('body').innerText();
}

async function visibleButtonText(page) {
  return page.locator('button:visible').allInnerTexts();
}

browser = await chromium.launch();

await run('L01 — Deux méthodes de connexion visibles', async () => {
  const page = await newPage();
  await goto(page, '/login');

  const buttons = await visibleButtonText(page);
  const text = await bodyText(page);

  assert(buttons.some(t => t.includes('Se connecter avec Google')), 'bouton Google absent');
  assert(await page.locator('input[type="email"]').isVisible(), 'champ e-mail absent');
  assert(await page.locator('input[type="password"]').isVisible(), 'champ mot de passe absent');
  assert(buttons.some(t => t.trim() === 'Se connecter'), 'bouton e-mail absent');
  assert(text.includes('ou par e-mail'), 'séparateur e-mail absent');

  await page.close();
});

await run('L02 — Mode inscription accessible et cohérent', async () => {
  const page = await newPage();
  await goto(page, '/login?mode=register');

  const buttons = await visibleButtonText(page);
  const url = page.url();

  assert(url.includes('/login?mode=register'), `URL inscription inattendue: ${url}`);
  assert(buttons.some(t => t.includes("S'inscrire avec Google")), 'bouton Google inscription absent');
  assert(buttons.some(t => t.includes('Créer mon compte')), 'bouton création e-mail absent');
  assert(await page.locator('input[type="email"]').isVisible(), 'champ e-mail absent en inscription');
  assert(await page.locator('input[type="password"]').isVisible(), 'champ mot de passe absent en inscription');

  await page.close();
});

await run('L03 — Route parent protégée redirige vers login sans session', async () => {
  if (AUTH_REAL) {
    console.log('  ↳ ignoré en AUTH_REAL=1 : une session réelle peut déjà exister');
    return;
  }

  const page = await newPage();
  await goto(page, '/parent');
  await page.waitForURL(/\/login/, { timeout: 8000 });

  assert(page.url().includes('/login'), `redirection attendue vers /login, obtenu: ${page.url()}`);
  assert((await bodyText(page)).includes('Connectez-vous à votre espace parent'), 'page login non affichée après redirection');

  await page.close();
});

if (AUTH_REAL) {
  await run('L03b — Connexion e-mail réelle mène au tableau de bord parent', async () => {
    const page = await newPage();
    await goto(page, '/login');

    await page.locator('input[type="email"]').fill(TEST_EMAIL);
    await page.locator('input[type="password"]').fill(TEST_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/parent/, { timeout: 20000 });

    const text = await bodyText(page);
    assert(page.url().includes('/parent'), `URL parent attendue, obtenu: ${page.url()}`);
    assert(!text.includes('Connectez-vous à votre espace parent'), 'la page login est encore visible après connexion');

    await page.close();
  });
}

await run('L04 — Session locale persistante configurée', async () => {
  const page = await newPage();
  await goto(page, '/login');

  const authChunkLoaded = await page.evaluate(() => {
    const scripts = [...document.scripts].map(script => script.src).filter(Boolean);
    return scripts.some(src => src.includes('firebase-auth')) || document.body.innerText.includes('PrimoLingo');
  });

  assert(authChunkLoaded, 'la page de connexion ne charge pas correctement');

  const authSource = readFileSync('src/services/firebase-auth.js', 'utf8');
  assert(authSource.includes('browserLocalPersistence'), 'persistence locale Firebase Auth non configurée');
  assert(authSource.includes('browserPopupRedirectResolver'), 'resolver popup Firebase Auth non configuré');

  await page.close();
});

await run('L05 — PIN parental haché, jamais stocké en clair', async () => {
  const pinData = await hashPin('1234');

  assert(pinData && typeof pinData.salt === 'string', 'salt absent');
  assert(pinData && typeof pinData.hash === 'string', 'hash absent');
  assert(!JSON.stringify(pinData).includes('1234'), 'PIN en clair présent dans les données sauvegardées');
  assert(await verifyPin('1234', pinData.salt, pinData.hash), 'PIN correct non vérifié');
  assert(!(await verifyPin('0000', pinData.salt, pinData.hash)), 'PIN incorrect accepté');
});

await run('L06 — Erreurs de connexion affichées en français', async () => {
  const page = await newPage();
  await goto(page, '/login');

  await page.locator('form').evaluate(form => { form.noValidate = true; });
  await page.locator('input[type="email"]').fill('pas-un-email');
  await page.locator('input[type="password"]').fill('123456');
  await page.locator('button[type="submit"]').click();
  await page.waitForSelector('text=Adresse e-mail invalide.', { timeout: 8000 });

  assert((await bodyText(page)).includes('Adresse e-mail invalide.'), 'message français absent');

  await page.close();
});

await run('L07 — CTA accueil ouvre le mode inscription', async () => {
  const page = await newPage();
  await goto(page, '/');

  const cta = page.getByRole('button', { name: /Créer un compte gratuit/i }).first();
  await cta.click();
  await page.waitForURL(/\/login\?mode=register/, { timeout: 8000 });
  await page.getByRole('button', { name: /S'inscrire avec Google/i }).waitFor({ timeout: 8000 });

  const text = await bodyText(page);
  assert(page.url().includes('/login?mode=register'), `URL attendue /login?mode=register, obtenu: ${page.url()}`);
  assert(text.includes("S'inscrire avec Google"), 'bouton Google inscription absent après CTA');
  assert(text.includes('Créer mon compte'), 'bouton e-mail inscription absent après CTA');

  await page.close();
});

await browser.close();

console.log('\n' + '═'.repeat(52));
console.log(`Auth flow tests: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('\nFailures:');
  failures.forEach(f => console.log(`  • ${f}`));
  process.exit(1);
}

console.log('✅ All auth flow tests passed');
