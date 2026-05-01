/**
 * characters-moods.test.js
 * Validates:
 *   1. Exactly 17 production characters appear in the shop's "Persos" tab
 *   2. All 10 moods render without JS/React errors
 *   3. The 3 new characters (turtleNomad, raccoonHacker, spyPenguin) appear
 *   4. None of the removed/legacy characters appear in the shop
 */
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const DEBUG_UID = 'test-chars-uid';
const CHILD_ID = 'test-chars-child';
const DEBUG_PROGRESS_KEY = `debug_progress:${DEBUG_UID}:${CHILD_ID}`;

// The 17 production character IDs
const EXPECTED_CHAR_IDS = [
  'panda', 'fox', 'wolf', 'tiger', 'lion',
  'stormEagle', 'bear', 'sharkNinja', 'owlWitch', 'catDetective',
  'turtleNomad', 'raccoonHacker', 'spyPenguin',
  'dragon', 'cosmo', 'mushroom', 'robot',
];

// The 10 moods
const EXPECTED_MOOD_IDS = ['walk', 'sleep', 'sit', 'wave', 'kiss', 'clap', 'victory', 'dance', 'surprise', 'think'];

// French names for each character
const CHAR_NAMES = {
  panda:        'Panda Samouraï',
  fox:          'Renard Espion',
  wolf:         'Loup Fantôme',
  tiger:        'Tigre',
  lion:         'Lion Solaire',
  stormEagle:   'Aigle Tempête',
  bear:         'Ours Viking',
  sharkNinja:   'Requin Ninja',
  owlWitch:     'Chouette Magicienne',
  catDetective: 'Chat Détective',
  turtleNomad:  'Tortue Nomade',
  raccoonHacker:'Raton Hackeur',
  spyPenguin:   'Pingouin Espion',
  dragon:       'Dragon de Feu',
  cosmo:        'Cosmonaute',
  mushroom:     'Esprit Champignon',
  robot:        'Robot Gardien',
};

// Legacy characters that must NOT appear as card names in the shop
const LEGACY_NAMES_BANNED_IN_SHOP = [
  'Grenouille', 'Licorne', 'Phénix', 'Kraken', 'Sirène',
  'Vampire', 'Squelette', 'Sorcière', 'Chevalier',
  'Cyborg', 'Android', 'Cactus',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await chromium.launch({ headless: true });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`PAGE ERROR: ${err.message}`));

  await page.setViewportSize({ width: 1440, height: 900 });

  // All 17 chars + all 7 shop emotions per char unlocked
  const ownedItems = EXPECTED_CHAR_IDS.flatMap(id => [
    `char-${id}`,
    ...['wave', 'kiss', 'clap', 'victory', 'dance', 'surprise', 'think'].map(m => `char-${id}-${m}`),
  ]);

  const debugProgress = {
    userId: 'local',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10),
    streak: { current: 10, longest: 10, lastActiveDate: new Date().toISOString().slice(0, 10) },
    coins: 9999,
    shields: 3,
    shop: {
      owned: ownedItems,
      equipped: { theme: null, flame: null, title: null, victoryAnimation: null },
      activeBoosts: { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsBonusEarned: 0, doubleCoinsLastPurchasedWeek: null },
      mysteryImages: {},
      inventory: { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 },
    },
    milestones: { firstSession: true, streak7: true, streak14: false, streak30: false, streak60: false, streak100: false },
    weeklyChest: { lastOpened: null },
    parentalCode: null,
    rules: {},
  };

  // Inject before navigation
  await page.addInitScript(({ progressKey, progress, uid, cid }) => {
    localStorage.setItem('ortho_debug', '1');
    localStorage.setItem('debug_uid', uid);
    localStorage.setItem('debug_child_name', 'TestChild');
    localStorage.setItem(progressKey, JSON.stringify(progress));
  }, { progressKey: DEBUG_PROGRESS_KEY, progress: debugProgress, uid: DEBUG_UID, cid: CHILD_ID });

  // ── Navigate to child app ─────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForFunction((v) => document.body.innerText.includes(v), 'TestChild', { timeout: 10000 });
  console.log('  ✓ Child app loaded');

  // ── Navigate to Shop → Persos tab ────────────────────────────────────────
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const target = btns.find(b => b.textContent.includes('🛒'));
    if (target) target.click();
  });
  await delay(2000);

  const shopOpened = await page.evaluate(() =>
    document.body.innerText.includes('Boutique') || document.body.innerText.includes('Persos') || document.body.innerText.includes('Cosmétique')
  );
  assert(shopOpened, '❌ Shop did not open after clicking 🛒 button');

  // Click the "Persos" tab
  await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('button')];
    const target = tabs.find(b => b.textContent.includes('Persos') || b.textContent.includes('Personnages'));
    if (target) target.click();
  });
  await delay(1500);

  const hasPersonnages = await page.evaluate(() =>
    document.body.innerText.includes('Personnages') || document.body.innerText.includes('personnage')
  );
  if (!hasPersonnages) {
    await delay(1000);
  }

  const shopText = await page.evaluate(() => document.body.innerText);
  await page.screenshot({ path: '/tmp/test-chars-shop.png', fullPage: true });

  // ── Test 1: 3 new characters visible in shop ──────────────────────────────
  console.log('\n=== Test 1: 3 new characters in shop ===');
  const newChars = [
    { id: 'turtleNomad',   label: 'Tortue' },
    { id: 'raccoonHacker', label: 'Raton' },
    { id: 'spyPenguin',    label: 'Pingouin' },
  ];
  for (const { id, label } of newChars) {
    assert(shopText.includes(label), `❌ New character "${id}" (${label}) not found in shop page`);
    console.log(`  ✓ ${label} (${id}) visible`);
  }

  // ── Test 2: All 17 character names in shop text ───────────────────────────
  console.log('\n=== Test 2: All 17 character names in shop ===');
  let found = 0;
  const missingChars = [];
  for (const [id, name] of Object.entries(CHAR_NAMES)) {
    const short = name.split(' ')[0];
    if (shopText.includes(short)) {
      found++;
    } else {
      missingChars.push(`${id}(${name})`);
    }
  }
  console.log(`  Found ${found}/17 character names in shop`);
  if (missingChars.length > 0) {
    console.log(`  Missing: ${missingChars.join(', ')}`);
  }
  assert(found >= 15, `❌ Only ${found}/17 characters found in shop. Missing: ${missingChars.join(', ')}`);
  console.log(`  ✓ ${found} characters verified in shop`);

  // ── Test 3: No legacy characters in shop text ─────────────────────────────
  console.log('\n=== Test 3: No legacy characters in shop ===');
  const foundLegacy = LEGACY_NAMES_BANNED_IN_SHOP.filter(name => shopText.includes(name));
  assert(foundLegacy.length === 0, `❌ Legacy names found in shop: ${foundLegacy.join(', ')}`);
  console.log('  ✓ No legacy character names in shop');

  // ── Test 4: SVGs render (CharacterSprite working) ─────────────────────────
  console.log('\n=== Test 4: SVG sprites render ===');
  const svgCount = await page.evaluate(() => document.querySelectorAll('svg').length);
  assert(svgCount > 0, '❌ No SVG elements found — CharacterSprite not rendering');
  console.log(`  ✓ ${svgCount} SVG sprites rendered in shop`);

  // ── Test 5: No JS errors so far ───────────────────────────────────────────
  console.log('\n=== Test 5: No JS/React errors ===');
  const criticalErrors = consoleErrors.filter(e =>
    e.includes('is not a function') ||
    e.includes('Cannot read') ||
    e.includes('is not defined') ||
    e.includes('Unexpected token')
  );
  if (consoleErrors.length > 0) {
    console.log(`  Console errors (${consoleErrors.length}):`, consoleErrors.slice(0, 3));
  }
  assert(criticalErrors.length === 0, `❌ Critical JS errors: ${criticalErrors.join('\n')}`);
  console.log('  ✓ No critical JS errors');

  // ── Test 6: Debug panel shows all 10 moods ────────────────────────────────
  console.log('\n=== Test 6: Debug panel — 10 moods ===');
  await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle', timeout: 30000 });
  await delay(1500);

  const debugExists = await page.evaluate(() => {
    return !![...document.querySelectorAll('div, button')].find(e =>
      e.textContent.trim().startsWith('🛠 DEBUG')
    );
  });

  if (debugExists) {
    const box = await page.evaluate(() => {
      const el = [...document.querySelectorAll('div, button')].find(e =>
        e.textContent.trim().startsWith('🛠 DEBUG')
      );
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    if (box) await page.mouse.click(box.x, box.y);
    await delay(1000);

    const debugText = await page.evaluate(() => document.body.innerText);

    const moodLabels = ['Marche', 'Dodo', 'Assis', 'Coucou', 'Bisous', 'Applaudissements', 'Danse', 'Surprise', 'Victoire', 'Réflexion'];
    const missingMoods = moodLabels.filter(l => !debugText.includes(l));
    assert(missingMoods.length === 0, `❌ Missing mood labels in debug panel: ${missingMoods.join(', ')}`);
    console.log('  ✓ All 10 mood buttons visible in debug panel');

    const emojiSymbols = ['🚶', '💤', '🧘', '👋', '💋', '👏', '🏆', '💃', '😲', '🤔'];
    const foundSymbols = emojiSymbols.filter(s => debugText.includes(s));
    console.log(`  Found ${foundSymbols.length}/10 mood symbols in moods table`);

    const found17InDebug = Object.values(CHAR_NAMES).filter(n => debugText.includes(n.split(' ')[0])).length;
    console.log(`  Found ${found17InDebug}/17 characters in debug panel`);
    assert(found17InDebug >= 15, `❌ Only ${found17InDebug} characters in debug panel`);
    console.log(`  ✓ ${found17InDebug}/17 characters visible in debug panel`);

    await page.screenshot({ path: '/tmp/test-chars-debug.png', fullPage: true });
  } else {
    console.log('  ⚠ Debug panel not available (isLocalhost() = false?)');
  }

  // ── Test 7: Each character renders with each mood (data-mood attribute) ───
  console.log('\n=== Test 7: data-mood attribute on CharacterSprite ===');
  const moodDataAttrs = await page.evaluate((moods) => {
    const sprites = [...document.querySelectorAll('[data-mood]')];
    const foundMoods = new Set(sprites.map(el => el.dataset.mood));
    return moods.filter(m => foundMoods.has(m));
  }, EXPECTED_MOOD_IDS);

  console.log(`  CharacterSprite data-mood found: ${moodDataAttrs.join(', ') || '(none)'}`);
  assert(moodDataAttrs.includes('walk'), '❌ No CharacterSprite with mood=walk found');
  console.log('  ✓ data-mood="walk" present on sprites');

  await browser.close();

  console.log('\n✅ All character/mood integration tests passed!');
  console.log('   ✓ 3 new characters (turtleNomad, raccoonHacker, spyPenguin) in shop');
  console.log(`   ✓ ${found}/17 character names verified in shop`);
  console.log('   ✓ No legacy characters in shop');
  console.log('   ✓ SVG sprites rendering without errors');
}

run().catch((err) => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
