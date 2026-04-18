/**
 * OTP service — envoi et vérification de codes parental par email.
 *
 * Utilise EmailJS pour envoyer l'email côté client (plan gratuit : 200 emails/mois).
 * Les codes sont stockés dans Firestore sous users/{uid}/otp/{otpId}.
 *
 * CONFIGURATION : Remplacer les constantes EMAILJS_* avec vos propres valeurs
 * depuis https://www.emailjs.com/
 */

import emailjs from '@emailjs/browser';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';

// ---------------------------------------------------------------------------
// Configuration EmailJS — À renseigner après création du compte emailjs.com
// ---------------------------------------------------------------------------
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// ---------------------------------------------------------------------------
// Send OTP
// ---------------------------------------------------------------------------

export async function sendOtp(uid, email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

  // Marquer les anciens OTP comme expirés (nettoyage)
  const otpRef = collection(db, 'users', uid, 'otp');

  // Sauvegarder dans Firestore
  await addDoc(otpRef, {
    code,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    used: false,
  });

  // Envoyer via EmailJS si configuré
  if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: email,
        otp_code: code,
      },
      EMAILJS_PUBLIC_KEY
    );
  } else {
    // Mode développement : afficher le code dans la console
    console.info(`[OTP DEV] Code pour ${email}: ${code}`);
  }

  return { success: true, expiresAt };
}

// ---------------------------------------------------------------------------
// Verify OTP
// ---------------------------------------------------------------------------

export async function verifyOtp(uid, code) {
  const now = new Date();
  const otpRef = collection(db, 'users', uid, 'otp');

  const q = query(
    otpRef,
    where('code', '==', code),
    where('used', '==', false),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return { valid: false, reason: 'invalid' };

  const otpDoc = snapshot.docs[0];
  const data = otpDoc.data();

  if (new Date(data.expiresAt) < now) {
    return { valid: false, reason: 'expired' };
  }

  // Marquer comme utilisé
  await updateDoc(otpDoc.ref, { used: true });
  return { valid: true };
}
