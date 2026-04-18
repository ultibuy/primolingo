/**
 * Migration script: user-data/progress.json → Firestore
 *
 * Usage:
 *   1. Connecte-toi à Firebase: firebase login
 *   2. Lance le script: node scripts/migrate-local-to-firestore.js
 *
 * Le script va:
 *   1. Lire user-data/progress.json
 *   2. Lire user-data/admin-settings.json
 *   3. Créer un profil enfant "Damien" sous le compte parent
 *   4. Migrer le progress dans Firestore
 *   5. Créer un backup "pre-migration"
 *
 * Avant de lancer, renseignez les variables ci-dessous:
 */

// ==========================================
// À CONFIGURER avant de lancer le script
// ==========================================
const PARENT_UID = '';  // UID Firebase du parent (visible dans Firebase Auth Console)
const CHILD_NAME = 'Damien';
const CHILD_AVATAR = '🦊';
// ==========================================

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Validate config
if (!PARENT_UID) {
  console.error('❌ Erreur: PARENT_UID non renseigné dans le script.');
  console.error('   Trouve ton UID dans Firebase Console > Authentication > Users');
  process.exit(1);
}

// Initialize Firebase Admin with Application Default Credentials
// (works after `firebase login` which sets up ADC)
initializeApp({
  projectId: 'orthographe-eabb9',
});

const db = getFirestore();

async function migrate() {
  console.log('🚀 Démarrage de la migration...\n');

  // 1. Read local progress
  const progressPath = join(ROOT, 'user-data', 'progress.json');
  let progress;
  try {
    progress = JSON.parse(readFileSync(progressPath, 'utf-8'));
    console.log('✅ progress.json lu');
  } catch (err) {
    console.error('❌ Impossible de lire user-data/progress.json:', err.message);
    process.exit(1);
  }

  // 2. Read admin settings
  const settingsPath = join(ROOT, 'user-data', 'admin-settings.json');
  let adminSettings;
  try {
    adminSettings = JSON.parse(readFileSync(settingsPath, 'utf-8'));
    console.log('✅ admin-settings.json lu');
  } catch {
    console.warn('⚠️  admin-settings.json non trouvé, utilisation des valeurs par défaut');
    adminSettings = { prodQuestionCount: 20 };
  }

  // 3. Ensure parent user document exists
  const userRef = db.collection('users').doc(PARENT_UID);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    await userRef.set({
      email: '',
      displayName: 'Parent',
      createdAt: Timestamp.now(),
      settings: {
        prodQuestionCount: adminSettings.prodQuestionCount || 20,
        customMysteryImages: adminSettings.customMysteryImages || [],
      },
    });
    console.log('✅ Document parent créé dans Firestore');
  } else {
    // Update settings
    await userRef.update({
      settings: {
        prodQuestionCount: adminSettings.prodQuestionCount || 20,
        customMysteryImages: adminSettings.customMysteryImages || [],
      },
    });
    console.log('✅ Settings parent mis à jour dans Firestore');
  }

  // 4. Create child document with progress
  const childRef = db.collection('users').doc(PARENT_UID).collection('children').doc();
  const childId = childRef.id;

  // Remove local-only fields from progress
  const cleanProgress = { ...progress };
  delete cleanProgress.userId;

  await childRef.set({
    name: CHILD_NAME,
    avatar: CHILD_AVATAR,
    createdAt: Timestamp.now(),
    progress: cleanProgress,
  });
  console.log(`✅ Profil "${CHILD_NAME}" créé (childId: ${childId})`);

  // 5. Create pre-migration backup
  const today = new Date().toISOString().slice(0, 10);
  const backupRef = childRef.collection('backups').doc(`${today}-pre-migration`);
  await backupRef.set({
    snapshot: cleanProgress,
    savedAt: Timestamp.now(),
    note: 'Backup pre-migration depuis user-data/progress.json',
  });
  console.log('✅ Backup pre-migration créé');

  console.log('\n✨ Migration terminée avec succès !');
  console.log(`\n📱 Pour accéder au jeu: https://orthographe-eabb9.web.app/play/${childId}`);
  console.log('\n⚠️  Note: Après vérification, tu peux supprimer le dossier user-data/');
}

migrate().catch(err => {
  console.error('❌ Erreur de migration:', err);
  process.exit(1);
});
