/**
 * Persistence layer — load, save, export, import progress.
 *
 * V2: Updated default progress structure with level system, shop, economy.
 * Includes migration from V1 format (per-question SM-2) to V2 format (rule-level SM-2).
 * V5-F1: Added try-catch around localStorage.setItem for quota exceeded errors,
 *         and getStorageUsage() helper.
 */

import { getToday } from '../engine/sm2.js';

const STORAGE_KEY = 'orthographe-progress';

/**
 * Create the default V2 progress structure.
 */
function createDefaultProgress() {
  return {
    userId: 'local',
    createdAt: getToday(),
    streak: { current: 0, longest: 0, lastActiveDate: null },
    coins: 0,
    shields: 0,
    shop: {
      owned: [],
      equipped: {
        theme: null,
        flame: null,
        title: null,
        victoryAnimation: null,
        dashboardBackground: null,
      },
      activeBoosts: {
        doubleCoins: false,
      },
      inventory: {
        revealHint: 0,
        rematch: 0,
        modeSniper: 0,
        questionMystery: 0,
      },
    },
    milestones: {
      firstSession: false,
      streak7: false,
      streak14: false,
      streak30: false,
      streak60: false,
      streak100: false,
    },
    weeklyChest: { lastOpened: null },
    firstQuizDone: false,
    rules: {},
  };
}

/**
 * Create the default V2 rule progress structure.
 */
export function createDefaultRuleProgress() {
  return {
    level: 0,
    guidedSessionsCompleted: 0,
    guidedSessionsAbove80: 0,
    guidedBestScore: 0,
    directSessionsCompleted: 0,
    directSessionsAbove80: 0,
    directBestScore: 0,
    directConsecutiveAbove90: 0,
    sm2: null,
    recentlyShown: [],
    questionStats: {},
  };
}

/**
 * Detect if progress data is in V1 format and needs migration.
 * V1 indicators:
 *   - Has `crowns` or `diamonds` top-level fields
 *   - Has per-question SM-2 data in rule progress (rule.questions with easiness/interval)
 *   - Has `directUnlocked` or `directPerfectStreak` in rule progress
 *   - Milestones is an array instead of an object
 *   - Missing `shop`, `weeklyChest`, or `milestones` as object
 */
function isV1Format(data) {
  if (!data || typeof data !== 'object') return false;

  // Check for V1-specific top-level fields
  if ('crowns' in data || 'diamonds' in data) return true;

  // Check if milestones is an array (V1) instead of object (V2)
  if (Array.isArray(data.milestones)) return true;

  // Check if shop structure is missing
  if (!data.shop || typeof data.shop !== 'object') return true;

  // Check rule progress for V1 per-question SM-2 data
  if (data.rules && typeof data.rules === 'object') {
    for (const ruleId of Object.keys(data.rules)) {
      const rp = data.rules[ruleId];
      // V1 had `questions` object with per-question SM-2 states
      if (rp.questions && typeof rp.questions === 'object') {
        const questionIds = Object.keys(rp.questions);
        if (questionIds.length > 0) {
          const firstQ = rp.questions[questionIds[0]];
          // V1 per-question state has easiness, interval, repetitions
          if (firstQ && ('easiness' in firstQ || 'interval' in firstQ)) {
            return true;
          }
        }
      }
      // V1 had `directUnlocked` boolean
      if ('directUnlocked' in rp) return true;
      // V1 had `directPerfectStreak`
      if ('directPerfectStreak' in rp) return true;
    }
  }

  return false;
}

/**
 * Migrate V1 progress to V2 format.
 *
 * Strategy:
 *   - Preserve coins, streak, shields
 *   - Convert milestones array to object
 *   - Add shop, weeklyChest structures
 *   - Convert each rule's progress to the new level system
 *   - Infer current level from V1 data (directUnlocked, crown, diamond states)
 *   - Discard per-question SM-2 data
 */
function migrateV1ToV2(v1Data) {
  const v2 = createDefaultProgress();

  // Preserve basic fields
  v2.userId = v1Data.userId || 'local';
  v2.createdAt = v1Data.createdAt || getToday();
  v2.coins = v1Data.coins || 0;
  v2.shields = v1Data.shields || 0;
  v2.firstQuizDone = v1Data.firstQuizDone || false;

  // Preserve streak
  if (v1Data.streak) {
    v2.streak = {
      current: v1Data.streak.current || 0,
      longest: v1Data.streak.longest || 0,
      lastActiveDate: v1Data.streak.lastActiveDate || null,
    };
  }

  // Convert milestones from array to object
  if (Array.isArray(v1Data.milestones)) {
    v2.milestones.firstSession = v1Data.firstQuizDone || false;
    v2.milestones.streak7 = v1Data.milestones.includes(7);
    v2.milestones.streak14 = v1Data.milestones.includes(14);
    v2.milestones.streak30 = v1Data.milestones.includes(30);
    v2.milestones.streak60 = v1Data.milestones.includes(60);
    v2.milestones.streak100 = v1Data.milestones.includes(100);
  } else if (v1Data.milestones && typeof v1Data.milestones === 'object') {
    v2.milestones = { ...v2.milestones, ...v1Data.milestones };
  }

  // Migrate rules
  if (v1Data.rules && typeof v1Data.rules === 'object') {
    for (const ruleId of Object.keys(v1Data.rules)) {
      const oldRule = v1Data.rules[ruleId];
      const newRule = createDefaultRuleProgress();

      // Carry over session counts
      newRule.guidedSessionsCompleted = oldRule.guidedSessionsCompleted || 0;
      newRule.guidedSessionsAbove80 = oldRule.guidedSessionsAbove80 || 0;
      newRule.guidedBestScore = oldRule.guidedBestScore || 0;
      newRule.directSessionsCompleted = oldRule.directSessionsCompleted || 0;
      newRule.directSessionsAbove80 = oldRule.directSessionsAbove80 || 0;
      newRule.directBestScore = oldRule.directBestScore || 0;
      newRule.directConsecutiveAbove90 = oldRule.directPerfectStreak || oldRule.directConsecutiveAbove90 || 0;

      // Infer level from V1 data
      // V1 had: directUnlocked, checkCrown(), checkDiamond()
      // We infer the level based on what they achieved:
      if (oldRule.directPerfectStreak >= 3 || (v1Data.diamonds && v1Data.diamonds > 0)) {
        // Had diamond → level 4
        newRule.level = 4;
        // If there was already SM-2 data at rule level, preserve it
        if (oldRule.sm2) {
          newRule.sm2 = { ...oldRule.sm2 };
        }
      } else if (oldRule.directUnlocked && (oldRule.directSessionsAbove80 || 0) >= 3) {
        // Had crown → level 3
        newRule.level = 3;
      } else if (oldRule.directUnlocked) {
        // Direct unlocked → level 2
        newRule.level = 2;
      } else if ((oldRule.guidedSessionsCompleted || 0) >= 1) {
        // At least 1 guided session → level 1
        newRule.level = 1;
        if ((oldRule.guidedSessionsAbove80 || 0) >= 3) {
          // Actually qualifies for level 2 too
          newRule.level = 2;
        }
      }

      // Convert per-question stats (discard SM-2 per question, keep basic stats)
      if (oldRule.questions && typeof oldRule.questions === 'object') {
        for (const qId of Object.keys(oldRule.questions)) {
          const qState = oldRule.questions[qId];
          newRule.questionStats[qId] = {
            timesShown: qState.repetitions || 0,
            timesCorrect: qState.lastResult === 'correct' ? (qState.repetitions || 0) : 0,
          };
        }
      }

      v2.rules[ruleId] = newRule;
    }
  }

  return v2;
}

/**
 * Load progress from localStorage.
 * Automatically migrates V1 data to V2 format if detected.
 *
 * @returns {Promise<object>} The progress object.
 */
export async function loadProgress() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      let data = JSON.parse(stored);

      // Migrate V1 to V2 if needed
      if (isV1Format(data)) {
        data = migrateV1ToV2(data);
        // Save the migrated data back
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }

      return data;
    } catch {
      // Corrupt data — return fresh
    }
  }
  return createDefaultProgress();
}

/**
 * Save progress to localStorage.
 * Returns a result object indicating success or failure (e.g. quota exceeded).
 *
 * @param {object} progress - The progress object to persist.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return { success: true };
  } catch (err) {
    console.error('Failed to save progress:', err);
    return { success: false, error: 'Espace de stockage plein. Ta progression n\'a pas pu être sauvegardée.' };
  }
}

/**
 * Estimate the storage usage (in bytes) of the progress data.
 *
 * @returns {number} Size in bytes, or 0 if unavailable.
 */
export function getStorageUsage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? new Blob([data]).size : 0;
  } catch {
    return 0;
  }
}

/**
 * Export progress as a downloadable JSON file.
 *
 * @param {object} progress - The progress object to export.
 */
export function exportProgress(progress) {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import progress from a JSON file.
 * If the imported data is V1 format, it will be migrated on next load.
 *
 * @param {File} file - The file to read.
 * @returns {Promise<object>} The parsed progress data.
 */
export function importProgress(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target.result);

        // Migrate V1 to V2 if needed
        if (isV1Format(data)) {
          data = migrateV1ToV2(data);
        }

        resolve(data);
      } catch {
        reject(new Error('Fichier invalide'));
      }
    };
    reader.readAsText(file);
  });
}
