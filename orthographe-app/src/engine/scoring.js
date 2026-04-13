/**
 * Scoring, level progression, streak, and coin calculations.
 *
 * V2 level system (per rule):
 *   Level 0: Not started
 *   Level 1: 1 guided session completed (any score)
 *   Level 2: 3 guided sessions >= 80% → unlocks direct mode, +30 coins
 *   Level 3: 3 direct sessions >= 80% → crown, +100 coins
 *   Level 4: 3 consecutive direct sessions >= 90% → diamond, +200 coins, activates SM-2
 *   Level 5: Diamond alive (maintained via SM-2 reviews)
 */

import { getToday } from './sm2.js';

function isDebug() {
  try { return typeof window !== 'undefined' && window.__ORTHO_DEBUG__; } catch { return false; }
}

/**
 * Calculate coins earned from a session based on score percentage.
 *
 * @param {number} score - Number of correct answers.
 * @param {number} total - Total number of questions.
 * @returns {number} Coins earned (5, 10, 20, or 30).
 */
export function calculateCoins(score, total) {
  if (total === 0) return 0;
  const pct = Math.round((score / total) * 100);
  if (pct === 100) return 30;
  if (pct >= 80) return 20;
  if (pct >= 60) return 10;
  return 5;
}

/**
 * Check if a level-up has occurred and return the result.
 *
 * This function does NOT mutate ruleProgress — the caller is responsible
 * for applying the returned changes.
 *
 * @param {object} ruleProgress - Current progress for the rule.
 * @param {string} mode - 'guided' or 'direct'.
 * @param {number} score - Number of correct answers.
 * @param {number} total - Total number of questions.
 * @returns {object} Result:
 *   - newLevel: new level (null if no change)
 *   - coinsEarned: bonus coins from level-up (0 if none)
 *   - events: array of event strings for UI display
 *   - updatedProgress: the updated ruleProgress fields to merge
 */
export function checkLevelUp(ruleProgress, mode, score, total) {
  if (total === 0) return { newLevel: null, coinsEarned: 0, events: [], updatedProgress: {} };
  const pct = Math.round((score / total) * 100);
  const level = ruleProgress.level || 0;
  const events = [];
  let coinsEarned = 0;
  let newLevel = null;

  // In debug mode, all session thresholds drop to 1
  const THRESHOLD = isDebug() ? 1 : 3;

  // Build updated progress fields
  const updates = {};

  if (mode === 'guided') {
    const completedBefore = ruleProgress.guidedSessionsCompleted || 0;
    const above80Before = ruleProgress.guidedSessionsAbove80 || 0;
    const bestBefore = ruleProgress.guidedBestScore || 0;

    updates.guidedSessionsCompleted = completedBefore + 1;
    if (pct >= 80) {
      updates.guidedSessionsAbove80 = above80Before + 1;
    }
    if (pct > bestBefore) {
      updates.guidedBestScore = pct;
    }

    // Level 0 → 1: Complete 1 guided session (any score)
    if (level === 0) {
      newLevel = 1;
      events.push('level_up_1');
    }

    // Level 1 → 2: 3 guided sessions >= 80%
    if (level === 1) {
      const newAbove80 = updates.guidedSessionsAbove80 !== undefined
        ? updates.guidedSessionsAbove80
        : above80Before;
      if (newAbove80 >= THRESHOLD) {
        newLevel = 2;
        coinsEarned = 30;
        events.push('level_up_2');
        events.push('direct_unlocked');
      }
    }

  } else if (mode === 'direct') {
    const completedBefore = ruleProgress.directSessionsCompleted || 0;
    const above80Before = ruleProgress.directSessionsAbove80 || 0;
    const bestBefore = ruleProgress.directBestScore || 0;
    const consecutiveAbove90Before = ruleProgress.directConsecutiveAbove90 || 0;

    updates.directSessionsCompleted = completedBefore + 1;

    if (pct >= 80) {
      updates.directSessionsAbove80 = above80Before + 1;
    }
    if (pct > bestBefore) {
      updates.directBestScore = pct;
    }

    // Track consecutive >= 90% for diamond
    if (pct >= 90) {
      updates.directConsecutiveAbove90 = consecutiveAbove90Before + 1;
    } else {
      // Reset consecutive counter on any session < 90%
      updates.directConsecutiveAbove90 = 0;
    }

    // Level 2 → 3: 3 direct sessions >= 80%
    if (level === 2) {
      const newAbove80 = updates.directSessionsAbove80 !== undefined
        ? updates.directSessionsAbove80
        : above80Before;
      if (newAbove80 >= THRESHOLD) {
        newLevel = 3;
        coinsEarned = 100;
        events.push('level_up_3');
        events.push('crown_earned');
      }
    }

    // Level 3 → 4: 3 consecutive direct sessions >= 90%
    if (level === 3) {
      const newConsecutive = updates.directConsecutiveAbove90 !== undefined
        ? updates.directConsecutiveAbove90
        : consecutiveAbove90Before;
      if (newConsecutive >= THRESHOLD) {
        newLevel = 4;
        coinsEarned = 200;
        events.push('level_up_4');
        events.push('diamond_earned');
        events.push('sm2_activated');
      }
    }
  }

  return {
    newLevel,
    coinsEarned,
    events,
    updatedProgress: updates,
  };
}

/**
 * Get streak display info based on current streak count.
 *
 * @param {object} streak - Streak object with `current` field.
 * @returns {object} { bonus, title, flame } for UI display.
 *   Note: bonus here refers to milestone coin bonuses, NOT daily bonuses.
 */
export function getStreakInfo(streak) {
  const current = streak?.current || 0;
  if (current >= 30) return { bonus: 0, title: 'Légende', flame: '\u{1F4A5}' };
  if (current >= 14) return { bonus: 0, title: 'Inarrêtable', flame: '\u26A1' };
  if (current >= 7) return { bonus: 0, title: 'En feu', flame: '\u{1F525}\u{1F525}\u{1F525}' };
  if (current >= 3) return { bonus: 0, title: 'Sur la lancée', flame: '\u{1F525}\u{1F525}' };
  if (current >= 1) return { bonus: 0, title: 'Bon début', flame: '\u{1F525}' };
  return { bonus: 0, title: '', flame: '' };
}

export function getNextStreakTierInfo(streak, isFirstSessionOfDay = false) {
  const projectedCurrent = (streak?.current || 0) + (isFirstSessionOfDay ? 1 : 0);
  const tiers = [
    { min: 1, title: 'Bon début' },
    { min: 3, title: 'Sur la lancée' },
    { min: 7, title: 'En feu' },
    { min: 14, title: 'Inarrêtable' },
    { min: 30, title: 'Légende' },
  ];

  const currentTier = [...tiers].reverse().find(tier => projectedCurrent >= tier.min);
  const nextTier = tiers.find(tier => tier.min > projectedCurrent) || null;

  return {
    current: projectedCurrent,
    title: currentTier?.title || '',
    nextTierDays: nextTier?.min || null,
    nextTierTitle: nextTier?.title || null,
    daysLeft: nextTier ? nextTier.min - projectedCurrent : 0,
  };
}

export function getEndScreenLevelProgress(ruleProgress, mode, score, total) {
  const currentProgress = ruleProgress || {};
  const levelResult = checkLevelUp(currentProgress, mode, score, total);
  const after = {
    ...currentProgress,
    ...levelResult.updatedProgress,
    level: levelResult.newLevel ?? (currentProgress.level || 0),
  };
  const currentLevel = after.level || 0;
  const threshold = isDebug() ? 1 : 3;

  if (currentLevel >= 4) return null;

  const configByLevel = {
    0: {
      nextLevel: 1,
      nextLevelName: 'Découverte',
      current: after.guidedSessionsCompleted || 0,
      target: 1,
    },
    1: {
      nextLevel: 2,
      nextLevelName: 'Mode direct',
      current: after.guidedSessionsAbove80 || 0,
      target: threshold,
    },
    2: {
      nextLevel: 3,
      nextLevelName: 'Couronne',
      current: after.directSessionsAbove80 || 0,
      target: threshold,
    },
    3: {
      nextLevel: 4,
      nextLevelName: 'Diamant',
      current: after.directConsecutiveAbove90 || 0,
      target: threshold,
    },
  };

  const config = configByLevel[currentLevel];
  if (!config) return null;

  const remaining = Math.max(config.target - config.current, 0);
  let message = '';
  if (remaining === 1) {
    message = "Plus qu'une session !";
  } else if (remaining > 1) {
    message = `Encore ${remaining} sessions.`;
  }

  return {
    currentLevel,
    justLeveledUp: levelResult.newLevel !== null,
    message,
    ...config,
  };
}

/**
 * Update the streak after a session.
 *
 * Logic:
 *   - If already played today: no change.
 *   - If played yesterday: streak increments.
 *   - If missed 1 day and has shield: use shield, streak saved.
 *   - If missed more: streak resets to 1.
 *   - Awards shields at streak milestones (every 7 days, max 2).
 *   - Checks for milestone events (7, 14, 30, 60, 100 days).
 *
 * @param {object} progress - Full progress object (mutated for shields).
 * @returns {object} { streak, shieldUsed, streakLost, newMilestone }
 */
export function updateStreak(progress) {
  const today = getToday();
  const streak = progress.streak || { current: 0, longest: 0, lastActiveDate: null };

  if (streak.lastActiveDate === today) {
    return { streak, shieldUsed: false, streakLost: false, newMilestone: null };
  }

  const yesterdayStr = getToday(-1);

  let shieldUsed = false;
  let streakLost = false;
  let newStreak = { ...streak };

  if (streak.lastActiveDate === yesterdayStr) {
    // Played yesterday — streak continues
    newStreak.current += 1;
  } else if (streak.lastActiveDate && streak.lastActiveDate < yesterdayStr) {
    // Missed day(s) — check for shields
    const daysBefore2Str = getToday(-2);

    if (streak.lastActiveDate >= daysBefore2Str && (progress.shields || 0) > 0) {
      // Use a shield — only protect 1 missed day
      shieldUsed = true;
      newStreak.current += 1;
      progress.shields = (progress.shields || 0) - 1;
    } else {
      streakLost = true;
      newStreak.current = 1;
    }
  } else {
    // First ever session
    newStreak.current = 1;
  }

  newStreak.lastActiveDate = today;
  if (newStreak.current > newStreak.longest) {
    newStreak.longest = newStreak.current;
  }

  // Award shield at streak 7, 14, etc. (every 7 days, max 2 in stock)
  if (newStreak.current >= 7 && newStreak.current % 7 === 0 && (progress.shields || 0) < 2) {
    progress.shields = (progress.shields || 0) + 1;
  }

  // Check milestone events
  const milestoneDays = [7, 14, 30, 60, 100];
  const newMilestone = milestoneDays.includes(newStreak.current) ? newStreak.current : null;

  return { streak: newStreak, shieldUsed, streakLost, newMilestone };
}
