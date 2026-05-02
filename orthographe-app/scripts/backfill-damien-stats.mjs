/**
 * backfill-damien-stats.mjs
 *
 * One-shot migration: reconstruct statsHistory for Damien from daily backups.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/backfill-damien-stats.mjs
 *   — or —
 *   node scripts/backfill-damien-stats.mjs  (if application default credentials are set)
 */

import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────

const CHILD_ID    = 'x4DVX8Th7AG1UpRzc8Br';
const PROJECT_ID  = 'orthographe-eabb9';

// Grammar rule IDs — mirror of src/content/rules/*.json filenames (without .json)
// These are used to distinguish grammar vs dictée keys in progress.rules
const GRAMMAR_RULE_IDS = new Set([
  'a-a-as',
  'adverbes-ment',
  'ant-ent',
  'ce-se',
  'ces-ses',
  'conjugaison-3eme-groupe-present',
  'er-e-ez-ais-ait',
  'feminin-e-ee',
  'g-gu-ge',
  'groupes-verbes',
  'leur-leurs',
  'ou-ou',
  'pluriel-al-ou',
  'pluriel-noms-adjectifs',
  'pp-etre-groupe',
  'pp-ir-groupes',
  'son-sont',
]);

// ── Init Firebase Admin ───────────────────────────────────────────────────────

function initAdmin() {
  if (getApps().length > 0) return;

  // Try service account file first
  const saPath = resolve(__dirname, '..', 'serviceAccount.json');
  if (existsSync(saPath)) {
    const sa = JSON.parse(readFileSync(saPath, 'utf8'));
    initializeApp({ credential: cert(sa) });
    console.log('Initialized with service account file');
    return;
  }

  // Fall back to application default credentials (gcloud / Firebase CLI)
  initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
  console.log('Initialized with application default credentials');
}

// ── Stats computation (mirrors src/engine/stats.js) ──────────────────────────

function computeSnapshot(progress, date) {
  const rules = progress.rules || {};
  let gTotal = 0, dTotal = 0, l0 = 0, l1 = 0, l2 = 0, l3 = 0, l4 = 0;

  for (const [key, rp] of Object.entries(rules)) {
    const sessions = (rp.guidedSessionsCompleted || 0) + (rp.directSessionsCompleted || 0);
    if (GRAMMAR_RULE_IDS.has(key)) {
      gTotal += sessions;
    } else {
      dTotal += sessions;
    }
  }

  for (const ruleId of GRAMMAR_RULE_IDS) {
    const rp = rules[ruleId];
    const level = rp?.level ?? (rp?.hasDiamond ? 4 : rp?.hasCrown ? 3 : rp?.directUnlocked ? 2 : (rp?.guidedSessionsCompleted || 0) >= 1 ? 1 : 0);
    if (level === 0) l0++;
    else if (level === 1) l1++;
    else if (level === 2) l2++;
    else if (level === 3) l3++;
    else l4++;
  }

  return { date, gTotal, dTotal, l0, l1, l2, l3, l4 };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await initAdmin();
  const db = getFirestore();

  // 1. Find parent UID by scanning users collection for a child with CHILD_ID
  console.log(`\nLooking for child ${CHILD_ID}…`);
  const usersSnap = await db.collection('users').get();
  let parentUid = null;

  for (const userDoc of usersSnap.docs) {
    const childRef = userDoc.ref.collection('children').doc(CHILD_ID);
    const childSnap = await childRef.get();
    if (childSnap.exists) {
      parentUid = userDoc.id;
      console.log(`Found under uid=${parentUid}`);
      break;
    }
  }

  if (!parentUid) {
    console.error(`Child ${CHILD_ID} not found in any user document.`);
    process.exit(1);
  }

  const childRef = db.collection('users').doc(parentUid).collection('children').doc(CHILD_ID);

  // 2. Load all daily backups (up to 30)
  console.log('Loading daily backups…');
  const backupsSnap = await childRef.collection('backups').orderBy('savedAt', 'asc').get();
  console.log(`Found ${backupsSnap.docs.length} backups`);

  // 3. Build statsHistory from backups
  // Each backup doc is { id: 'YYYY-MM-DD', snapshot: progress }
  const statsHistory = [];

  for (const backupDoc of backupsSnap.docs) {
    const dateId = backupDoc.id.slice(0, 10); // handle 'YYYY-MM-DD-restore' variants
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateId)) continue; // skip restore entries

    const snapshot = backupDoc.data().snapshot;
    if (!snapshot || typeof snapshot !== 'object') continue;

    const stat = computeSnapshot(snapshot, dateId);
    // Deduplicate: same date → keep latest (last in array wins)
    const existing = statsHistory.findIndex(s => s.date === dateId);
    if (existing >= 0) {
      statsHistory[existing] = stat;
    } else {
      statsHistory.push(stat);
    }
  }

  // Sort ascending by date
  statsHistory.sort((a, b) => a.date.localeCompare(b.date));

  // Cap at 30
  if (statsHistory.length > 30) statsHistory.splice(0, statsHistory.length - 30);

  console.log(`\nReconstructed statsHistory (${statsHistory.length} entries):`);
  for (const s of statsHistory) {
    console.log(`  ${s.date}  gTotal=${s.gTotal}  dTotal=${s.dTotal}  levels=${s.l0}/${s.l1}/${s.l2}/${s.l3}/${s.l4}`);
  }

  // 4. Load current progress and patch statsHistory
  const childSnap = await childRef.get();
  const currentProgress = childSnap.data().progress;

  if (!currentProgress) {
    console.error('No current progress found.');
    process.exit(1);
  }

  // Also compute today's snapshot from current progress and append/replace
  const today = new Date().toISOString().slice(0, 10);
  const todaySnap = computeSnapshot(currentProgress, today);
  const existingToday = statsHistory.findIndex(s => s.date === today);
  if (existingToday >= 0) {
    statsHistory[existingToday] = todaySnap;
  } else {
    statsHistory.push(todaySnap);
  }

  currentProgress.statsHistory = statsHistory;

  // 5. Save back to Firestore
  console.log('\nSaving updated progress…');
  await childRef.update({ progress: currentProgress });
  console.log('Done! statsHistory written successfully.');
  console.log(`${statsHistory.length} data points spanning ${statsHistory[0]?.date} → ${statsHistory[statsHistory.length - 1]?.date}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
