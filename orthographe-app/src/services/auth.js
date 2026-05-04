import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from './firebase-auth.js';
import { db } from './firebase-db.js';

async function ensureUserDoc(user) {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      createdAt: serverTimestamp(),
      settings: { prodQuestionCount: 20 },
    });
  }
}

// Redirects the user to Google auth (no popup — avoids /__/auth/handler on custom domain).
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
  // user leaves the page — nothing runs after this
}

// Call on login page mount to complete the redirect flow and create the Firestore user doc.
export async function handleGoogleRedirectResult() {
  const result = await getRedirectResult(auth);
  if (result?.user) {
    await ensureUserDoc(result.user);
    return result.user;
  }
  return null;
}

export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDoc(result.user);
  return result.user;
}

export async function createAccountWithEmail(email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: email.split('@')[0] });
  await ensureUserDoc(result.user);
  return result.user;
}
