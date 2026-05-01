/**
 * stats.test.js
 *
 * Unit tests for src/engine/stats.js
 * Uses the same minimal test harness as coaching-banner.test.js.
 *
 * Run with:
 *   node tests/stats.test.js
 */

const {
  computeStatsSnapshot,
  updateStatsHistory,
  getPrecomputedStats,
  computeChartDeltas,
} = await import('../src/engine/stats.js');

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
    console.error(e);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const GRAMMAR_IDS = new Set(['a-a-as', 'ces-ses', 'ou-ou', 'leur-leurs', 'er-e-ez-ais-ait']);

function makeProgress(overrides = {}) {
  return {
    userId: 'test',
    rules: {},
    ...overrides,
  };
}

function makeRuleProgress(level, guided = 0, direct = 0) {
  return {
    level,
    guidedSessionsCompleted: guided,
    directSessionsCompleted: direct,
  };
}

// ---------------------------------------------------------------------------
// 1. computeStatsSnapshot — profil vierge
// ---------------------------------------------------------------------------
describe('1. computeStatsSnapshot — profil vierge', () => {
  const progress = makeProgress();
  const snap = computeStatsSnapshot(progress, GRAMMAR_IDS);

  assert(typeof snap.date === 'string' && snap.date.length === 10, 'date is YYYY-MM-DD string');
  assertEqual(snap.gTotal, 0, 'gTotal is 0');
  assertEqual(snap.dTotal, 0, 'dTotal is 0');
  assertEqual(snap.l0, 5, 'l0 = 5 (all grammar rules unstarted)');
  assertEqual(snap.l1, 0, 'l1 is 0');
  assertEqual(snap.l2, 0, 'l2 is 0');
  assertEqual(snap.l3, 0, 'l3 is 0');
  assertEqual(snap.l4, 0, 'l4 is 0');
});

// ---------------------------------------------------------------------------
// 2. computeStatsSnapshot — profil avancé
// ---------------------------------------------------------------------------
describe('2. computeStatsSnapshot — profil avancé', () => {
  const progress = makeProgress({
    rules: {
      'a-a-as': makeRuleProgress(1, 3, 0),       // bronze, 3 grammar sessions
      'ces-ses': makeRuleProgress(2, 2, 1),       // argent, 3 grammar sessions
      'ou-ou': makeRuleProgress(3, 1, 3),         // couronne, 4 grammar sessions
      'leur-leurs': makeRuleProgress(4, 2, 2),    // diamant, 4 grammar sessions
      // er-e-ez-ais-ait: not started → l0
    },
  });
  const snap = computeStatsSnapshot(progress, GRAMMAR_IDS);

  assertEqual(snap.gTotal, 14, 'gTotal = 3+3+4+4 = 14');
  assertEqual(snap.dTotal, 0, 'dTotal = 0 (no dictée)');
  assertEqual(snap.l0, 1, 'l0 = 1 (er-e-ez not started)');
  assertEqual(snap.l1, 1, 'l1 = 1 (a-a-as)');
  assertEqual(snap.l2, 1, 'l2 = 1 (ces-ses)');
  assertEqual(snap.l3, 1, 'l3 = 1 (ou-ou)');
  assertEqual(snap.l4, 1, 'l4 = 1 (leur-leurs)');
  assertEqual(snap.l0 + snap.l1 + snap.l2 + snap.l3 + snap.l4, GRAMMAR_IDS.size, 'levels sum to total grammar rules');
});

// ---------------------------------------------------------------------------
// 3. computeStatsSnapshot — distingue grammaire vs dictée
// ---------------------------------------------------------------------------
describe('3. computeStatsSnapshot — distingue grammaire vs dictée', () => {
  const progress = makeProgress({
    rules: {
      'a-a-as': makeRuleProgress(1, 2, 1),          // grammar: 3 sessions
      'dictee-01-level1': makeRuleProgress(0, 5, 2), // dictée: 7 sessions
      'dictee-02-level1': makeRuleProgress(0, 3, 0), // dictée: 3 sessions
    },
  });
  const snap = computeStatsSnapshot(progress, GRAMMAR_IDS);

  assertEqual(snap.gTotal, 3, 'gTotal = 3 (only grammar sessions)');
  assertEqual(snap.dTotal, 10, 'dTotal = 7+3 = 10 (dictée sessions)');
  assertEqual(snap.l0, 4, 'l0 = 4 (4 grammar rules unstarted)');
  assertEqual(snap.l1, 1, 'l1 = 1 (a-a-as at level 1)');
});

// ---------------------------------------------------------------------------
// 4. updateStatsHistory — première entrée
// ---------------------------------------------------------------------------
describe('4. updateStatsHistory — première entrée', () => {
  const progress = makeProgress();
  updateStatsHistory(progress, GRAMMAR_IDS);

  assert(Array.isArray(progress.statsHistory), 'statsHistory is an array');
  assertEqual(progress.statsHistory.length, 1, 'one entry after first call');
  assert(typeof progress.statsHistory[0].date === 'string', 'entry has date');
  assertEqual(progress.statsHistory[0].gTotal, 0, 'gTotal is 0');
});

// ---------------------------------------------------------------------------
// 5. updateStatsHistory — même jour → remplace (pas de doublon)
// ---------------------------------------------------------------------------
describe('5. updateStatsHistory — même jour → remplace', () => {
  const today = new Date().toISOString().slice(0, 10);
  const progress = makeProgress({
    statsHistory: [{ date: today, gTotal: 5, dTotal: 0, l0: 5, l1: 0, l2: 0, l3: 0, l4: 0 }],
    rules: {
      'a-a-as': makeRuleProgress(1, 3, 2), // 5 sessions
    },
  });

  updateStatsHistory(progress, GRAMMAR_IDS);

  assertEqual(progress.statsHistory.length, 1, 'still 1 entry (no duplicate for same day)');
  assertEqual(progress.statsHistory[0].gTotal, 5, 'gTotal updated to 5');
  assertEqual(progress.statsHistory[0].l1, 1, 'l1 = 1 after update');
});

// ---------------------------------------------------------------------------
// 6. updateStatsHistory — jour suivant → ajoute une entrée
// ---------------------------------------------------------------------------
describe('6. updateStatsHistory — jour suivant → ajoute', () => {
  const yesterday = '2026-04-28';
  const progress = makeProgress({
    statsHistory: [{ date: yesterday, gTotal: 3, dTotal: 0, l0: 5, l1: 0, l2: 0, l3: 0, l4: 0 }],
  });

  updateStatsHistory(progress, GRAMMAR_IDS);

  assertEqual(progress.statsHistory.length, 2, '2 entries after adding today');
  assertEqual(progress.statsHistory[0].date, yesterday, 'first entry is yesterday');
  assert(progress.statsHistory[1].date !== yesterday, 'second entry is a different date');
});

// ---------------------------------------------------------------------------
// 7. updateStatsHistory — max 30 jours
// ---------------------------------------------------------------------------
describe('7. updateStatsHistory — max 30 jours', () => {
  // Fill with 30 entries from the past
  const oldHistory = Array.from({ length: 30 }, (_, i) => ({
    date: `2025-${String(i + 1).padStart(2, '0')}-01`,
    gTotal: i,
    dTotal: 0,
    l0: 5,
    l1: 0,
    l2: 0,
    l3: 0,
    l4: 0,
  }));

  const progress = makeProgress({ statsHistory: oldHistory });
  updateStatsHistory(progress, GRAMMAR_IDS);

  assertEqual(progress.statsHistory.length, 30, 'capped at 30 entries');
  // The oldest entry should have been dropped
  assert(progress.statsHistory[0].date !== '2025-01-01', 'oldest entry was dropped');
});

// ---------------------------------------------------------------------------
// 8. getPrecomputedStats — retourne les bonnes valeurs
// ---------------------------------------------------------------------------
describe('8. getPrecomputedStats — retourne les bonnes valeurs', () => {
  const progress = makeProgress({
    statsHistory: [{
      date: '2026-04-29',
      gTotal: 20,
      dTotal: 8,
      l0: 1,
      l1: 1,
      l2: 1,
      l3: 1,
      l4: 1,
    }],
  });

  const stats = getPrecomputedStats(progress);

  assertEqual(stats.totalSessions, 28, 'totalSessions = 20+8');
  assertEqual(stats.grammarSessions, 20, 'grammarSessions = 20');
  assertEqual(stats.dicteeSessions, 8, 'dicteeSessions = 8');
  assertEqual(stats.rulesAtLevel3Plus, 2, 'rulesAtLevel3Plus = l3+l4 = 2');
  assertEqual(stats.rulesAtLevel4Plus, 1, 'rulesAtLevel4Plus = l4 = 1');
  assertEqual(stats.rulesStarted, 4, 'rulesStarted = l1+l2+l3+l4 = 4');
});

// ---------------------------------------------------------------------------
// 9. getPrecomputedStats — fallback quand pas de stats
// ---------------------------------------------------------------------------
describe('9. getPrecomputedStats — fallback sans statsHistory', () => {
  const stats1 = getPrecomputedStats(makeProgress());
  assertEqual(stats1.totalSessions, 0, 'totalSessions = 0 (no history)');
  assertEqual(stats1.grammarSessions, 0, 'grammarSessions = 0');
  assertEqual(stats1.dicteeSessions, 0, 'dicteeSessions = 0');
  assertEqual(stats1.rulesAtLevel3Plus, 0, 'rulesAtLevel3Plus = 0');
  assertEqual(stats1.rulesAtLevel4Plus, 0, 'rulesAtLevel4Plus = 0');
  assertEqual(stats1.rulesStarted, 0, 'rulesStarted = 0');

  const stats2 = getPrecomputedStats(makeProgress({ statsHistory: [] }));
  assertEqual(stats2.totalSessions, 0, 'totalSessions = 0 (empty history)');
});

// ---------------------------------------------------------------------------
// 10. computeChartDeltas — première entrée vaut 0, pas le cumulatif
// ---------------------------------------------------------------------------
describe('10. computeChartDeltas — première entrée = 0 (pas le cumulatif)', () => {
  const history = [
    { date: '2026-04-28', gTotal: 100, dTotal: 20 },
    { date: '2026-04-29', gTotal: 103, dTotal: 21 },
    { date: '2026-04-30', gTotal: 106, dTotal: 23 },
  ];
  const deltas = computeChartDeltas(history);

  assertEqual(deltas[0].grammaire, 0, 'première entrée grammaire = 0 (cumul ignoré)');
  assertEqual(deltas[0].dictee, 0, 'première entrée dictée = 0 (cumul ignoré)');
  assertEqual(deltas[1].grammaire, 3, 'delta jour 2 grammaire = 103-100');
  assertEqual(deltas[1].dictee, 1, 'delta jour 2 dictée = 21-20');
  assertEqual(deltas[2].grammaire, 3, 'delta jour 3 grammaire = 106-103');
  assertEqual(deltas[2].dictee, 2, 'delta jour 3 dictée = 23-21');

  const weekTotal = deltas.reduce((s, d) => s + d.grammaire + d.dictee, 0);
  assertEqual(weekTotal, 9, 'total semaine = 3+1+3+2 = 9 (pas 120+9 = 129)');
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
