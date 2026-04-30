/**
 * Persistence layer — high-level wrappers with defaults, validation, and
 * error handling on top of the raw store (Firestore or localStorage).
 */

import { getToday } from '../engine/sm2.js';
import { createDefaultMysteryImagesState } from '../engine/economy.js';
import { createDefaultCoaching } from '../engine/coaching.js';
import {
  loadProgress        as storeLoadProgress,
  saveProgress        as storeSaveProgress,
  loadChildSettings   as storeLoadChildSettings,
  saveChildSettings   as storeSaveChildSettings,
  loadParentImages    as storeLoadParentImages,
  saveParentImages    as storeSaveParentImages,
  getDailyBackups     as storeGetDailyBackups,
  restoreDailyBackup  as storeRestoreDailyBackup,
} from '../services/store.js';

const PIN_LENGTH = 4;

// ---------------------------------------------------------------------------
// Default structures
// ---------------------------------------------------------------------------

export function createDefaultProgress() {
  return {
    userId: 'local',
    createdAt: getToday(),
    streak: { current: 0, longest: 0, lastActiveDate: null },
    coins: 0,
    shields: 0,
    shop: {
      owned: [],
      equipped: { theme: null, flame: null, title: null, victoryAnimation: null },
      activeBoosts: { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsLastPurchasedWeek: null },
      mysteryImages: createDefaultMysteryImagesState(),
      inventory: { questionMystery: 0 },
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
    pinLockout: { failedAttempts: 0, lockedUntil: 0 },
    rules: {},
    coaching: createDefaultCoaching(),
  };
}

export function createDefaultAdminSettings() {
  return {
    prodQuestionCount: 20,
    customMysteryImages: [],
  };
}

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------


function normalizeCustomMysteryImages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(entry => ({
      id: String(entry?.id || '').trim(),
      title: String(entry?.title || '').trim(),
      imageDataUrl: String(entry?.imageDataUrl || '').trim(),
      finalTileIndex: Math.max(0, Math.min(Number.parseInt(entry?.finalTileIndex, 10) || 0, 5)),
    }))
    .filter(entry => entry.id && entry.title && entry.imageDataUrl);
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function loadProgress(uid, childId) {
  if (!uid || !childId) return null;
  // Let errors propagate — the caller MUST distinguish between "no data"
  // (returns null) and "failed to read" (throws). Swallowing errors here
  // caused the app to fall back to default progress, and the next save
  // would permanently destroy the user's real data.
  const data = await storeLoadProgress(uid, childId);
  if (!data || typeof data !== 'object') return null;
  return data;
}

export async function saveProgress(progress, uid, childId) {
  if (!uid || !childId) return { success: false, error: 'uid et childId requis.' };
  try {
    await storeSaveProgress(uid, childId, progress);
    return { success: true };
  } catch (error) {
    console.error('Failed to save progress:', error);
    return { success: false, error: "La progression n'a pas pu être sauvegardée." };
  }
}

// ---------------------------------------------------------------------------
// Admin settings — now per-child, with parent-level image library
// ---------------------------------------------------------------------------

/**
 * Load admin settings for a specific child.
 * - prodQuestionCount comes from the child's own settings
 * - customMysteryImages = parent library filtered by child's enabledMysteryImageIds
 */
export async function loadAdminSettings(uid, childId) {
  if (!uid || !childId) return createDefaultAdminSettings();
  try {
    const [childSettings, parentImages] = await Promise.all([
      storeLoadChildSettings(uid, childId),
      storeLoadParentImages(uid),
    ]);
    const settings = childSettings || {};
    const enabledIds = settings.enabledMysteryImageIds || [];
    const allImages = normalizeCustomMysteryImages(parentImages);
    const customMysteryImages = allImages.filter(img => enabledIds.includes(img.id));
    return {
      prodQuestionCount: Math.max(1, Math.min(Number.parseInt(settings.prodQuestionCount, 10) || 20, 50)),
      customMysteryImages,
    };
  } catch (error) {
    console.error('Failed to load admin settings from Firestore:', error);
    return createDefaultAdminSettings();
  }
}

/**
 * Save admin settings for a specific child (only prodQuestionCount).
 * Image management is handled separately via saveChildImageSettings / saveParentImages.
 */
export async function saveAdminSettings(settings, uid, childId) {
  if (!uid || !childId) return { success: false, error: 'uid et childId requis.' };
  try {
    const prodQuestionCount = Math.max(1, Math.min(Number.parseInt(settings?.prodQuestionCount, 10) || 20, 50));
    const current = await storeLoadChildSettings(uid, childId) || {};
    const payload = { ...current, prodQuestionCount };
    await storeSaveChildSettings(uid, childId, payload);
    return { success: true, settings: { ...createDefaultAdminSettings(), prodQuestionCount } };
  } catch (error) {
    console.error('Failed to save admin settings to Firestore:', error);
    return { success: false, error: "Les paramètres admin n'ont pas pu être sauvegardés." };
  }
}

/**
 * Load the parent-level mystery image library.
 */
export async function loadParentImages(uid) {
  if (!uid) return [];
  try {
    return normalizeCustomMysteryImages(await storeLoadParentImages(uid));
  } catch (error) {
    console.error('Failed to load parent images:', error);
    return [];
  }
}

/**
 * Save the parent-level mystery image library.
 */
export async function saveParentImages(uid, images) {
  if (!uid) return { success: false, error: 'uid requis.' };
  try {
    await storeSaveParentImages(uid, normalizeCustomMysteryImages(images));
    return { success: true };
  } catch (error) {
    console.error('Failed to save parent images:', error);
    return { success: false, error: "Les images n'ont pas pu être sauvegardées." };
  }
}

/**
 * Save which images from the parent library are enabled for a specific child.
 */
export async function saveChildImageSettings(uid, childId, enabledMysteryImageIds) {
  if (!uid || !childId) return { success: false, error: 'uid et childId requis.' };
  try {
    const current = await storeLoadChildSettings(uid, childId) || {};
    await storeSaveChildSettings(uid, childId, { ...current, enabledMysteryImageIds });
    return { success: true };
  } catch (error) {
    console.error('Failed to save child image settings:', error);
    return { success: false, error: "Les paramètres n'ont pas pu être sauvegardés." };
  }
}

/**
 * Save the prodQuestionCount for a specific child.
 */
export async function saveChildQuestionCount(uid, childId, prodQuestionCount) {
  if (!uid || !childId) return { success: false, error: 'uid et childId requis.' };
  try {
    const count = Math.max(1, Math.min(Number.parseInt(prodQuestionCount, 10) || 20, 50));
    const current = await storeLoadChildSettings(uid, childId) || {};
    await storeSaveChildSettings(uid, childId, { ...current, prodQuestionCount: count });
    return { success: true };
  } catch (error) {
    console.error('Failed to save question count:', error);
    return { success: false, error: "Le paramètre n'a pas pu être sauvegardé." };
  }
}

/**
 * Load child-specific settings (raw, for parent dashboard).
 */
export async function loadChildSettings(uid, childId) {
  if (!uid || !childId) return { prodQuestionCount: 20, enabledMysteryImageIds: [] };
  try {
    const s = await storeLoadChildSettings(uid, childId);
    return {
      prodQuestionCount: Math.max(1, Math.min(Number.parseInt(s?.prodQuestionCount, 10) || 20, 50)),
      enabledMysteryImageIds: Array.isArray(s?.enabledMysteryImageIds) ? s.enabledMysteryImageIds : [],
    };
  } catch (error) {
    console.error('Failed to load child settings:', error);
    return { prodQuestionCount: 20, enabledMysteryImageIds: [] };
  }
}

// ---------------------------------------------------------------------------
// Backups
// ---------------------------------------------------------------------------

export async function getDailyBackups(uid, childId) {
  if (!uid || !childId) return [];
  try {
    return await storeGetDailyBackups(uid, childId);
  } catch (error) {
    console.error('Failed to load daily backups:', error);
    return [];
  }
}

export async function restoreDailyBackup(backup, uid, childId) {
  if (!uid || !childId) return { success: false, error: 'uid et childId requis.' };
  try {
    const date = typeof backup === 'string' ? backup : backup?.date;
    const progress = await storeRestoreDailyBackup(uid, childId, date);
    return { success: true, progress };
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return { success: false, error: "La sauvegarde n'a pas pu être restaurée." };
  }
}

export async function clearCurrentStoredProgress(uid, childId) {
  // Reset to default by overwriting with empty progress
  if (!uid || !childId) return { success: false, error: 'uid et childId requis.' };
  try {
    const empty = createDefaultProgress();
    await storeSaveProgress(uid, childId, empty);
    return { success: true };
  } catch (error) {
    console.error('Failed to clear progress:', error);
    return { success: false, error: "La progression n'a pas pu être réinitialisée." };
  }
}

// ---------------------------------------------------------------------------
// Export / Import (client-side only)
// ---------------------------------------------------------------------------

export function exportProgress(progress) {
  const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importProgress(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(JSON.parse(JSON.stringify(data)));
      } catch {
        reject(new Error('Fichier invalide'));
      }
    };
    reader.readAsText(file);
  });
}
