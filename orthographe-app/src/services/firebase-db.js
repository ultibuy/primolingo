import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import app from './firebase-core.js';

export const db = getFirestore(app);

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
    console.warn('Firestore offline persistence failed:', err.code);
  }
});
