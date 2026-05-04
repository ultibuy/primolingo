/**
 * default-tab.test.js
 *
 * Unit tests for the default tab selection logic (computeDefaultTab).
 * The dashboard should open on the tab with fewer diamonds (level >= 4).
 *
 * Run with:
 *   node tests/default-tab.test.js
 */

const { computeDefaultTab, getRuleLevel } = await import('../src/engine/defaultTab.js');

let passCount = 0;
let failCount = 0;
const failures = [];

function assertEqual(a, b, label) {
  if (a === b) {
    passCount++;
    console.log(`  ✅ ${label} (${JSON.stringify(a)})`);
  } else {
    failCount++;
    failures.push(label);
    console.log(`  ❌ ${label} — expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeRules = (ids) => ids.map(id => ({ id }));
const makeDictees = (ids) => ids.map(id => ({ id }));

// ---------------------------------------------------------------------------
console.log('\n🔹 getRuleLevel');
// ---------------------------------------------------------------------------
assertEqual(getRuleLevel(undefined), 0, 'undefined → 0');
assertEqual(getRuleLevel(null), 0, 'null → 0');
assertEqual(getRuleLevel({ level: 3 }), 3, 'explicit level 3');
assertEqual(getRuleLevel({ level: 4 }), 4, 'explicit level 4 (diamond)');
assertEqual(getRuleLevel({ level: 5 }), 5, 'explicit level 5 (diamond vivant)');
assertEqual(getRuleLevel({ hasDiamond: true, sm2: { interval: 3 } }), 5, 'hasDiamond + sm2 → 5');
assertEqual(getRuleLevel({ hasDiamond: true }), 4, 'hasDiamond sans sm2 → 4');
assertEqual(getRuleLevel({ hasCrown: true }), 3, 'hasCrown → 3');

// ---------------------------------------------------------------------------
console.log('\n🔹 computeDefaultTab — no progress');
// ---------------------------------------------------------------------------
{
  const rules = makeRules(['r1', 'r2', 'r3']);
  const dictees = makeDictees(['d1', 'd2']);
  // No diamonds anywhere → tied → grammaire wins
  assertEqual(computeDefaultTab(rules, dictees, {}), 'grammaire', 'no progress → grammaire (tie)');
}

// ---------------------------------------------------------------------------
console.log('\n🔹 computeDefaultTab — more grammar diamonds → dictee');
// ---------------------------------------------------------------------------
{
  const rules = makeRules(['r1', 'r2', 'r3']);
  const dictees = makeDictees(['d1', 'd2']);
  const rp = {
    r1: { level: 4 },
    r2: { level: 4 },
    r3: { level: 2 },
    // dictees: 0 diamonds
  };
  // grammar: 2 diamonds, dictee: 0 diamonds → dictee has fewer → dictee
  assertEqual(computeDefaultTab(rules, dictees, rp), 'dictee', '2 grammar diamonds, 0 dictee → dictee');
}

// ---------------------------------------------------------------------------
console.log('\n🔹 computeDefaultTab — more dictee diamonds → grammaire');
// ---------------------------------------------------------------------------
{
  const rules = makeRules(['r1', 'r2']);
  const dictees = makeDictees(['d1']);
  const rp = {
    // grammar: 0 diamonds
    r1: { level: 3 },
    r2: { level: 1 },
    // dictee d1 has 2 diamond sub-levels
    'd1-level1': { level: 4 },
    'd1-level2': { level: 5 },
    'd1-level3': { level: 2 },
  };
  // grammar: 0 diamonds, dictee: 2 diamonds → grammar has fewer → grammaire
  assertEqual(computeDefaultTab(rules, dictees, rp), 'grammaire', '0 grammar diamonds, 2 dictee → grammaire');
}

// ---------------------------------------------------------------------------
console.log('\n🔹 computeDefaultTab — equal diamonds → grammaire (tie-break)');
// ---------------------------------------------------------------------------
{
  const rules = makeRules(['r1', 'r2']);
  const dictees = makeDictees(['d1']);
  const rp = {
    r1: { level: 4 },
    'd1-level1': { level: 4 },
  };
  // grammar: 1 diamond, dictee: 1 diamond → tied → grammaire
  assertEqual(computeDefaultTab(rules, dictees, rp), 'grammaire', 'equal diamonds → grammaire');
}

// ---------------------------------------------------------------------------
console.log('\n🔹 computeDefaultTab — dictee diamonds across multiple dictees');
// ---------------------------------------------------------------------------
{
  const rules = makeRules(['r1']);
  const dictees = makeDictees(['d1', 'd2']);
  const rp = {
    r1: { level: 4 },   // 1 grammar diamond
    'd1-level1': { level: 4 },
    'd2-level1': { level: 4 },
    'd2-level2': { level: 5 },
    // dictee total: 3 diamonds
  };
  // grammar: 1, dictee: 3 → grammar has fewer → grammaire
  assertEqual(computeDefaultTab(rules, dictees, rp), 'grammaire', '1 grammar < 3 dictee → grammaire');
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n${passCount} passed, ${failCount} failed`);
if (failures.length > 0) {
  console.log('Failures:');
  failures.forEach(f => console.log(`  - ${f}`));
  process.exit(1);
}
