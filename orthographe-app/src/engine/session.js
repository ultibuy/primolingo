/**
 * Session management — question selection and review stats.
 *
 * V2: No per-question SM-2. Questions are selected randomly with variety bias.
 * SM-2 operates at RULE level only.
 */

import { getToday, calculateDiamondHealth, parseLocalDate } from './sm2.js';

function sessionSize() {
  try { return (typeof window !== 'undefined' && window.__ORTHO_SESSION_SIZE__) || 20; } catch { return 20; }
}
function scoreLabel(pct) {
  const n = sessionSize();
  return `${Math.ceil(n * pct / 100)}/${n}`;
}

/**
 * Fisher-Yates shuffle.
 */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Selects session questions from a rule's pool.
 *
 * Strategy:
 *   1. Avoid questions shown in the last 2 sessions (recentlyShown) if possible.
 *   2. Mix difficulty levels for variety.
 *   3. Randomize order.
 *
 * No per-question SM-2 — this is purely variety-based selection.
 *
 * @param {object} rule - The rule object with a `questions` array.
 * @param {object} ruleProgress - Progress data for this rule (contains recentlyShown).
 * @param {number} maxQuestions - Maximum questions for the session (default 20).
 * @returns {Array} Selected questions, shuffled.
 */
export function selectSessionQuestions(rule, ruleProgress, maxQuestions = 20, mode = null) {
  let questions = rule.questions || [];
  if (questions.length === 0) return [];

  // Round filtering: rules with syllable-based rounds (e.g. g-gu-ge)
  const hasRounds = questions.some(q => q.round);
  if (hasRounds) {
    const effectiveMode = mode || ((ruleProgress?.level || 0) < 2 ? 'guided' : 'direct');
    if (effectiveMode === 'guided') {
      const guidedDone = ruleProgress?.guidedSessionsCompleted || 0;
      const targetRound = guidedDone === 0 ? 1 : 2;
      const roundPool = questions.filter(q => q.round === targetRound);

      return shuffleArray(roundPool).map(q => ({
        ...q,
        _ruleChoices: (q.choices && q.choices.length) ? q.choices : rule.choices,
        _ruleDecisionAxes: [],
        _ruleId: rule.id,
        _ruleTitle: rule.shortTitle || rule.title,
      }));
    } else {
      questions = questions.filter(q => !q.round);
    }
  }

  const recentlyShown = new Set(ruleProgress?.recentlyShown || []);

  // Split into fresh (not recently shown) and recent
  const fresh = questions.filter(q => !recentlyShown.has(q.id));
  const recent = questions.filter(q => recentlyShown.has(q.id));

  // Group fresh questions by difficulty for balanced selection
  const freshByDifficulty = {};
  for (const q of fresh) {
    const d = q.difficulty || 1;
    if (!freshByDifficulty[d]) freshByDifficulty[d] = [];
    freshByDifficulty[d].push(q);
  }

  // Shuffle each difficulty group
  for (const d of Object.keys(freshByDifficulty)) {
    freshByDifficulty[d] = shuffleArray(freshByDifficulty[d]);
  }

  // Build selection by round-robin across difficulty levels for balance
  const selected = [];
  const usedIds = new Set();
  const difficultyKeys = Object.keys(freshByDifficulty).sort((a, b) => Number(a) - Number(b));
  const pointers = {};
  for (const d of difficultyKeys) {
    pointers[d] = 0;
  }

  // Round-robin fresh questions across difficulties
  let added = true;
  while (selected.length < maxQuestions && added) {
    added = false;
    for (const d of difficultyKeys) {
      if (selected.length >= maxQuestions) break;
      const group = freshByDifficulty[d];
      if (pointers[d] < group.length) {
        const q = group[pointers[d]];
        if (!usedIds.has(q.id)) {
          selected.push(q);
          usedIds.add(q.id);
        }
        pointers[d]++;
        added = true;
      }
    }
  }

  // If still not enough, fill with recently shown questions (shuffled)
  if (selected.length < maxQuestions) {
    const shuffledRecent = shuffleArray(recent);
    for (const q of shuffledRecent) {
      if (selected.length >= maxQuestions) break;
      if (!usedIds.has(q.id)) {
        selected.push(q);
        usedIds.add(q.id);
      }
    }
  }

  // If STILL not enough (pool smaller than maxQuestions), that's fine — return what we have
  return shuffleArray(selected).map(q => ({
    ...q,
    _ruleChoices: (q.choices && q.choices.length) ? q.choices : rule.choices,
    _ruleDecisionAxes: q.round ? [] : rule.decisionAxes,
    _ruleId: q._ruleId || rule.id,
    _ruleTitle: q._ruleTitle || rule.shortTitle || rule.title,
  }));
}

/**
 * Select a mystery question: one random question from a different rule.
 *
 * @param {Array} allRules - All rule objects.
 * @param {string} excludeRuleId - The current rule to exclude.
 * @returns {object|null} A question with _ruleId/_ruleTitle metadata, or null if none available.
 */
export function selectMysteryQuestion(allRules, excludeRuleId) {
  const otherRules = allRules.filter(r => r.id !== excludeRuleId && (r.questions || []).length > 0);
  if (otherRules.length === 0) return null;

  const randomRule = otherRules[Math.floor(Math.random() * otherRules.length)];
  const questions = randomRule.questions || [];
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  return {
    ...randomQuestion,
    _ruleId: randomRule.id,
    _ruleTitle: randomRule.shortTitle || randomRule.title,
    _ruleChoices: (randomQuestion.choices && randomQuestion.choices.length) ? randomQuestion.choices : randomRule.choices,
    _ruleDecisionAxes: randomRule.decisionAxes,
    _isMystery: true,
  };
}

/**
 * Computes review stats for a rule, used by the dashboard.
 *
 * @param {object} rule - The rule object.
 * @param {object} ruleProgress - Progress data for this rule.
 * @returns {object} Stats for dashboard display.
 */
export function getRuleReviewStats(rule, ruleProgress) {
  const today = getToday();
  const progress = ruleProgress || {};
  const level = progress.level || 0;
  const sm2 = progress.sm2 || null;

  // Whether SM-2 review is due
  let reviewDue = false;
  let diamondHealth = null;
  let nextReviewDate = null;
  let daysUntilReview = null;

  if (sm2 && level >= 4) {
    diamondHealth = calculateDiamondHealth(sm2);
    nextReviewDate = sm2.nextReviewDate;
    reviewDue = sm2.nextReviewDate <= today;

    // Calculate days until (or since) review
    const todayDate = parseLocalDate(today);
    const reviewDate = parseLocalDate(sm2.nextReviewDate);
    const msPerDay = 24 * 60 * 60 * 1000;
    daysUntilReview = Math.round((reviewDate - todayDate) / msPerDay);
  }

  // Progress toward next level
  let progressToNextLevel = null;

  if (level === 0) {
    progressToNextLevel = {
      nextLevel: 1,
      label: 'Compléter 1 session guidée',
      current: progress.guidedSessionsCompleted || 0,
      target: 1,
    };
  } else if (level === 1) {
    progressToNextLevel = {
      nextLevel: 2,
      label: `3 sessions guidées ≥ ${scoreLabel(80)}`,
      current: progress.guidedSessionsAbove80 || 0,
      target: 3,
    };
  } else if (level === 2) {
    progressToNextLevel = {
      nextLevel: 3,
      label: `3 sessions directes ≥ ${scoreLabel(80)}`,
      current: progress.directSessionsAbove80 || 0,
      target: 3,
    };
  } else if (level === 3) {
    progressToNextLevel = {
      nextLevel: 4,
      label: `3 sessions directes consécutives ≥ ${scoreLabel(90)}`,
      current: progress.directConsecutiveAbove90 || 0,
      target: 3,
    };
  } else if (level >= 4) {
    progressToNextLevel = {
      nextLevel: 5,
      label: 'Maintenir le diamant via SM-2',
      current: diamondHealth !== null ? diamondHealth : 1.0,
      target: 1.0,
    };
  }

  // Urgency score for dashboard sorting
  // Higher = should appear first
  let urgency = 0;
  if (reviewDue) {
    // Overdue reviews are most urgent; lower health = more urgent
    urgency = 100 + (1 - (diamondHealth || 0)) * 50;
  } else if (level > 0 && level < 4) {
    // In-progress rules: closer to next level = higher urgency
    const current = progressToNextLevel?.current || 0;
    const target = progressToNextLevel?.target || 1;
    urgency = 50 + (current / target) * 40;
  } else if (level === 0) {
    // Not started: lowest urgency
    urgency = 10;
  }

  return {
    level,
    reviewDue,
    diamondHealth,
    nextReviewDate,
    daysUntilReview,
    progressToNextLevel,
    urgency,
    totalQuestions: (rule.questions || []).length,
  };
}
