/**
 * Persistence layer — Firestore-backed.
 *
 * All data is stored in Firestore under:
 *   users/{uid}/children/{childId}/progress
 *   users/{uid}/settings
 *   users/{uid}/children/{childId}/backups/{date}
 */

import { getToday } from '../engine/sm2.js';
import { createDefaultMysteryImagesState } from '../engine/economy.js';
import {
  firestoreLoadProgress,
  firestoreSaveProgress,
  firestoreLoadAdminSettings,
  firestoreSaveAdminSettings,
  getDailyBackupsFirestore,
  restoreDailyBackupFirestore,
} from '../services/firestore.js';

const SECRET_CODE_LENGTH = 4;

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
      inventory: { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 },
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

export function createDefaultAdminSettings() {
  return {
    prodQuestionCount: 20,
    parentalCode: 'PAPA',
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

function normalizeSecretCode(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, SECRET_CODE_LENGTH);
}

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
  if (!uid || !childId) return createDefaultProgress();
  try {
    const data = await firestoreLoadProgress(uid, childId);
    if (!data || typeof data !== 'object') return createDefaultProgress();
    return data;
  } catch (error) {
    console.error('Failed to load progress from Firestore:', error);
    return createDefaultProgress();
  }
}

export async function saveProgress(progress, uid, childId) {
  if (!uid || !childId) return { success: false, error: 'uid et childId requis.' };
  try {
    await firestoreSaveProgress(uid, childId, progress);
    return { success: true };
  } catch (error) {
    console.error('Failed to save progress to Firestore:', error);
    return { success: false, error: "La progression n'a pas pu être sauvegardée." };
  }
}

// ---------------------------------------------------------------------------
// Admin settings
// ---------------------------------------------------------------------------

export async function loadAdminSettings(uid) {
  if (!uid) return createDefaultAdminSettings();
  try {
    const settings = await firestoreLoadAdminSettings(uid);
    if (!settings || typeof settings !== 'object') return createDefaultAdminSettings();
    return {
      prodQuestionCount: Math.max(1, Math.min(Number.parseInt(settings.prodQuestionCount, 10) || 20, 50)),
      parentalCode: normalizeSecretCode(settings.parentalCode) || createDefaultAdminSettings().parentalCode,
      customMysteryImages: normalizeCustomMysteryImages(settings.customMysteryImages),
    };
  } catch (error) {
    console.error('Failed to load admin settings from Firestore:', error);
    return createDefaultAdminSettings();
  }
}

export async function saveAdminSettings(settings, uid) {
  if (!uid) return { success: false, error: 'uid requis.' };
  try {
    const payload = {
      prodQuestionCount: Math.max(1, Math.min(Number.parseInt(settings?.prodQuestionCount, 10) || 20, 50)),
      parentalCode: normalizeSecretCode(settings?.parentalCode) || createDefaultAdminSettings().parentalCode,
      customMysteryImages: normalizeCustomMysteryImages(settings?.customMysteryImages),
    };
    await firestoreSaveAdminSettings(uid, payload);
    return { success: true, settings: payload };
  } catch (error) {
    console.error('Failed to save admin settings to Firestore:', error);
    return { success: false, error: "Les paramètres admin n'ont pas pu être sauvegardés." };
  }
}

// ---------------------------------------------------------------------------
// Backups
// ---------------------------------------------------------------------------

export async function getDailyBackups(uid, childId) {
  if (!uid || !childId) return [];
  try {
    return await getDailyBackupsFirestore(uid, childId);
  } catch (error) {
    console.error('Failed to load daily backups:', error);
    return [];
  }
}

export async function restoreDailyBackup(backup, uid, childId) {
  if (!uid || !childId) return { success: false, error: 'uid et childId requis.' };
  try {
    const date = typeof backup === 'string' ? backup : backup?.date;
    const progress = await restoreDailyBackupFirestore(uid, childId, date);
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
    await firestoreSaveProgress(uid, childId, empty);
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
