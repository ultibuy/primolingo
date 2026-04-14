/**
 * Persistence layer — load, save, export, import progress.
 *
 * Backed by a local Node API that writes `user-data/progress.json`
 * and keeps one daily backup per day for the last 30 days.
 */

import { getToday } from '../engine/sm2.js';

const API_BASE = '/api';

function getProfile() {
  if (typeof window === 'undefined') return 'prod';
  return window.__ORTHO_DEBUG__ ? 'debug' : 'prod';
}

/**
 * Create the default V2 progress structure.
 */
export function createDefaultProgress() {
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
    parentalCode: null,
    rules: {},
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Ortho-Profile': getProfile(),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = payload?.error || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
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
 */
function isV1Format(data) {
  if (!data || typeof data !== 'object') return false;
  if ('crowns' in data || 'diamonds' in data) return true;
  if (Array.isArray(data.milestones)) return true;
  if (!data.shop || typeof data.shop !== 'object') return true;

  if (data.rules && typeof data.rules === 'object') {
    for (const ruleId of Object.keys(data.rules)) {
      const rp = data.rules[ruleId];
      if (rp.questions && typeof rp.questions === 'object') {
        const questionIds = Object.keys(rp.questions);
        if (questionIds.length > 0) {
          const firstQ = rp.questions[questionIds[0]];
          if (firstQ && ('easiness' in firstQ || 'interval' in firstQ)) {
            return true;
          }
        }
      }
      if ('directUnlocked' in rp) return true;
      if ('directPerfectStreak' in rp) return true;
    }
  }

  return false;
}

/**
 * Migrate V1 progress to V2 format.
 */
function migrateV1ToV2(v1Data) {
  const v2 = createDefaultProgress();

  v2.userId = v1Data.userId || 'local';
  v2.createdAt = v1Data.createdAt || getToday();
  v2.coins = v1Data.coins || 0;
  v2.shields = v1Data.shields || 0;
  v2.firstQuizDone = v1Data.firstQuizDone || false;

  if (v1Data.streak) {
    v2.streak = {
      current: v1Data.streak.current || 0,
      longest: v1Data.streak.longest || 0,
      lastActiveDate: v1Data.streak.lastActiveDate || null,
    };
  }

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

  if (v1Data.rules && typeof v1Data.rules === 'object') {
    for (const ruleId of Object.keys(v1Data.rules)) {
      const oldRule = v1Data.rules[ruleId];
      const newRule = createDefaultRuleProgress();

      newRule.guidedSessionsCompleted = oldRule.guidedSessionsCompleted || 0;
      newRule.guidedSessionsAbove80 = oldRule.guidedSessionsAbove80 || 0;
      newRule.guidedBestScore = oldRule.guidedBestScore || 0;
      newRule.directSessionsCompleted = oldRule.directSessionsCompleted || 0;
      newRule.directSessionsAbove80 = oldRule.directSessionsAbove80 || 0;
      newRule.directBestScore = oldRule.directBestScore || 0;
      newRule.directConsecutiveAbove90 = oldRule.directPerfectStreak || oldRule.directConsecutiveAbove90 || 0;

      if (oldRule.directPerfectStreak >= 3 || (v1Data.diamonds && v1Data.diamonds > 0)) {
        newRule.level = 4;
        if (oldRule.sm2) newRule.sm2 = { ...oldRule.sm2 };
      } else if (oldRule.directUnlocked && (oldRule.directSessionsAbove80 || 0) >= 3) {
        newRule.level = 3;
      } else if (oldRule.directUnlocked) {
        newRule.level = 2;
      } else if ((oldRule.guidedSessionsCompleted || 0) >= 1) {
        newRule.level = (oldRule.guidedSessionsAbove80 || 0) >= 3 ? 2 : 1;
      }

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
 * Load progress from the local file-backed API.
 */
export async function loadProgress() {
  try {
    const data = await apiFetch('/progress');
    if (!data || typeof data !== 'object') {
      return createDefaultProgress();
    }
    if (isV1Format(data)) {
      const migrated = migrateV1ToV2(data);
      await saveProgress(migrated);
      return migrated;
    }
    return data;
  } catch (error) {
    if (error.status === 404) {
      return createDefaultProgress();
    }

    console.error('Failed to load progress:', error);
    return createDefaultProgress();
  }
}

/**
 * Save progress to the local file-backed API.
 */
export async function saveProgress(progress) {
  try {
    await apiFetch('/progress', {
      method: 'POST',
      body: JSON.stringify(progress),
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to save progress:', error);
    return {
      success: false,
      error: 'La progression n’a pas pu être sauvegardée sur le backend local.',
    };
  }
}

/**
 * Estimate the storage usage (in bytes) of the current progress payload.
 */
export async function getStorageUsage() {
  try {
    const progress = await apiFetch('/progress');
    return new Blob([JSON.stringify(progress || {})]).size;
  } catch {
    return 0;
  }
}

/**
 * Read the rolling daily backups metadata.
 */
export async function getDailyBackups() {
  try {
    const backups = await apiFetch(window.__ORTHO_DEBUG__ ? '/backups/all' : '/backups');
    return Array.isArray(backups) ? backups : [];
  } catch (error) {
    console.error('Failed to read daily backups:', error);
    return [];
  }
}

/**
 * Restore one daily backup by date.
 */
export async function restoreDailyBackup(backup) {
  try {
    const payload = typeof backup === 'string'
      ? { date: backup }
      : { date: backup?.date, profile: backup?.profile };
    const result = await apiFetch('/backups/restore', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: true, progress: result.progress };
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return {
      success: false,
      error: error.message || 'La sauvegarde n’a pas pu être restaurée.',
    };
  }
}

export async function clearCurrentStoredProgress() {
  try {
    await apiFetch('/progress', { method: 'DELETE' });
    return { success: true };
  } catch (error) {
    console.error('Failed to clear progress:', error);
    return {
      success: false,
      error: 'La progression locale n’a pas pu être réinitialisée.',
    };
  }
}

/**
 * Export progress as a downloadable JSON file.
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
 */
export function importProgress(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let data = JSON.parse(e.target.result);

        if (isV1Format(data)) {
          data = migrateV1ToV2(data);
        }

        resolve(clone(data));
      } catch {
        reject(new Error('Fichier invalide'));
      }
    };
    reader.readAsText(file);
  });
}
