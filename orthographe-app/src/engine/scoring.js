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

import { getToday, initRuleSM2, updateRuleSM2 } from './sm2.js';
import { isLocalhost } from '../debug.js';
import { hasDoubleCoinsActive } from './economy.js';

function isDebug() {
  return isLocalhost();
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
  if (pct >= 60) return 5;
  return 0;
}

/**
 * Perfect session bonus.
 *
 * Applies to any session completed with a 100% score.
 *
 * @param {number} score - Number of correct answers.
 * @param {number} total - Total number of questions.
 * @returns {number} Bonus coins.
 */

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
        updates.directConsecutiveAbove90 = 0;
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

  const n = total || 20;
  const min80 = Math.ceil(n * 80 / 100);
  const min90 = Math.ceil(n * 90 / 100);

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
  const messages = {
    0: 'Termine ta première session guidée !',
    1: remaining === 1
      ? `Plus qu'une session avec ${min80} bonnes réponses !`
      : `Fais ${remaining} sessions avec au moins ${min80} bonnes réponses`,
    2: remaining === 1
      ? `Plus qu'une session avec ${min80} bonnes réponses !`
      : `Fais ${remaining} sessions avec au moins ${min80} bonnes réponses`,
    3: `Fais ${threshold} sessions d'affilée avec au moins ${min90} bonnes réponses`,
  };
  const message = remaining > 0 ? (messages[currentLevel] || '') : '';

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
    // Missed day(s) — shields are handled manually via ReturnScreen, never auto-consumed here
    streakLost = true;
    newStreak.current = 1;
  } else {
    // First ever session
    newStreak.current = 1;
  }

  newStreak.lastActiveDate = today;
  if (newStreak.current > newStreak.longest) {
    newStreak.longest = newStreak.current;
  }

  // Check milestone events
  const milestoneDays = [7, 14, 30, 60, 100];
  const newMilestone = milestoneDays.includes(newStreak.current) ? newStreak.current : null;

  return { streak: newStreak, shieldUsed, streakLost, newMilestone };
}

const MILESTONE_COINS_MAP = { 7: 100, 14: 200, 30: 350, 60: 500, 100: 1000 };

/**
 * Pre-compute whether this session will earn a streak milestone.
 * Used by EndScreen to show the streak bonus before handleQuizFinish runs.
 */
export function computeStreakMilestone(streak, milestones, isFirstSessionOfDay, sessionPct) {
  if (sessionPct < 60) return null; // doesn't qualify
  if (!isFirstSessionOfDay) return null; // streak already updated today
  const current = streak?.current || 0;
  const yesterday = getToday(-1);
  const lastActive = streak?.lastActiveDate;
  // Streak will increment only if last active was yesterday
  if (lastActive !== yesterday && lastActive !== null && current > 0) return null;
  const projected = current + 1;
  const days = [7, 14, 30, 60, 100];
  for (const d of days) {
    if (projected >= d && !milestones?.[`streak${d}`]) {
      return { streak: d, coins: MILESTONE_COINS_MAP[d] };
    }
  }
  return null;
}

// ── Shared post-session logic (used by both grammar and dictée handlers) ────

const DIAMOND_PASS_THRESHOLD = 90;
const FIRST_SESSION_BONUS = 10;
const WELCOME_BONUS = 200;

export const MILESTONE_COINS = {
  streak7: 100,
  streak14: 200,
  streak30: 350,
  streak60: 500,
  streak100: 1000,
};

export const STREAK_MILESTONES = {
  7: 'streak7',
  14: 'streak14',
  30: 'streak30',
  60: 'streak60',
  100: 'streak100',
};

function awardMilestone(milestones, key, coins) {
  if (milestones[key]) return 0;
  milestones[key] = true;
  return coins || MILESTONE_COINS[key] || 0;
}

/**
 * Process a completed session — shared between grammar and dictée.
 *
 * Mutates `next` (full progress) and `rp` (rule progress for this rule/dictée).
 * Returns events array + metadata for the caller.
 *
 * @param {object} next - Full progress object (deep clone, safe to mutate).
 * @param {object|null} rp - Rule progress for this rule/dictée. null for sniper.
 * @param {object} opts
 * @param {string} opts.mode - 'guided' | 'direct'
 * @param {number} opts.score
 * @param {number} opts.total
 * @param {boolean} opts.wasReview - Was this an SM-2 review session?
 * @param {string} opts.title - Rule/dictée title for event messages.
 * @returns {{ events: object[], sessionCoins: number, hasNewTrophy: boolean }}
 */
export function processSessionResult(next, rp, {
  mode,
  score,
  total,
  wasReview = false,
  title = '',
}) {
  const pct = Math.round((score / total) * 100);
  const qualifies = pct >= 60;
  const events = [];
  let hasNewTrophy = false;

  // ── 1. SM-2 review path ─────────────────────────────────────────────────
  if (wasReview && rp?.sm2) {
    const updatedSM2 = updateRuleSM2(rp.sm2, score, total);
    rp.sm2 = updatedSM2;

    if (pct >= DIAMOND_PASS_THRESHOLD) {
      events.push({ type: 'sm2ReviewPassed', value: title });
    } else if (pct >= 80) {
      events.push({ type: 'sm2ReviewFragile', value: title });
    } else {
      events.push({ type: 'sm2ReviewFailed', value: title });
    }

    if (rp.sm2.diamondHealth <= 0) {
      rp.level = 3;
      rp.sm2 = null;
      rp.directConsecutiveAbove90 = 0;
      events.push({ type: 'diamondBroken', value: title });
    }

  // ── 2. Level-up path ────────────────────────────────────────────────────
  } else if (rp) {
    const oldLevel = rp.level || 0;
    const levelResult = checkLevelUp(rp, mode, score, total);
    Object.assign(rp, levelResult.updatedProgress);

    if (levelResult.newLevel !== null && levelResult.newLevel > oldLevel) {
      rp.level = levelResult.newLevel;
      events.push({ type: 'levelUp', value: levelResult.newLevel, ruleTitle: title, coins: levelResult.coinsEarned || 0 });

      if (levelResult.coinsEarned > 0) {
        next.coins = (next.coins || 0) + levelResult.coinsEarned;
        events.push({ type: 'levelMilestoneCoins', value: levelResult.coinsEarned, level: levelResult.newLevel });
      }

      if (levelResult.newLevel === 2 && oldLevel < 2) {
        events.push({ type: 'directUnlocked', value: title });
      }

      if (levelResult.newLevel === 3 && oldLevel < 3) {
        rp.recentTrophy = 'crown';
        hasNewTrophy = true;
        events.push({ type: 'crown', value: title });
      }

      if (levelResult.newLevel === 4 && oldLevel < 4) {
        rp.sm2 = initRuleSM2();
        rp.recentTrophy = 'diamond';
        hasNewTrophy = true;
        events.push({ type: 'diamond', value: title });
      }
    }
  }

  // ── 3. Coins ────────────────────────────────────────────────────────────
  const today = getToday();
  const isFirstSessionToday = next.streak?.lastActiveDate !== today;
  const isFirstSessionEver = !next.milestones?.firstSession;
  let sessionCoins = calculateCoins(score, total);

  if (isFirstSessionToday && qualifies) {
    const dayBonus = isFirstSessionEver ? WELCOME_BONUS : FIRST_SESSION_BONUS;
    sessionCoins += dayBonus;
    events.push({ type: 'firstSessionOfDay', value: dayBonus, isWelcome: isFirstSessionEver });
    if (isFirstSessionEver) next.milestones.firstSession = true;
  }

  if (hasDoubleCoinsActive(next)) {
    const base = sessionCoins;
    sessionCoins *= 2;
    next.shop.activeBoosts.doubleCoinsBonusEarned = (next.shop.activeBoosts.doubleCoinsBonusEarned || 0) + base;
    next.shop.activeBoosts.doubleCoinsRemainingSessions = Math.max((next.shop.activeBoosts.doubleCoinsRemainingSessions || 0) - 1, 0);
    next.shop.activeBoosts.doubleCoins = next.shop.activeBoosts.doubleCoinsRemainingSessions > 0;
    events.push({ type: 'doubleCoins' });
  }

  next.coins = (next.coins || 0) + sessionCoins;
  events.push({ type: 'coinsEarned', value: sessionCoins });

  // ── 4. Streak ───────────────────────────────────────────────────────────
  if (qualifies) {
    const streakResult = updateStreak(next);
    next.streak = streakResult.streak;
    if (streakResult.shieldUsed) {
      events.push({ type: 'shieldUsed', value: streakResult.streak.current });
    }
  }

  // ── 4b. Daily activity counter ────────────────────────────────────────
  if (!next.dailyActivity) next.dailyActivity = { date: null, count: 0, yesterdayCount: 0, bestDaily: 0 };
  if (next.dailyActivity.date !== today) {
    next.dailyActivity.yesterdayCount = next.dailyActivity.date ? next.dailyActivity.count : 0;
    next.dailyActivity.date = today;
    next.dailyActivity.count = 0;
  }
  next.dailyActivity.count += 1;
  if (next.dailyActivity.count > next.dailyActivity.bestDaily) {
    next.dailyActivity.bestDaily = next.dailyActivity.count;
  }

  // ── 5. Milestones ───────────────────────────────────────────────────────
  if (!next.milestones) {
    next.milestones = {
      firstSession: false,
      streak7: false, streak14: false,
      streak30: false, streak60: false, streak100: false,
    };
  }

  const currentStreak = next.streak?.current || 0;
  for (const [threshold, key] of Object.entries(STREAK_MILESTONES)) {
    if (currentStreak >= Number(threshold)) {
      const coins = awardMilestone(next.milestones, key);
      if (coins > 0) {
        next.coins += coins;
        events.push({ type: 'milestone', value: key, coins, streak: Number(threshold) });
      }
    }
  }

  return { events, sessionCoins, hasNewTrophy };
}
