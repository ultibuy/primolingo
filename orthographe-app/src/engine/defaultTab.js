/**
 * Logic for choosing which dashboard tab to show by default.
 * Opens the tab with fewer diamond-level (>= 4) rules.
 */

export function getRuleLevel(rp) {
  if (!rp) return 0;
  if (rp.level !== undefined) return rp.level;
  if (rp.hasDiamond) return rp.sm2 ? 5 : 4;
  if (rp.hasCrown) return 3;
  if (rp.directUnlocked) return 2;
  if ((rp.guidedSessionsCompleted || 0) >= 1) return 1;
  return 0;
}

export function computeDefaultTab(rules, dictees, progressRules) {
  const rp = progressRules || {};
  const grammarDiamonds = rules.filter(r => getRuleLevel(rp[r.id]) >= 4).length;
  const dicteeDiamonds = dictees.reduce((n, d) =>
    n + ['level1', 'level2', 'level3'].filter(lk => getRuleLevel(rp[`${d.id}-${lk}`]) >= 4).length, 0);
  return dicteeDiamonds < grammarDiamonds ? 'dictee' : 'grammaire';
}
