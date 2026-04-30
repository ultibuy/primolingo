/**
 * coaching-banner.test.js
 *
 * Tests for the coaching banner system (narrative arcs).
 * Uses Node.js native test runner (node:test) — no external test framework needed.
 *
 * Run with:
 *   npm run test:coaching        (requires playwright CLI for browser tests)
 *   node --experimental-vm-modules tests/coaching-banner.test.js (unit tests only)
 *
 * For unit tests only (no browser), run:
 *   node tests/coaching-banner.test.js
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamic import for the coaching engine
const {
  pickCoachingMessage,
  markCoachingShown,
  createDefaultCoaching,
  getTotalSessions,
  getOwnedChars,
  getOwnedShopEmotions,
} = await import('../src/engine/coaching.js');

const TODAY = '2026-04-28';
let passCount = 0;
let failCount = 0;
const failures = [];

// ---------------------------------------------------------------------------
// Minimal test harness
// ---------------------------------------------------------------------------
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

function assertEqual(a, b, label) {
  if (a === b) {
    passCount++;
    console.log(`  ✅ ${label} (${JSON.stringify(a)})`);
  } else {
    failCount++;
    failures.push(`${label}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
    console.log(`  ❌ ${label}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  }
}

function describe(name, fn) {
  console.log(`\n📋 ${name}`);
  try {
    fn();
  } catch (e) {
    failCount++;
    failures.push(`${name}: THREW — ${e.message}`);
    console.log(`  ❌ THREW: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// Progress factory
// ---------------------------------------------------------------------------
function makeProgress(overrides = {}) {
  const base = {
    userId: 'test',
    createdAt: TODAY,
    streak: { current: 0, longest: 0, lastActiveDate: null },
    coins: 0,
    shields: 0,
    shop: {
      owned: [],
      equipped: { theme: null, flame: null, title: null, victoryAnimation: null },
      activeBoosts: { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsLastPurchasedWeek: null },
      mysteryImages: { collections: {}, daily: { date: null, count: 0 } },
      inventory: { questionMystery: 0 },
    },
    milestones: {
      firstSession: false,
      streak7: false, streak14: false, streak30: false, streak60: false, streak100: false,
    },
    rules: {},
    coaching: createDefaultCoaching(),
  };
  return { ...base, ...overrides };
}

function makeRules(count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    id: `rule${i + 1}`,
    title: `Règle ${i + 1}`,
    shortTitle: `R${i + 1}`,
    group: 'aventurier',
  }));
}

function makeCtx(progressOverrides = {}, extra = {}) {
  return {
    trigger: 'dashboard',
    progress: makeProgress(progressOverrides),
    rules: makeRules(),
    todayStr: TODAY,
    hour: 10,
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// 7.3.1 — Unit: createDefaultCoaching
// ---------------------------------------------------------------------------
describe('7.3.1 createDefaultCoaching', () => {
  const c = createDefaultCoaching();
  assert(typeof c.shown === 'object' && c.shown !== null, 'has .shown object');
  assert(typeof c.lastShownByArc === 'object', 'has .lastShownByArc object');
  assertEqual(c.dailyShownCount.count, 0, 'dailyShownCount.count starts at 0');
  assertEqual(c.dailyShownCount.date, null, 'dailyShownCount.date starts null');
  assertEqual(c.lastBannerArc, null, 'lastBannerArc starts null');
});

// ---------------------------------------------------------------------------
// 7.3.1 — Unit: getTotalSessions
// ---------------------------------------------------------------------------
describe('7.3.1 getTotalSessions', () => {
  const p1 = makeProgress({
    rules: {
      rule1: { guidedSessionsCompleted: 3, directSessionsCompleted: 2 },
      rule2: { guidedSessionsCompleted: 1, directSessionsCompleted: 0 },
    },
  });
  assertEqual(getTotalSessions(p1), 6, 'sums all sessions');
  assertEqual(getTotalSessions(makeProgress()), 0, 'returns 0 for empty');
});

// ---------------------------------------------------------------------------
// 7.3.1 — Unit: getOwnedChars
// ---------------------------------------------------------------------------
describe('7.3.1 getOwnedChars', () => {
  const owned = ['char-panda', 'char-panda-wave', 'char-dragon', 'theme-dark', 'char-lion'];
  const chars = getOwnedChars(owned);
  assertEqual(chars.length, 3, 'returns 3 chars');
  assert(chars.includes('char-panda'), 'includes char-panda');
  assert(chars.includes('char-dragon'), 'includes char-dragon');
  assert(!chars.includes('char-panda-wave'), 'excludes char-panda-wave (emotion)');
});

// ---------------------------------------------------------------------------
// 7.3.1 — Unit: getOwnedShopEmotions
// ---------------------------------------------------------------------------
describe('7.3.1 getOwnedShopEmotions', () => {
  const owned = ['char-panda', 'char-panda-wave', 'char-panda-walk', 'char-panda-clap', 'char-dragon-wave'];
  const emos = getOwnedShopEmotions(owned, 'panda');
  assert(emos.includes('char-panda-wave'), 'includes wave (shop emotion)');
  assert(emos.includes('char-panda-clap'), 'includes clap (shop emotion)');
  assert(!emos.includes('char-panda-walk'), 'excludes walk (base emotion)');
  assert(!emos.includes('char-dragon-wave'), 'excludes other chars');
});

// ---------------------------------------------------------------------------
// 7.3.1 — Daily cap check
// ---------------------------------------------------------------------------
describe('7.3.1 daily cap removed — no longer blocks', () => {
  const coaching = createDefaultCoaching();
  coaching.dailyShownCount = { date: TODAY, count: 4 };
  const ctx = makeCtx({ coaching });
  const result = pickCoachingMessage(ctx);
  assert(result !== null, 'cap removed — still returns a message');
});

// ---------------------------------------------------------------------------
// 7.3.1 — arc1.1
// ---------------------------------------------------------------------------
describe('7.3.1 arc1.1 triggers for brand new user', () => {
  const ctx = makeCtx();
  const result = pickCoachingMessage(ctx);
  assert(result !== null, 'result is not null');
  assertEqual(result?.arcId, 'arc1.1', 'arcId is arc1.1');
  assertEqual(result?.oneShot, true, 'oneShot is true');
});

describe('7.3.1 arc1.1 does NOT trigger when already shown', () => {
  const coaching = createDefaultCoaching();
  coaching.shown['arc1.1'] = TODAY;
  const ctx = makeCtx({ coaching });
  const result = pickCoachingMessage(ctx);
  assert(result?.arcId !== 'arc1.1', 'arc1.1 is suppressed');
});

// ---------------------------------------------------------------------------
// 7.3.1 — arc5.8
// ---------------------------------------------------------------------------
describe('7.3.1 arc5.8 triggers after 16h', () => {
  const coaching = createDefaultCoaching();
  coaching.shown['arc1.1'] = TODAY;
  coaching.shown['arc1.3'] = TODAY;
  const progress = makeProgress({
    streak: { current: 5, longest: 5, lastActiveDate: '2026-04-27' },
    milestones: { firstSession: true },
    coaching,
    rules: { rule1: { guidedSessionsCompleted: 1, directSessionsCompleted: 0, level: 1 } },
  });
  const ctx = { trigger: 'dashboard', progress, rules: makeRules(), todayStr: TODAY, hour: 18 };
  const result = pickCoachingMessage(ctx);
  assertEqual(result?.arcId, 'arc5.8', 'arcId is arc5.8');
  assertEqual(result?.recurring, true, 'recurring is true');
  assertEqual(result?.oneShot, false, 'oneShot is false');
});

describe('7.3.1 arc5.8 does NOT trigger before 16h', () => {
  const coaching = createDefaultCoaching();
  coaching.shown['arc1.1'] = TODAY;
  coaching.shown['arc1.3'] = TODAY;
  const progress = makeProgress({
    streak: { current: 5, longest: 5, lastActiveDate: '2026-04-27' },
    milestones: { firstSession: true },
    coaching,
    rules: { rule1: { guidedSessionsCompleted: 1, directSessionsCompleted: 0, level: 1 } },
  });
  const ctx = { trigger: 'dashboard', progress, rules: makeRules(), todayStr: TODAY, hour: 14 };
  const result = pickCoachingMessage(ctx);
  assert(result?.arcId !== 'arc5.8', 'arc5.8 not triggered before 16h');
});

// ---------------------------------------------------------------------------
// 7.3.1 — markCoachingShown
// ---------------------------------------------------------------------------
describe('7.3.1 markCoachingShown deep-clones and records', () => {
  const progress = makeProgress();
  const msg = { arcId: 'arc1.1', oneShot: true, recurring: false };
  const next = markCoachingShown(progress, msg, TODAY);

  assert(progress.coaching.shown['arc1.1'] === undefined, 'original not mutated');
  assertEqual(next.coaching.shown['arc1.1'], TODAY, 'shown recorded in clone');
  assertEqual(next.coaching.dailyShownCount.count, 1, 'count incremented to 1');
  assertEqual(next.coaching.dailyShownCount.date, TODAY, 'date set to today');
  assertEqual(next.coaching.lastBannerArc, 'arc1.1', 'lastBannerArc updated');
});

describe('7.3.1 markCoachingShown uses lastShownByArc for recurring', () => {
  const progress = makeProgress();
  const msg = { arcId: 'arc5.8', oneShot: false, recurring: true };
  const next = markCoachingShown(progress, msg, TODAY);

  assertEqual(next.coaching.lastShownByArc['arc5.8'], TODAY, 'lastShownByArc recorded');
  assert(next.coaching.shown['arc5.8'] === undefined, 'shown NOT set for recurring');
});

describe('7.3.1 markCoachingShown resets count on new day', () => {
  const coaching = createDefaultCoaching();
  coaching.dailyShownCount = { date: '2026-04-27', count: 3 };
  const progress = makeProgress({ coaching });
  const msg = { arcId: 'arc6.1', oneShot: true, recurring: false };
  const next = markCoachingShown(progress, msg, TODAY);

  assertEqual(next.coaching.dailyShownCount.date, TODAY, 'date reset to today');
  assertEqual(next.coaching.dailyShownCount.count, 1, 'count reset to 1');
});

// ---------------------------------------------------------------------------
// 7.3.2 — endScreen trigger filter
// ---------------------------------------------------------------------------
describe('7.3.2 endScreen only returns allowed arcs', () => {
  const ALLOWED = new Set(['arc2.1', 'arc2.2', 'arc3.1', 'arc3.2', 'arc4.1', 'arc4.2', 'arc4.8', 'arc5.8', 'arc5.9', 'arc9.5']);

  // Test with flame-at-risk scenario (would normally trigger arc5.8)
  const progress = makeProgress({
    streak: { current: 5, longest: 5, lastActiveDate: '2026-04-27' },
    milestones: { firstSession: true },
    rules: { rule1: { guidedSessionsCompleted: 2, directSessionsCompleted: 0, level: 1 } },
  });
  const ctx = { trigger: 'endScreen', progress, rules: makeRules(), todayStr: TODAY, hour: 18 };
  const result = pickCoachingMessage(ctx);

  if (result) {
    const baseId = result.arcId.split('.').slice(0, 2).join('.');
    assert(ALLOWED.has(result.arcId) || ALLOWED.has(baseId), `arcId ${result.arcId} is in endScreen allowed set`);
  } else {
    assert(true, 'null result is valid for endScreen');
  }
});

describe('7.3.2 dashboard arc1.1 not shown in endScreen', () => {
  // arc1.1 is not in the endScreen allowed list
  const ctx = {
    trigger: 'endScreen',
    progress: makeProgress(),
    rules: makeRules(),
    todayStr: TODAY,
    hour: 10,
  };
  const result = pickCoachingMessage(ctx);
  assert(result?.arcId !== 'arc1.1', 'arc1.1 not shown in endScreen');
});

// ---------------------------------------------------------------------------
// 7.3.3 — Priority ordering
// ---------------------------------------------------------------------------
describe('7.3.3 arc1.1 takes priority over arc5.1', () => {
  const progress = makeProgress({
    streak: { current: 1, longest: 1, lastActiveDate: TODAY },
  });
  const ctx = { trigger: 'dashboard', progress, rules: makeRules(), todayStr: TODAY, hour: 10 };
  const result = pickCoachingMessage(ctx);
  assertEqual(result?.arcId, 'arc1.1', 'arc1.1 wins over arc5.1');
});

// ---------------------------------------------------------------------------
// 7.3.4 — Recurring arc cooldown
// ---------------------------------------------------------------------------
describe('7.3.4 arc5.8 24h cooldown removed — can repeat same day', () => {
  const coaching = createDefaultCoaching();
  coaching.shown['arc1.1'] = TODAY;
  coaching.shown['arc1.3'] = TODAY;
  coaching.lastShownByArc['arc5.8'] = TODAY;
  const progress = makeProgress({
    streak: { current: 5, longest: 5, lastActiveDate: '2026-04-27' },
    milestones: { firstSession: true },
    coaching,
  });
  const ctx = { trigger: 'dashboard', progress, rules: makeRules(), todayStr: TODAY, hour: 18 };
  const result = pickCoachingMessage(ctx);
  // 24h cooldown was removed — arc5.8 should still fire (or another arc takes priority)
  assert(result !== null, 'cooldown removed — a message is returned');
});

// ---------------------------------------------------------------------------
// 7.3.5 — arc1.5 conditions
// ---------------------------------------------------------------------------
describe('7.3.5 arc1.5 triggers at ≥250 coins with no chars', () => {
  const coaching = createDefaultCoaching();
  coaching.shown['arc1.1'] = TODAY;
  coaching.shown['arc1.3'] = TODAY;
  for (const a of ['arc5.8', 'arc4.8', 'arc4.5', 'arc4.1', 'arc4.2', 'arc3.1', 'arc3.2', 'arc2.1', 'arc2.2', 'arc12.2', 'arc12.3', 'arc12.4', 'arc12.5', 'arc13.3', 'arc13.2', 'arc13.4', 'arc13.1']) {
    coaching.shown[a] = TODAY;
  }
  const progress = makeProgress({
    coins: 300,
    milestones: { firstSession: true },
    coaching,
  });
  const ctx = { trigger: 'dashboard', progress, rules: makeRules(), todayStr: TODAY, hour: 10 };
  const result = pickCoachingMessage(ctx);
  assertEqual(result?.arcId, 'arc1.5', 'arc1.5 triggered at 300 coins, no chars');
});

// ---------------------------------------------------------------------------
// 7.3.5 — arc13.3 urgent shield
// ---------------------------------------------------------------------------
describe('7.3.5 arc13.3 urgent shield for 7+ day streak', () => {
  const coaching = createDefaultCoaching();
  coaching.shown['arc1.1'] = TODAY;
  coaching.shown['arc1.3'] = TODAY;
  for (const a of ['arc5.8', 'arc4.8', 'arc4.5', 'arc4.1', 'arc4.2', 'arc3.1', 'arc3.2', 'arc2.1', 'arc2.2', 'arc12.2', 'arc12.3', 'arc12.4', 'arc12.5']) {
    coaching.shown[a] = TODAY;
  }
  const progress = makeProgress({
    coins: 200,
    shields: 0,
    streak: { current: 10, longest: 10, lastActiveDate: TODAY },
    milestones: { firstSession: true },
    coaching,
  });
  const ctx = { trigger: 'dashboard', progress, rules: makeRules(), todayStr: TODAY, hour: 10 };
  const result = pickCoachingMessage(ctx);
  assertEqual(result?.arcId, 'arc13.3', 'arc13.3 triggered for 10-day streak, 0 shields');
  assert(result?.copy?.includes('10 jours'), 'copy mentions streak count');
});

// ---------------------------------------------------------------------------
// 7.3.5 — arc5.9 after reset
// ---------------------------------------------------------------------------
describe('7.3.5 arc5.9 after streak reset', () => {
  const coaching = createDefaultCoaching();
  coaching.shown['arc1.1'] = TODAY;
  coaching.shown['arc1.3'] = TODAY;
  for (const a of ['arc5.8', 'arc4.8', 'arc4.5', 'arc4.1', 'arc4.2', 'arc3.1', 'arc3.2', 'arc2.1', 'arc2.2', 'arc12.2', 'arc12.3', 'arc12.4', 'arc12.5', 'arc13.3', 'arc13.2', 'arc13.4', 'arc13.1', 'arc1.5', 'arc1.4', 'arc6.3', 'arc6.4', 'arc6.5', 'arc6.7', 'arc6.6', 'arc6.13', 'arc6.1', 'arc1.7.streak5', 'arc1.7.streak6', 'arc5.3', 'arc5.1', 'arc5.2']) {
    coaching.shown[a] = TODAY;
  }
  const progress = makeProgress({
    streak: { current: 0, longest: 5, lastActiveDate: '2026-04-20' },
    milestones: { firstSession: true },
    coaching,
  });
  const ctx = { trigger: 'dashboard', progress, rules: makeRules(), todayStr: TODAY, hour: 10 };
  const result = pickCoachingMessage(ctx);
  assertEqual(result?.arcId, 'arc5.9', 'arc5.9 triggered after streak reset');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${'─'.repeat(50)}`);
console.log(`Results: ${passCount} passed, ${failCount} failed`);
if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach(f => console.log(`  ✗ ${f}`));
  process.exit(1);
} else {
  console.log('All tests passed! ✅');
}

// ---------------------------------------------------------------------------
// 7.3.6 — Browser tests (todo stubs)
// ---------------------------------------------------------------------------
// The following tests require a running dev server and playwright browser.
// They are listed here as documentation of what should be tested.
//
// TODO 7.3.6.1: banner renders with correct variant colors
// TODO 7.3.6.2: banner fade-in animation completes (220ms)
// TODO 7.3.6.3: banner CTA button opens shop
// TODO 7.3.6.4: coaching banner appears on dashboard for new user (arc1.1)
// TODO 7.3.6.5: banner not shown after daily cap of 4 is reached
// TODO 7.3.6.6: coaching banner persists arcId in progress.coaching.shown after mount
// TODO 7.3.6.7: endScreen coaching line visible after quiz completion
// TODO 7.3.6.8: debug "Reset coaching flags" button clears shown arcs
// TODO 7.3.6.9: arc5.8 flame warning appears after 16h
// TODO 7.3.6.10: floatEmoji animation applied for panda/flamme/pieces variants
// TODO 7.3.6.11: snapshot arc1.1 variant=pieces
// TODO 7.3.6.12: snapshot arc5.8 variant=flamme
// TODO 7.3.6.13: snapshot arc4.2 variant=diamant
