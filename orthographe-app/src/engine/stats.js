/**
 * stats.js — Centralized stats aggregation for PrimoLingo.
 *
 * Pure JS module. No React imports. All functions are side-effect-free
 * except updateStatsHistory which mutates progress in-place.
 *
 * Stats are stored in progress.statsHistory (max 30 entries):
 *   {
 *     date: 'YYYY-MM-DD',
 *     gTotal: number,   // cumulative grammar sessions all-time
 *     dTotal: number,   // cumulative dictée sessions all-time
 *     l0: number,       // grammar rules not started (level 0)
 *     l1: number,       // bronze (level 1)
 *     l2: number,       // argent (level 2)
 *     l3: number,       // couronne (level 3)
 *     l4: number,       // diamant (level >= 4)
 *   }
 */

import { getToday } from './sm2.js';

const MAX_HISTORY = 30;

/**
 * Get today's date as 'YYYY-MM-DD'.
 */
function todayISO() {
  return getToday();
}

// ---------------------------------------------------------------------------
// computeStatsSnapshot
// ---------------------------------------------------------------------------

/**
 * Compute a snapshot of current stats from the progress object.
 *
 * @param {object} progress - The full progress object
 * @param {Set<string>} grammarRuleIds - Set of all grammar rule IDs
 * @returns {{ date, gTotal, dTotal, l0, l1, l2, l3, l4 }}
 */
export function computeStatsSnapshot(progress, grammarRuleIds, dicteeRuleIds = null) {
  const rules = progress.rules || {};

  let gTotal = 0;
  let dTotal = 0;
  let l0 = 0;
  let l1 = 0;
  let l2 = 0;
  let l3 = 0;
  let l4 = 0;

  // Sum sessions: grammar vs dictée
  for (const [key, rp] of Object.entries(rules)) {
    const sessions = (rp.guidedSessionsCompleted || 0) + (rp.directSessionsCompleted || 0);
    if (grammarRuleIds.has(key)) {
      gTotal += sessions;
    } else {
      dTotal += sessions;
    }
  }

  // Level distribution: iterate all grammar rule IDs (including unstarted ones)
  for (const ruleId of grammarRuleIds) {
    const rp = rules[ruleId];
    const level = rp?.level || 0;
    if (level === 0) l0++;
    else if (level === 1) l1++;
    else if (level === 2) l2++;
    else if (level === 3) l3++;
    else l4++; // level >= 4
  }

  // Dictée level distribution (ol0-ol3, level >= 3 = maîtrisée)
  let ol0 = 0, ol1 = 0, ol2 = 0, ol3 = 0;
  if (dicteeRuleIds) {
    for (const ruleId of dicteeRuleIds) {
      const rp = rules[ruleId];
      const level = rp?.level || 0;
      if (level === 0) ol0++;
      else if (level === 1) ol1++;
      else if (level === 2) ol2++;
      else ol3++; // level >= 3
    }
  }

  // Per-day counts from dailyActivity (reliable, not derived from cumulative deltas)
  const da = progress.dailyActivity || {};
  const isToday = da.date === todayISO();
  const gDay = isToday ? (da.grammarCount || 0) : 0;
  const dDay = isToday ? (da.dicteeCount || 0) : 0;

  return {
    date: todayISO(),
    gTotal,
    dTotal,
    gDay,
    dDay,
    l0, l1, l2, l3, l4,
    ol0, ol1, ol2, ol3,
  };
}

// ---------------------------------------------------------------------------
// updateStatsHistory
// ---------------------------------------------------------------------------

/**
 * Update progress.statsHistory with a new snapshot for today.
 * - If the last entry has today's date: replace it (intra-day update)
 * - Otherwise: append a new entry
 * - Keeps at most MAX_HISTORY (30) entries, dropping oldest first
 *
 * Mutates progress in-place. Returns the modified progress.
 *
 * @param {object} progress - The full progress object (mutated in-place)
 * @param {Set<string>} grammarRuleIds - Set of all grammar rule IDs
 * @returns {object} The modified progress
 */
export function updateStatsHistory(progress, grammarRuleIds, dicteeRuleIds = null) {
  if (!Array.isArray(progress.statsHistory)) {
    progress.statsHistory = [];
  }

  const snapshot = computeStatsSnapshot(progress, grammarRuleIds, dicteeRuleIds);
  const history = progress.statsHistory;

  if (history.length > 0 && history[history.length - 1].date === snapshot.date) {
    // Same day: replace last entry
    history[history.length - 1] = snapshot;
  } else {
    // New day: append
    history.push(snapshot);
  }

  // Trim to max 30 entries (keep most recent)
  if (history.length > MAX_HISTORY) {
    history.splice(0, history.length - MAX_HISTORY);
  }

  return progress;
}

// ---------------------------------------------------------------------------
// computeMaxDailyRecord
// ---------------------------------------------------------------------------

/**
 * Compute the max number of sessions done in a single day over the last N days.
 * Uses statsHistory deltas (gTotal + dTotal) — the same source of truth as the
 * dashboard's "🥇 7j" and "🏆 30j" counters.
 *
 * @param {Array} statsHistory - progress.statsHistory
 * @param {number} days - look-back window (7, 30, etc.)
 * @returns {number}
 */
export function computeMaxDailyRecord(statsHistory, days) {
  if (!Array.isArray(statsHistory) || statsHistory.length < 2) return 0;
  const slice = statsHistory.slice(-(days + 1));
  let max = 0;
  for (let i = 1; i < slice.length; i++) {
    const entry = slice[i];
    let delta;
    if (entry.gDay !== undefined || entry.dDay !== undefined) {
      delta = (entry.gDay || 0) + (entry.dDay || 0);
    } else {
      delta =
        Math.max(0, (entry.gTotal || 0) - (slice[i - 1].gTotal || 0)) +
        Math.max(0, (entry.dTotal || 0) - (slice[i - 1].dTotal || 0));
    }
    if (delta > max) max = delta;
  }
  return max;
}

// ---------------------------------------------------------------------------
// computeChartDeltas
// ---------------------------------------------------------------------------

/**
 * Convert a cumulative statsHistory into per-day deltas suitable for charting.
 *
 * Uses per-day counts (gDay/dDay) when available (new snapshots). Falls back
 * to cumulative deltas for legacy entries that don't have per-day fields.
 *
 * The first entry has no previous point to compare with, so its delta is 0 —
 * we can't know how many sessions happened "on that day" vs. before it.
 *
 * @param {Array} statsHistory
 * @returns {Array<{ date, grammaire, dictee }>}
 */
export function computeChartDeltas(statsHistory) {
  return statsHistory.map((entry, i) => {
    // Prefer per-day counts (accurate, not affected by rule categorization changes)
    if (entry.gDay !== undefined || entry.dDay !== undefined) {
      return { date: entry.date, grammaire: entry.gDay || 0, dictee: entry.dDay || 0 };
    }
    // Fallback: compute from cumulative totals (legacy entries)
    const prev = i > 0 ? statsHistory[i - 1] : null;
    const grammaire = prev ? Math.max(0, (entry.gTotal || 0) - (prev.gTotal || 0)) : 0;
    const dictee    = prev ? Math.max(0, (entry.dTotal || 0) - (prev.dTotal || 0)) : 0;
    return { date: entry.date, grammaire, dictee };
  });
}

// ---------------------------------------------------------------------------
// getPrecomputedStats
// ---------------------------------------------------------------------------

/**
 * Returns pre-computed stats from the last snapshot for use in coaching arcs.
 * Falls back to zeros if no history is available.
 *
 * @param {object} progress - The full progress object
 * @returns {{
 *   totalSessions: number,
 *   grammarSessions: number,
 *   dicteeSessions: number,
 *   rulesAtLevel3Plus: number,
 *   rulesAtLevel4Plus: number,
 *   rulesStarted: number,
 * }}
 */
export function getPrecomputedStats(progress) {
  const history = progress.statsHistory;

  if (!Array.isArray(history) || history.length === 0) {
    return {
      totalSessions: 0,
      grammarSessions: 0,
      dicteeSessions: 0,
      rulesAtLevel3Plus: 0,
      rulesAtLevel4Plus: 0,
      rulesStarted: 0,
    };
  }

  const last = history[history.length - 1];
  const grammarSessions = last.gTotal || 0;
  const dicteeSessions = last.dTotal || 0;

  return {
    totalSessions: grammarSessions + dicteeSessions,
    grammarSessions,
    dicteeSessions,
    rulesAtLevel3Plus: (last.l3 || 0) + (last.l4 || 0),
    rulesAtLevel4Plus: last.l4 || 0,
    rulesStarted: (last.l1 || 0) + (last.l2 || 0) + (last.l3 || 0) + (last.l4 || 0),
  };
}
