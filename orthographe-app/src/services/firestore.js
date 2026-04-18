/**
 * Firestore CRUD operations for OrthoQuest.
 * All data lives under: users/{uid}/children/{childId}
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function firestoreLoadProgress(uid, childId) {
  const ref = doc(db, 'users', uid, 'children', childId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data.progress || null;
}

export async function firestoreSaveProgress(uid, childId, progress) {
  const ref = doc(db, 'users', uid, 'children', childId);
  await updateDoc(ref, { progress });
  // Create daily backup (once per day)
  await createDailyBackup(uid, childId, progress);
}

// ---------------------------------------------------------------------------
// Admin settings (stored on the parent user document)
// ---------------------------------------------------------------------------

export async function firestoreLoadAdminSettings(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data().settings || null;
}

export async function firestoreSaveAdminSettings(uid, settings) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { settings });
}

// ---------------------------------------------------------------------------
// Daily backups
// ---------------------------------------------------------------------------

export async function createDailyBackup(uid, childId, progress) {
  const today = new Date().toISOString().slice(0, 10);
  const backupRef = doc(db, 'users', uid, 'children', childId, 'backups', today);
  const backupSnap = await getDoc(backupRef);

  if (!backupSnap.exists()) {
    await setDoc(backupRef, {
      snapshot: progress,
      savedAt: serverTimestamp(),
    });
  }

  // Prune backups older than 30 days
  await pruneOldBackups(uid, childId, 30);
}

export async function getDailyBackupsFirestore(uid, childId) {
  const ref = collection(db, 'users', uid, 'children', childId, 'backups');
  const q = query(ref, orderBy('savedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ date: d.id, ...d.data() }));
}

export async function restoreDailyBackupFirestore(uid, childId, date) {
  const backupRef = doc(db, 'users', uid, 'children', childId, 'backups', date);
  const backupSnap = await getDoc(backupRef);
  if (!backupSnap.exists()) throw new Error('Backup not found');
  const progress = backupSnap.data().snapshot;

  // Write restored progress
  const childRef = doc(db, 'users', uid, 'children', childId);
  await updateDoc(childRef, { progress });

  // Create a restore-point backup
  const restoreDate = `${new Date().toISOString().slice(0, 10)}-restore`;
  await setDoc(doc(db, 'users', uid, 'children', childId, 'backups', restoreDate), {
    snapshot: progress,
    savedAt: serverTimestamp(),
    restoredFrom: date,
  });

  return progress;
}

async function pruneOldBackups(uid, childId, maxDays) {
  const ref = collection(db, 'users', uid, 'children', childId, 'backups');
  const snap = await getDocs(ref);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDays);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  const toDelete = snap.docs.filter(d => {
    const dateId = d.id.slice(0, 10);
    return dateId < cutoffStr;
  });

  await Promise.all(toDelete.map(d => deleteDoc(d.ref)));
}
