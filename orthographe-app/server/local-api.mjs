import { createServer } from 'node:http';
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'user-data');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const RULES_DIR = path.join(ROOT_DIR, 'src', 'content', 'rules');
const ADMIN_SETTINGS_FILE = path.join(DATA_DIR, 'admin-settings.json');
const PORT = Number(process.env.PORT || 3001);
const MAX_DAILY_BACKUPS = 30;
const SECRET_CODE_LENGTH = 4;
const SECRET_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function pad(value) {
  return String(value).padStart(2, '0');
}

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function getTimestampSlug() {
  const now = new Date();
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
  ].join('-') + `T${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

function normalizeSecretCode(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, SECRET_CODE_LENGTH);
}

function generateSecretCode() {
  let code = '';
  for (let i = 0; i < SECRET_CODE_LENGTH; i += 1) {
    code += SECRET_CODE_ALPHABET[Math.floor(Math.random() * SECRET_CODE_ALPHABET.length)];
  }
  return code;
}

function clampQuestionCount(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(parsed, 50));
}

function sanitizeRuleId(value) {
  return String(value || '').replace(/[^a-z0-9-]/gi, '');
}

async function ensureDataDirs() {
  await mkdir(DATA_DIR, { recursive: true });
}

function normalizeProfile(value) {
  return value === 'debug' ? 'debug' : 'prod';
}

function getProfile(req) {
  return normalizeProfile(req.headers['x-ortho-profile']);
}

function getProfilePaths(profile) {
  if (profile === 'debug') {
    return {
      progressFile: path.join(DATA_DIR, 'progress.debug.json'),
      backupDir: path.join(DATA_DIR, 'backups.debug'),
      restorePointDir: path.join(DATA_DIR, 'restore-points.debug'),
    };
  }

  return {
    progressFile: path.join(DATA_DIR, 'progress.json'),
    backupDir: path.join(DATA_DIR, 'backups'),
    restorePointDir: path.join(DATA_DIR, 'restore-points'),
  };
}

async function ensureProfileDirs(profile) {
  const { backupDir, restorePointDir } = getProfilePaths(profile);
  await ensureDataDirs();
  await mkdir(backupDir, { recursive: true });
  await mkdir(restorePointDir, { recursive: true });
}

async function readJsonFile(filePath) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJsonAtomic(filePath, value) {
  const tempFile = `${filePath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(tempFile, filePath);
}

async function readProgressOrNull(profile) {
  const { progressFile } = getProfilePaths(profile);
  try {
    return await readJsonFile(progressFile);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function createDefaultAdminSettings(secretCode = generateSecretCode()) {
  return {
    prodQuestionCount: 20,
    debugQuestionCount: 1,
    parentalCode: secretCode,
    customMysteryImages: [],
  };
}

function sanitizeCustomMysteryImages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => ({
      id: String(entry?.id || '').trim(),
      title: String(entry?.title || '').trim(),
      imageDataUrl: String(entry?.imageDataUrl || '').trim(),
      finalTileIndex: Math.max(0, Math.min(Number.parseInt(entry?.finalTileIndex, 10) || 0, 5)),
    }))
    .filter((entry) => entry.id && entry.title && entry.imageDataUrl);
}

function sanitizeAdminSettings(value, fallbackCode = generateSecretCode()) {
  const next = value && typeof value === 'object' ? value : {};
  return {
    prodQuestionCount: clampQuestionCount(next.prodQuestionCount, 20),
    debugQuestionCount: clampQuestionCount(next.debugQuestionCount, 1),
    parentalCode: normalizeSecretCode(next.parentalCode) || fallbackCode,
    customMysteryImages: sanitizeCustomMysteryImages(next.customMysteryImages),
  };
}

async function readLegacyParentalCode() {
  const prodProgress = await readProgressOrNull('prod');
  const code = normalizeSecretCode(prodProgress?.parentalCode?.code);
  return code || null;
}

async function readAdminSettings() {
  await ensureDataDirs();

  try {
    const payload = await readJsonFile(ADMIN_SETTINGS_FILE);
    const fallbackCode = normalizeSecretCode(payload?.parentalCode) || generateSecretCode();
    const normalized = sanitizeAdminSettings(payload, fallbackCode);
    if (JSON.stringify(payload) !== JSON.stringify(normalized)) {
      await writeJsonAtomic(ADMIN_SETTINGS_FILE, normalized);
    }
    return normalized;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const legacyCode = await readLegacyParentalCode();
  const defaults = createDefaultAdminSettings(legacyCode || generateSecretCode());
  await writeJsonAtomic(ADMIN_SETTINGS_FILE, defaults);
  return defaults;
}

async function saveAdminSettings(settings) {
  const current = await readAdminSettings();
  const normalized = sanitizeAdminSettings(settings, current.parentalCode);
  await writeJsonAtomic(ADMIN_SETTINGS_FILE, normalized);
  return normalized;
}

async function saveRuleDefinition(ruleId, patch) {
  const safeRuleId = sanitizeRuleId(ruleId);
  if (!safeRuleId) {
    throw new Error('Invalid rule id.');
  }

  const ruleFile = path.join(RULES_DIR, `${safeRuleId}.json`);
  let existing;
  try {
    existing = await readJsonFile(ruleFile);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const notFound = new Error('Rule not found.');
      notFound.code = 'ENOENT';
      throw notFound;
    }
    throw error;
  }

  const next = {
    ...existing,
    title: patch.title ?? existing.title,
    shortTitle: patch.shortTitle ?? existing.shortTitle,
    description: patch.description ?? existing.description,
    choices: Array.isArray(patch.choices) ? patch.choices : existing.choices,
    decisionAxes: Array.isArray(patch.decisionAxes) ? patch.decisionAxes : existing.decisionAxes,
    memoCard: patch.memoCard && typeof patch.memoCard === 'object' ? patch.memoCard : existing.memoCard,
  };

  await writeJsonAtomic(ruleFile, next);
  return next;
}

async function listBackups(profile) {
  const { backupDir } = getProfilePaths(profile);
  await ensureProfileDirs(profile);

  const entries = await readdir(backupDir, { withFileTypes: true });
  const backups = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const filePath = path.join(backupDir, entry.name);

    try {
      const payload = await readJsonFile(filePath);
      if (!payload || typeof payload !== 'object') continue;
      if (typeof payload.date !== 'string' || typeof payload.savedAt !== 'string' || !payload.snapshot) continue;
      backups.push(payload);
    } catch {
      // Ignore corrupted backup files instead of breaking the whole API.
    }
  }

  backups.sort((a, b) => a.date.localeCompare(b.date));
  return backups;
}

async function listBackupsForAllProfiles() {
  const profiles = ['prod', 'debug'];
  const allBackups = [];

  for (const profile of profiles) {
    const backups = await listBackups(profile);
    for (const backup of backups) {
      allBackups.push({
        ...backup,
        profile,
      });
    }
  }

  allBackups.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.profile.localeCompare(b.profile);
  });
  return allBackups;
}

async function pruneBackups(profile) {
  const { backupDir } = getProfilePaths(profile);
  const backups = await listBackups(profile);
  const toDelete = backups.slice(0, Math.max(0, backups.length - MAX_DAILY_BACKUPS));

  await Promise.all(
    toDelete.map((backup) => rm(path.join(backupDir, `${backup.date}.json`), { force: true })),
  );
}

async function saveDailyBackup(profile, progress) {
  const { backupDir } = getProfilePaths(profile);
  await ensureProfileDirs(profile);

  const payload = {
    date: getToday(),
    savedAt: new Date().toISOString(),
    snapshot: progress,
  };

  await writeJsonAtomic(path.join(backupDir, `${payload.date}.json`), payload);
  await pruneBackups(profile);
}

async function saveRestorePoint(profile, progress, reason = 'restore') {
  if (!progress) return null;

  const { restorePointDir } = getProfilePaths(profile);
  await ensureProfileDirs(profile);
  const savedAt = new Date().toISOString();
  const slug = `${reason}-${getTimestampSlug()}`;
  const payload = {
    kind: 'restore-point',
    reason,
    savedAt,
    snapshot: progress,
  };

  const filePath = path.join(restorePointDir, `${slug}.json`);
  await writeJsonAtomic(filePath, payload);
  return { filePath, savedAt };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Ortho-Profile',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  });
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, payload, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

async function readRequestJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return null;
  return JSON.parse(raw);
}

function getContentType(filePath) {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8';
  if (filePath.endsWith('.svg')) return 'image/svg+xml';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.webp')) return 'image/webp';
  if (filePath.endsWith('.ico')) return 'image/x-icon';
  return 'application/octet-stream';
}

async function serveStatic(req, res) {
  let pathname = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`).pathname;
  if (pathname === '/') pathname = '/index.html';

  const candidatePath = path.normalize(path.join(DIST_DIR, pathname));
  if (!candidatePath.startsWith(DIST_DIR)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  try {
    const fileStat = await stat(candidatePath);
    if (fileStat.isFile()) {
      const content = await readFile(candidatePath);
      sendText(res, 200, content, getContentType(candidatePath));
      return;
    }
  } catch {
    // Fall through to SPA index.
  }

  try {
    const indexHtml = await readFile(path.join(DIST_DIR, 'index.html'));
    sendText(res, 200, indexHtml, 'text/html; charset=utf-8');
  } catch {
    sendText(res, 404, 'Build not found. Run "npm run build" or use "npm run dev" with "npm run backend".');
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Ortho-Profile',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      });
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    const profile = getProfile(req);

    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, { ok: true, profile });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/progress') {
      const progress = await readProgressOrNull(profile);
      if (!progress) {
        sendJson(res, 404, { error: 'Progress not found.' });
        return;
      }
      sendJson(res, 200, progress);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/admin-settings') {
      const settings = await readAdminSettings();
      sendJson(res, 200, settings);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/admin-settings') {
      const payload = await readRequestJson(req);
      if (!payload || typeof payload !== 'object') {
        sendJson(res, 400, { error: 'Invalid admin settings payload.' });
        return;
      }

      const settings = await saveAdminSettings(payload);
      sendJson(res, 200, { success: true, settings });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/save-rule') {
      const payload = await readRequestJson(req);
      const ruleId = payload?.id;
      const data = payload?.data;

      if (typeof ruleId !== 'string' || !ruleId || !data || typeof data !== 'object') {
        sendJson(res, 400, { error: 'Invalid rule payload.' });
        return;
      }

      try {
        const rule = await saveRuleDefinition(ruleId, data);
        sendJson(res, 200, { success: true, rule });
      } catch (error) {
        if (error.code === 'ENOENT') {
          sendJson(res, 404, { error: 'Rule not found.' });
          return;
        }
        throw error;
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/progress') {
      const progress = await readRequestJson(req);
      if (!progress || typeof progress !== 'object') {
        sendJson(res, 400, { error: 'Invalid progress payload.' });
        return;
      }

      const { progressFile } = getProfilePaths(profile);
      await ensureProfileDirs(profile);
      await writeJsonAtomic(progressFile, progress);
      await saveDailyBackup(profile, progress);
      sendJson(res, 200, { success: true });
      return;
    }

    if (req.method === 'DELETE' && url.pathname === '/api/progress') {
      const { progressFile } = getProfilePaths(profile);
      await rm(progressFile, { force: true });
      await ensureProfileDirs(profile);
      sendJson(res, 200, { success: true });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/backups') {
      const backups = await listBackups(profile);
      sendJson(
        res,
        200,
        backups.map(({ date, savedAt }) => ({ date, savedAt })),
      );
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/backups/all') {
      const backups = await listBackupsForAllProfiles();
      sendJson(
        res,
        200,
        backups.map(({ date, savedAt, profile }) => ({ date, savedAt, profile })),
      );
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/backups/restore') {
      const body = await readRequestJson(req);
      const date = body?.date;
      const targetProfile = normalizeProfile(body?.profile || profile);

      if (typeof date !== 'string' || !date) {
        sendJson(res, 400, { error: 'Backup date is required.' });
        return;
      }

      const { backupDir, progressFile } = getProfilePaths(targetProfile);
      const backupPath = path.join(backupDir, `${date}.json`);
      let backup;

      try {
        backup = await readJsonFile(backupPath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          sendJson(res, 404, { error: 'Backup not found.' });
          return;
        }
        throw error;
      }

      const currentProgress = await readProgressOrNull(targetProfile);
      await saveRestorePoint(targetProfile, currentProgress, 'before-restore');
      await writeJsonAtomic(progressFile, backup.snapshot);
      sendJson(res, 200, { success: true, progress: backup.snapshot });
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    console.error('[local-api]', error);
    sendJson(res, 500, { error: 'Internal server error.' });
  }
});

server.listen(PORT, async () => {
  await ensureProfileDirs('prod');
  await ensureProfileDirs('debug');
  console.log(`[local-api] listening on http://127.0.0.1:${PORT}`);
});
