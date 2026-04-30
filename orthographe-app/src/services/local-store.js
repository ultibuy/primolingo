/**
 * Local storage adapter — same interface as firestore.js.
 * All data lives in localStorage, keyed by uid/childId.
 */

function key(parts) {
  return `local:${parts.join(':')}`;
}

function read(k) {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function write(k, value) {
  localStorage.setItem(k, JSON.stringify(value));
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function loadProgress(uid, childId) {
  return read(key(['progress', uid, childId]));
}

export async function saveProgress(uid, childId, progress) {
  write(key(['progress', uid, childId]), progress);
  const today = new Date().toISOString().slice(0, 10);
  const backups = read(key(['backups', uid, childId])) || {};
  if (!backups[today]) {
    backups[today] = { snapshot: progress, savedAt: new Date().toISOString() };
    write(key(['backups', uid, childId]), backups);
  }
}

// ---------------------------------------------------------------------------
// Admin settings
// ---------------------------------------------------------------------------

export async function loadAdminSettings(uid) {
  return read(key(['adminSettings', uid]));
}

export async function saveAdminSettings(uid, settings) {
  write(key(['adminSettings', uid]), settings);
}

// ---------------------------------------------------------------------------
// Parental PIN
// ---------------------------------------------------------------------------

export async function loadParentalPin(uid) {
  return read(key(['parentalPin', uid]));
}

export async function saveParentalPin(uid, pinData) {
  write(key(['parentalPin', uid]), pinData);
}

// ---------------------------------------------------------------------------
// Per-child settings
// ---------------------------------------------------------------------------

export async function loadChildSettings(uid, childId) {
  return read(key(['childSettings', uid, childId]));
}

export async function saveChildSettings(uid, childId, settings) {
  write(key(['childSettings', uid, childId]), settings);
}

// ---------------------------------------------------------------------------
// Parent images
// ---------------------------------------------------------------------------

export async function loadParentImages(uid) {
  return read(key(['parentImages', uid])) || [];
}

export async function saveParentImages(uid, images) {
  write(key(['parentImages', uid]), images);
}

// ---------------------------------------------------------------------------
// Backups
// ---------------------------------------------------------------------------

export async function getDailyBackups(uid, childId) {
  const backups = read(key(['backups', uid, childId])) || {};
  return Object.entries(backups)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function restoreDailyBackup(uid, childId, date) {
  const backups = read(key(['backups', uid, childId])) || {};
  const backup = backups[date];
  if (!backup) throw new Error('Backup not found');
  write(key(['progress', uid, childId]), backup.snapshot);
  return backup.snapshot;
}

// ---------------------------------------------------------------------------
// Children CRUD (used by pages)
// ---------------------------------------------------------------------------

const DEFAULT_CHILD = { id: 'local-child', name: 'Debug', avatar: '🦊' };

function readChildren(uid) {
  const k = key(['children', uid]);
  const stored = read(k);
  if (stored && stored.length > 0) return stored;
  // First time: persist the default so all functions see it
  const initial = [{ ...DEFAULT_CHILD }];
  write(k, initial);
  return initial;
}

export function listChildren(uid, callback) {
  callback(readChildren(uid));
  return () => {};
}

export async function getChild(uid, childId) {
  return readChildren(uid).find(c => c.id === childId) || null;
}

export async function createChild(uid, name, avatar) {
  const children = readChildren(uid);
  const id = `child-${Date.now()}`;
  children.push({ id, name, avatar });
  write(key(['children', uid]), children);
  return id;
}

export async function updateChild(uid, childId, data) {
  const children = readChildren(uid);
  const idx = children.findIndex(c => c.id === childId);
  if (idx >= 0) Object.assign(children[idx], data);
  write(key(['children', uid]), children);
}
