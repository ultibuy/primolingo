/**
 * Tests Playwright — Dictée flow
 * Vérifie :
 *   1. Tab Dictée cliquable depuis le Dashboard
 *   2. Bouton Commencer ouvre le quiz
 *   3. Bouton Écouter déclenche l'animation ET l'arrête
 *   4. La phrase contextualisée est affichée (pas juste "Écouter")
 *   5. La croix ramène sur le tab Dictée (pas Grammaire)
 *
 * Usage : node tests/dictee-flow.test.cjs
 */

const { chromium } = require('playwright');
const assert = require('assert');

const BASE = 'http://localhost:5174';
const CHILD_ID = 'test-child';
// On localhost the app uses uid='localhost-dev' and localStorage key 'local:progress:uid:childId'
const LOCALHOST_UID = 'localhost-dev';
const PROGRESS_KEY = `local:progress:${LOCALHOST_UID}:${CHILD_ID}`;

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const PROGRESS = {
  userId: 'local',
  createdAt: '2026-01-01',
  // lastActiveDate = yesterday → todayDone=false → greeting with childName is rendered
  streak: { current: 3, longest: 5, lastActiveDate: yesterdayStr() },
  coins: 5000,
  shields: 0,
  shop: { owned: [], equipped: {}, activeBoosts: {}, mysteryImages: {}, inventory: {} },
  milestones: { firstSession: true },
  rules: {},
};

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  // Track audio requests
  const audioReqs = [];
  page.on('request', r => { if (r.url().includes('/audio/dictees/')) audioReqs.push(r.url()); });

  // Inject progress before page load
  // On localhost: auth is auto-bypassed (uid='localhost-dev'), store uses 'local:progress:uid:childId'
  await page.addInitScript(({ key, val, childName }) => {
    localStorage.setItem('debug_child_name', childName);
    localStorage.setItem(key, JSON.stringify(val));
  }, { key: PROGRESS_KEY, val: PROGRESS, childName: 'TestUser' });

  console.log('── 1. Chargement du dashboard ──');
  await page.goto(`${BASE}/play/${CHILD_ID}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=TestUser', { timeout: 10000 });
  console.log('   ✓ Dashboard chargé');

  // ── Test 1 : tab Dictée visible et cliquable ──────────────────────────────
  console.log('── 2. Tab Dictée ──');
  const dicteeTab = page.locator('button', { hasText: /^Dictée$/ });
  await dicteeTab.waitFor({ timeout: 5000 });
  await dicteeTab.click();
  await page.waitForSelector('text=AVENTURIER', { timeout: 5000 });
  console.log('   ✓ Tab Dictée actif, section AVENTURIER visible');

  // ── Test 2 : bouton Commencer ouvre le quiz ───────────────────────────────
  console.log('── 3. Lancement dictée ──');
  const commencer = page.locator('button', { hasText: 'Commencer' }).first();
  await commencer.waitFor({ timeout: 5000 });
  await commencer.click();

  // Wait for quiz to open — the audio button (aria-label "Écouter") signals the quiz is ready
  await page.waitForSelector('button[aria-label*="couter"]', { timeout: 8000 });
  console.log('   ✓ Quiz ouvert');

  // ── Test 3 : bouton audio présent + phrase contextualisée ────────────────
  console.log('── 4. Phrase contextualisée ──');
  await page.waitForTimeout(500);

  // Nouveau design : le bouton est un cercle iconique (pas de texte visible).
  // On le détecte via aria-label.
  const hasAudioBtn = await page.evaluate(() =>
    !!document.querySelector('button[aria-label*="couter"]')
  );
  assert(hasAudioBtn, 'Le bouton audio (aria-label="Écouter") doit être présent');
  console.log('   ✓ Bouton audio présent');

  // Check sentence context — the button lives inside a sentence with surrounding text.
  // Walk up the DOM to find the first ancestor with meaningful text around the button.
  const sentenceContainer = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="couter"]');
    if (!btn) return null;
    let el = btn.parentElement;
    for (let i = 0; i < 6 && el; i++) {
      const txt = (el.innerText || '').replace(/\s+/g, ' ').trim();
      if (txt.length > 10) return txt;
      el = el.parentElement;
    }
    return null;
  });
  console.log(`   Contenu du container audio : "${sentenceContainer?.slice(0, 100)}"`);
  const hasContext = sentenceContainer && sentenceContainer.length > 10;
  assert(hasContext, `La phrase contextualisée doit entourer le bouton (got: "${sentenceContainer}")`);
  console.log('   ✓ Phrase contextualisée présente');

  // ── Test 4 : état isPlaying démarre et s'arrête ──────────────────────────
  // Nouveau design : cercle violet (pas de barres).
  // On détecte isPlaying via animationDuration du ring (0.9s quand playing, 2s idle)
  // et via le background du bouton (--color-primary quand playing, --color-accent idle).
  console.log('── 5. Test bouton audio ──');
  const ecouterBtn = page.locator('button[aria-label*="couter"]').first();
  await ecouterBtn.waitFor({ timeout: 5000 });

  // État idle avant clic
  const ringDurationBefore = await page.evaluate(() => {
    const ring = document.querySelector('button[aria-label*="couter"]')?.previousElementSibling;
    return ring?.style.animationDuration || 'n/a';
  });
  console.log(`   Ring animationDuration avant clic: ${ringDurationBefore}`);

  await ecouterBtn.click();
  await page.waitForTimeout(300);

  // État playing : ring plus rapide, bouton change de background
  const ringDurationAfter = await page.evaluate(() => {
    const ring = document.querySelector('button[aria-label*="couter"]')?.previousElementSibling;
    return ring?.style.animationDuration || 'n/a';
  });
  console.log(`   Ring animationDuration après clic: ${ringDurationAfter}`);

  const btnBgPlaying = await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="couter"]');
    return btn?.style.background || btn?.style.backgroundColor || 'n/a';
  });
  console.log(`   Background bouton (playing): ${btnBgPlaying}`);

  const playingStarted = ringDurationAfter !== ringDurationBefore;
  assert(playingStarted, `Le ring doit accélérer au clic (avant: ${ringDurationBefore}, après: ${ringDurationAfter})`);
  console.log('   ✓ État playing détecté');

  // Attend que la lecture se termine (max 15s) — ring revient à 2s
  let stopped = false;
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(500);
    const dur = await page.evaluate(() => {
      const ring = document.querySelector('button[aria-label*="couter"]')?.previousElementSibling;
      return ring?.style.animationDuration || 'n/a';
    });
    if (dur === ringDurationBefore) { stopped = true; break; }
  }
  assert(stopped, 'Le ring doit revenir à la vitesse idle après la lecture');
  console.log('   ✓ État idle restauré après lecture');

  // ── Test 5 : audio file demandé ──────────────────────────────────────────
  console.log('── 6. Requêtes audio ──');
  if (audioReqs.length > 0) {
    audioReqs.forEach(u => console.log(`   REQ: ${u}`));
  } else {
    console.log('   ⚠ Aucune requête audio (speechSynthesis utilisé ou audioFile manquant)');
  }

  // ── Test 6 : fermeture ramène sur tab Dictée ─────────────────────────────
  console.log('── 7. Fermeture → tab Dictée ──');
  const closeBtn = page.locator('button[aria-label="Fermer"], button:has-text("×"), button.close, [aria-label="Close"]').first();
  // Try aria-label first, then the PopupCloseButton (which is a button with ×)
  const closeCount = await closeBtn.count();
  if (closeCount === 0) {
    // Try clicking the X button by finding button near top-right
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const closeBtn = btns.find(b => b.textContent.trim() === '×' || b.textContent.trim() === '✕' || b.getAttribute('aria-label')?.includes('erm'));
      if (closeBtn) closeBtn.click();
    });
  } else {
    await closeBtn.click();
  }

  await page.waitForTimeout(1000);
  await page.waitForSelector('text=TestUser', { timeout: 5000 });

  // Check active tab = Dictée
  const activeDicteeTab = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const dicteeBtn = btns.find(b => b.textContent.trim() === 'Dictée');
    if (!dicteeBtn) return 'not found';
    return dicteeBtn.style.color || dicteeBtn.style.background || 'found-no-style';
  });
  console.log(`   Tab Dictée style après fermeture: ${activeDicteeTab}`);

  // AVENTURIER should still be visible (dictée tab active)
  const aventurierVisible = await page.evaluate(() =>
    document.body.innerText.includes('AVENTURIER')
  );
  assert(aventurierVisible, 'Après fermeture, le tab Dictée doit être actif (AVENTURIER visible)');
  console.log('   ✓ Tab Dictée conservé après fermeture');

  // ── Bilan ─────────────────────────────────────────────────────────────────
  if (errors.length > 0) {
    console.log('\n⚠ Erreurs JS :');
    errors.forEach(e => console.log(' ', e));
  } else {
    console.log('\n✓ Aucune erreur JS');
  }

  await browser.close();
  console.log('\n✅ Tous les tests passent.');
}

run().catch(e => {
  console.error('\n❌ Test échoué :', e.message);
  process.exit(1);
});
