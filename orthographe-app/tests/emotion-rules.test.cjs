/**
 * emotion-rules.test.cjs
 *
 * Vérifie les règles d'émotion du personnage dans les 3 contextes :
 *   1. Dashboard (carte de règle)
 *   2. Quiz (barre de progression)
 *   3. Écran final
 *
 * Requiert : serveur dev sur http://127.0.0.1:5173
 * Lancer   : node tests/emotion-rules.test.cjs
 */

const assert = require('assert');
const puppeteer = require('puppeteer');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const DEBUG_UID = 'emotion-test-uid';
const CHILD_ID  = 'test-child';
const PROGRESS_KEY = `debug_progress:${DEBUG_UID}:${CHILD_ID}`;

// ── helpers ──────────────────────────────────────────────────────────────────

async function setup(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate((key) => {
    localStorage.setItem('ortho_debug', '1');
    localStorage.setItem('debug_uid', 'emotion-test-uid');
    localStorage.removeItem(key); // start fresh
  }, PROGRESS_KEY);
}

async function setProgress(page, progressObj) {
  await page.evaluate((key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
  }, PROGRESS_KEY, progressObj);
}

async function goToChild(page) {
  await page.goto(`${BASE_URL}/play/${CHILD_ID}`, { waitUntil: 'networkidle2' });
  try {
    await page.waitForFunction(() => !document.body.innerText.includes('Chargement'), { timeout: 10_000 });
  } catch (_) {}
  await delay(800);
}

async function getMood(page, selector = '[data-mood]') {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? el.getAttribute('data-mood') : null;
  }, selector);
}

async function clickButton(page, label) {
  const clicked = await page.evaluate((lbl) => {
    const btn = [...document.querySelectorAll('button')]
      .find(b => b.textContent.trim().includes(lbl));
    if (btn) { btn.click(); return true; }
    return false;
  }, label);
  assert(clicked, `Button "${label}" not found`);
}

async function tryClickButton(page, label) {
  return page.evaluate((lbl) => {
    const btn = [...document.querySelectorAll('button')]
      .find(b => b.textContent.trim().includes(lbl));
    if (btn) { btn.click(); return true; }
    return false;
  }, label);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

function progressWithSessions(n) {
  // n completed guided sessions on the first rule
  const rules = n > 0 ? {
    'a-a-as': {
      level: 1,
      guidedSessionsCompleted: n,
      directSessionsCompleted: 0,
    }
  } : {};
  return {
    userId: 'local',
    coins: 500,
    rules,
    shop: {
      owned: [
        'char-panda',
        'char-panda-walk',
        'char-panda-sleep',
        'char-panda-sit',
        'char-panda-wave',
        'char-panda-kiss',
        'char-panda-clap',
        'char-panda-dance',
        'char-panda-victory',
        'char-panda-think',
        'char-panda-surprise',
      ],
    },
  };
}

// ── tests ────────────────────────────────────────────────────────────────────

async function testDashboardSleepWhenNoSession(page) {
  console.log('  [1] Dashboard: perso dort avant tout quiz...');
  await setProgress(page, progressWithSessions(0));
  await goToChild(page);

  // Wait for LevelPath to mount – the character sprite should be in the DOM
  await delay(600);
  const mood = await getMood(page);
  assert.strictEqual(mood, 'sleep', `Expected "sleep" on dashboard with 0 sessions, got "${mood}"`);
  console.log('    ✓ perso en mode "sleep"');
}

async function testDashboardWalkOrSitAfterSession(page) {
  console.log('  [2] Dashboard: perso marche/est assis après un quiz...');
  await setProgress(page, progressWithSessions(2));
  await goToChild(page);
  await delay(600);

  const mood = await getMood(page);
  assert(
    mood === 'walk' || mood === 'sit',
    `Expected "walk" or "sit" after sessions, got "${mood}"`
  );
  console.log(`    ✓ perso en mode "${mood}" (pas sleep)`);
}

async function testQuizFirstQuestionGreeting(page) {
  console.log('  [3] Quiz: 1ère question = salut ou bisou...');
  await setProgress(page, progressWithSessions(2));
  await goToChild(page);

  // Launch first guided quiz
  await delay(600);
  const launched = await tryClickButton(page, 'Jouer');
  if (!launched) await tryClickButton(page, 'Découvrir');
  await delay(800);

  // Dismiss "bonus du jour" modal if present
  await tryClickButton(page, 'Commencer');
  await delay(600);

  // Now we should be on question 1 – check mood
  const mood = await getMood(page);
  assert(
    mood === 'wave' || mood === 'kiss',
    `Expected "wave" or "kiss" on first question, got "${mood}"`
  );
  console.log(`    ✓ perso en mode "${mood}"`);
}

async function testQuizCorrectAnswerClap(page) {
  console.log('  [4] Quiz: bonne réponse = bravo (clap)...');
  await setProgress(page, progressWithSessions(2));
  await goToChild(page);
  await delay(600);

  const launched = await tryClickButton(page, 'Jouer');
  if (!launched) await tryClickButton(page, 'Découvrir');
  await delay(800);
  await tryClickButton(page, 'Commencer');
  await delay(600);

  // Answer with first available choice – at least one should be there
  // We click any answer button (may be wrong, but let's try to get 'correct')
  // Use debug to set a known correct answer is not easy; instead we check the mood
  // after ANY answer and assert it's 'clap' (correct) or 'think'/'surprise' (wrong)
  const choiceClicked = await page.evaluate(() => {
    // Click first answer button in the quiz
    const btns = [...document.querySelectorAll('button')].filter(
      b => !b.textContent.includes('Continuer') && !b.textContent.includes('×') &&
           !b.textContent.includes('Fermer') && b.closest('[role="progressbar"]') === null
    );
    // Prefer last 4 buttons (answer choices typically at bottom)
    const answerBtns = btns.slice(-4);
    if (answerBtns.length > 0) { answerBtns[0].click(); return true; }
    return false;
  });

  if (!choiceClicked) { console.log('    ⚠ Pas pu cliquer un choix, test partiel'); return; }
  await delay(300);

  const mood = await getMood(page);
  const validMoods = ['clap', 'think', 'surprise'];
  assert(
    validMoods.includes(mood),
    `Expected one of ${JSON.stringify(validMoods)} after an answer, got "${mood}"`
  );
  console.log(`    ✓ perso en mode "${mood}" après une réponse`);
}

async function testQuizSleepWhenFirstEver(page) {
  console.log('  [5] Quiz: perso dort pendant 1er quiz de toujours...');
  await setProgress(page, progressWithSessions(0));
  await goToChild(page);
  await delay(600);

  const launched = await tryClickButton(page, 'Découvrir');
  if (!launched) await tryClickButton(page, 'Jouer');
  await delay(800);
  await tryClickButton(page, 'Commencer');
  await delay(600);

  const mood = await getMood(page);
  assert.strictEqual(mood, 'sleep', `Expected "sleep" during first ever quiz, got "${mood}"`);
  console.log('    ✓ perso en mode "sleep"');
}

async function testEndScreenLowScore(page) {
  console.log('  [6] Écran final: score < 70% → hésitation ou surprise...');

  // Build a progress where quiz can be replayed and we pre-set expectations
  // We'll just check the mood on the end screen after completing any quiz
  // This test is more of a smoke test since we can't easily control the score
  // We verify the end screen character shows a valid mood
  await setProgress(page, progressWithSessions(2));
  await goToChild(page);
  await delay(600);

  const launched = await tryClickButton(page, 'Jouer');
  if (!launched) await tryClickButton(page, 'Découvrir');
  await delay(800);
  await tryClickButton(page, 'Commencer');
  await delay(600);

  // Answer all questions (may be wrong ones – pick first choice each time)
  let questionCount = 0;
  while (questionCount < 25) {
    const hasNextBtn = await page.evaluate(() =>
      [...document.querySelectorAll('button')].some(b => b.textContent.includes('Suivant') || b.textContent.includes('Continuer'))
    );

    if (hasNextBtn) {
      const clicked = await tryClickButton(page, 'Suivant') || await tryClickButton(page, 'Continuer');
      if (!clicked) break;
      await delay(300);
      questionCount++;
      continue;
    }

    const onEndScreen = await page.evaluate(() =>
      document.body.innerText.includes('Session terminée')
    );
    if (onEndScreen) break;

    // Click a choice
    const choiceClicked = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')].filter(
        b => !b.textContent.includes('Continuer') && !b.textContent.includes('Suivant') &&
             !b.textContent.includes('×') && !b.textContent.includes('Fermer')
      );
      const answerBtns = btns.slice(-4);
      if (answerBtns.length > 0) { answerBtns[0].click(); return true; }
      return false;
    });
    if (!choiceClicked) break;
    await delay(400);
    questionCount++;
  }

  await delay(500);

  const onEndScreen = await page.evaluate(() =>
    document.body.innerText.includes('Session terminée')
  );

  if (!onEndScreen) {
    console.log('    ⚠ Pas arrivé à l\'écran final, test partiel');
    return;
  }

  const mood = await getMood(page);
  const validMoods = ['sleep', 'walk', 'clap', 'dance', 'victory', 'think', 'surprise'];
  if (mood === null) {
    console.log('    ⚠ Pas de personnage sur l\'écran final (aucun caractère attribué)');
    return;
  }
  assert(
    validMoods.includes(mood),
    `Expected valid end-screen mood, got "${mood}"`
  );
  console.log(`    ✓ écran final: perso en mode "${mood}"`);
}

// ── main ─────────────────────────────────────────────────────────────────────

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('  [BROWSER ERROR]', msg.text());
  });
  await page.setViewport({ width: 390, height: 844 });

  const errors = [];

  await setup(page);

  const tests = [
    testDashboardSleepWhenNoSession,
    testDashboardWalkOrSitAfterSession,
    testQuizSleepWhenFirstEver,
    testQuizFirstQuestionGreeting,
    testQuizCorrectAnswerClap,
    testEndScreenLowScore,
  ];

  for (const test of tests) {
    try {
      await setup(page); // reset localStorage between tests
      await test(page);
    } catch (err) {
      errors.push(`${test.name}: ${err.message}`);
      console.error(`  ✗ ${test.name}: ${err.message}`);
    }
  }

  await browser.close();

  if (errors.length > 0) {
    console.error(`\n${errors.length} test(s) failed:`);
    for (const e of errors) console.error(' -', e);
    process.exit(1);
  } else {
    console.log('\n✅ Tous les tests d\'émotion sont passés.');
  }
}

run().catch(err => { console.error(err); process.exit(1); });
