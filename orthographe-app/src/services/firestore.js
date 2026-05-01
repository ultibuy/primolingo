/**
 * Firestore CRUD operations for PrimoLinguo.
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
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { getToday } from '../engine/sm2.js';

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export async function loadProgress(uid, childId) {
  const ref = doc(db, 'users', uid, 'children', childId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data.progress || null;
}

export async function saveProgress(uid, childId, progress) {
  const ref = doc(db, 'users', uid, 'children', childId);
  await updateDoc(ref, { progress });
  await createDailyBackup(uid, childId, progress);
}

// ---------------------------------------------------------------------------
// Admin settings (stored on the parent user document)
// ---------------------------------------------------------------------------

export async function loadAdminSettings(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data().settings || null;
}

export async function saveAdminSettings(uid, settings) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { settings });
}

// ---------------------------------------------------------------------------
// Parental PIN (stored hashed on the parent user document)
// ---------------------------------------------------------------------------

export async function loadParentalPin(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data().parentalPin || null;
}

export async function saveParentalPin(uid, pinData) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { parentalPin: pinData });
}

// ---------------------------------------------------------------------------
// Per-child settings (prodQuestionCount, enabledMysteryImageIds)
// ---------------------------------------------------------------------------

export async function loadChildSettings(uid, childId) {
  const ref = doc(db, 'users', uid, 'children', childId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data().childSettings || null;
}

export async function saveChildSettings(uid, childId, settings) {
  const ref = doc(db, 'users', uid, 'children', childId);
  await updateDoc(ref, { childSettings: settings });
}

// ---------------------------------------------------------------------------
// Parent-level mystery image library
// ---------------------------------------------------------------------------

export async function loadParentImages(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  return snap.data().mysteryImages || [];
}

export async function saveParentImages(uid, images) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { mysteryImages: images });
}

// ---------------------------------------------------------------------------
// Daily backups
// ---------------------------------------------------------------------------

async function createDailyBackup(uid, childId, progress) {
  const today = getToday();
  const backupRef = doc(db, 'users', uid, 'children', childId, 'backups', today);
  const backupSnap = await getDoc(backupRef);

  if (!backupSnap.exists()) {
    await setDoc(backupRef, {
      snapshot: progress,
      savedAt: serverTimestamp(),
    });
  }

  await pruneOldBackups(uid, childId, 30);
}

export async function getDailyBackups(uid, childId) {
  const ref = collection(db, 'users', uid, 'children', childId, 'backups');
  const q = query(ref, orderBy('savedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ date: d.id, ...d.data() }));
}

export async function restoreDailyBackup(uid, childId, date) {
  const backupRef = doc(db, 'users', uid, 'children', childId, 'backups', date);
  const backupSnap = await getDoc(backupRef);
  if (!backupSnap.exists()) throw new Error('Backup not found');
  const progress = backupSnap.data().snapshot;

  const childRef = doc(db, 'users', uid, 'children', childId);
  await updateDoc(childRef, { progress });

  const restoreDate = `${getToday()}-restore`;
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

  const cutoffStr = getToday(-maxDays);

  const toDelete = snap.docs.filter(d => {
    const dateId = d.id.slice(0, 10);
    return dateId < cutoffStr;
  });

  await Promise.all(toDelete.map(d => deleteDoc(d.ref)));
}

// ---------------------------------------------------------------------------
// Children CRUD (used by pages)
// ---------------------------------------------------------------------------

export function listChildren(uid, callback) {
  const ref = collection(db, 'users', uid, 'children');
  const unsub = onSnapshot(ref, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
  return unsub;
}

export async function getChild(uid, childId) {
  const snap = await getDoc(doc(db, 'users', uid, 'children', childId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createChild(uid, name, avatar) {
  const ref = doc(collection(db, 'users', uid, 'children'));
  await setDoc(ref, { name, avatar, progress: null, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateChild(uid, childId, data) {
  await updateDoc(doc(db, 'users', uid, 'children', childId), data);
}
