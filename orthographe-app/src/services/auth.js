import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from './firebase-auth.js';
import { db } from './firebase-db.js';

// Safari on iOS blocks popups opened outside a direct user gesture — use redirect instead.
function isSafariIOS() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
}

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

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  if (isSafariIOS()) {
    await signInWithRedirect(auth, provider);
    return null; // page will reload — result handled by getRedirectResult in AuthContext
  }
  const result = await signInWithPopup(auth, provider);
  await ensureUserDoc(result.user);
  return result.user;
}

export async function signUpWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  if (isSafariIOS()) {
    await signInWithRedirect(auth, provider);
    return null;
  }
  const result = await signInWithPopup(auth, provider);
  await ensureUserDoc(result.user);
  return result.user;
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
