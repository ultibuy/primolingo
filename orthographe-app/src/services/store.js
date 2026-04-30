/**
 * Storage router — single place that decides local vs Firestore.
 *
 * DEV (localhost / vite dev): everything goes to localStorage.
 * PROD (built app):           everything goes to Firestore.
 *
 * import.meta.env.DEV is resolved at build-time, so the unused
 * backend is tree-shaken out of the production bundle entirely.
 */

const backend = import.meta.env.DEV
  ? await import('./local-store.js')
  : await import('./firestore.js');

export const loadProgress = backend.loadProgress;
export const saveProgress = backend.saveProgress;
export const loadAdminSettings = backend.loadAdminSettings;
export const saveAdminSettings = backend.saveAdminSettings;
export const loadChildSettings = backend.loadChildSettings;
export const saveChildSettings = backend.saveChildSettings;
export const loadParentImages = backend.loadParentImages;
export const saveParentImages = backend.saveParentImages;
export const getDailyBackups = backend.getDailyBackups;
export const restoreDailyBackup = backend.restoreDailyBackup;

export const loadParentalPin = backend.loadParentalPin;
export const saveParentalPin = backend.saveParentalPin;

// Children CRUD (used by pages directly)
export const listChildren = backend.listChildren;
export const getChild = backend.getChild;
export const createChild = backend.createChild;
export const updateChild = backend.updateChild;
