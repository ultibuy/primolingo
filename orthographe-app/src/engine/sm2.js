/**
 * SM-2 algorithm applied at RULE level (not question level).
 *
 * SM-2 only activates when a rule reaches diamond status (level 4).
 * It controls the spaced-repetition review schedule for maintaining the diamond.
 */

function pad(value) {
  return String(value).padStart(2, '0');
}

export function formatLocalDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/**
 * Returns today's date as an ISO string (YYYY-MM-DD).
 */
export function getToday(dayOffset = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (dayOffset !== 0) {
    date.setDate(date.getDate() + dayOffset);
  }
  return formatLocalDate(date);
}

/**
 * Returns the initial SM-2 state for a rule when diamond is obtained.
 * Called once when level 4 is reached.
 */
export function initRuleSM2() {
  return {
    easiness: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: getToday(1), // First review tomorrow, not immediately
    lastReviewScore: null,
    diamondHealth: 1.0,
  };
}

/**
 * Updates SM-2 state after a review session.
 *
 * @param {object} sm2State - Current SM-2 state of the rule
 * @param {number} sessionScore - Number of correct answers in the session
 * @param {number} totalQuestions - Total number of questions in the session
 * @returns {object} Updated SM-2 state
 *
 * Thresholds:
 *   >= 90%  → success: interval increases (1→6→15→35→80→...), easiness adjusts up
 *   80-89%  → fragile: interval stays same, no change to easiness
 *   < 80%   → fail: interval resets to 1, easiness decreases
 */
export function updateRuleSM2(sm2State, sessionScore, totalQuestions) {
  if (totalQuestions === 0) return sm2State;
  const pct = Math.round((sessionScore / totalQuestions) * 100);
  let { easiness, interval, repetitions } = sm2State;

  if (pct >= 90) {
    // Success — advance the interval
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else if (repetitions === 2) {
      interval = 15;
    } else if (repetitions === 3) {
      interval = 35;
    } else if (repetitions === 4) {
      interval = 80;
    } else {
      interval = Math.round(interval * easiness);
    }
    repetitions += 1;

    // Adjust easiness upward (quality 4 on the 0-5 scale)
    const quality = 4;
    easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easiness < 1.3) easiness = 1.3;

  } else if (pct >= 80) {
    // Fragile success — interval and easiness stay the same
    // No changes to interval, repetitions, or easiness

  } else {
    // Fail — reset interval, decrease easiness
    repetitions = 0;
    interval = 1;

    // Adjust easiness downward (quality 2 on the 0-5 scale)
    const quality = 2;
    easiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easiness < 1.3) easiness = 1.3;
  }

  // Calculate next review date
  const today = parseLocalDate(getToday());
  today.setDate(today.getDate() + interval);
  const nextReviewDate = formatLocalDate(today);

  return {
    easiness: Math.round(easiness * 100) / 100,
    interval,
    repetitions,
    nextReviewDate,
    lastReviewScore: pct,
    diamondHealth: pct >= 80 ? 1.0 : calculateDiamondHealth({
      ...sm2State,
      nextReviewDate,
      interval,
    }),
  };
}

/**
 * Computes diamond health (0.0 to 1.0) based on how overdue the review is.
 *
 * - If nextReviewDate is in the future or today: 1.0
 * - If overdue: health = max(0, 1 - (daysOverdue / gracePeriod))
 *   where gracePeriod = max(7, interval)
 *
 * @param {object} sm2State - SM-2 state of the rule
 * @returns {number} Health value between 0.0 and 1.0
 */
export function calculateDiamondHealth(sm2State) {
  if (!sm2State || !sm2State.nextReviewDate) {
    return 1.0;
  }

  const today = parseLocalDate(getToday());
  const reviewDate = parseLocalDate(sm2State.nextReviewDate);
  if (!today || !reviewDate) return 1.0;

  // If review date is today or in the future, health is full
  if (reviewDate >= today) {
    return 1.0;
  }

  // Calculate days overdue
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysOverdue = Math.floor((today - reviewDate) / msPerDay);

  // Grace period: minimum 7 days, otherwise equal to the current interval
  const gracePeriod = Math.max(7, sm2State.interval || 1);

  const health = Math.max(0, 1 - (daysOverdue / gracePeriod));

  // Round to 2 decimal places
  return Math.round(health * 100) / 100;
}
