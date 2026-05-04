#!/usr/bin/env node
/**
 * run-predeploy.js — Pre-deploy checks: lint + build + unit tests + E2E against dist/.
 * Blocks deploy if anything fails.
 */
import { execSync, spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const TESTS_DIR = join(__dirname, '..');

const PREVIEW_PORT = process.env.PREVIEW_PORT || 4173;
const BASE_URL = `http://localhost:${PREVIEW_PORT}`;

function run(label, cmd) {
  console.log(`\n── ${label} ──`);
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit', timeout: 120000 });
    console.log(`✅ ${label}\n`);
    return true;
  } catch {
    console.error(`❌ ${label} FAILED\n`);
    return false;
  }
}

// Step 1: Lint
if (!run('Lint', 'npm run lint')) process.exit(1);

// Step 2: Build
if (!run('Build', 'npm run build')) process.exit(1);

// Step 3: Unit tests (predeploy only)
const registryPath = join(ROOT, 'src/debug/testRegistry.js');
const registryContent = readFileSync(registryPath, 'utf-8');
const match = registryContent.match(/const testRegistry = (\[[\s\S]*?\]);/);
let registry;
if (match) {
  registry = new Function(`return ${match[1]}`)();
} else {
  console.error('Could not parse testRegistry.js');
  process.exit(1);
}

const unitFiles = [...new Set(
  registry.filter(t => t.type === 'unit' && t.predeploy).map(t => t.file)
)];

console.log(`\n── Unit tests (${unitFiles.length} files) ──`);
let unitFailed = false;
for (const file of unitFiles) {
  try {
    execSync(`node "${join(TESTS_DIR, file)}"`, { cwd: ROOT, stdio: 'pipe', timeout: 30000 });
    console.log(`  ✅ ${file}`);
  } catch (err) {
    console.log(`  ❌ ${file}`);
    if (err.stdout) console.log(err.stdout.toString().split('\n').slice(-3).join('\n'));
    unitFailed = true;
  }
}
if (unitFailed) { console.error('\n❌ Unit tests failed'); process.exit(1); }
console.log('✅ Unit tests passed\n');

// Step 4: E2E against dist/ (predeploy only)
const e2eFiles = [...new Set(
  registry.filter(t => t.type === 'e2e' && t.predeploy).map(t => t.file)
)];

if (e2eFiles.length === 0) {
  console.log('── No predeploy E2E tests ──\n');
} else {
  console.log(`\n── E2E predeploy tests (${e2eFiles.length} files) against dist/ ──`);
  console.log('  Starting vite preview...');

  const server = spawn('npx', ['vite', 'preview', '--port', String(PREVIEW_PORT)], {
    cwd: ROOT,
    stdio: 'pipe',
    shell: true,
  });

  async function waitForServer(url, maxWait = 20000) {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      try {
        const res = await fetch(url);
        if (res.ok) return true;
      } catch { /* not ready */ }
      await new Promise(r => setTimeout(r, 500));
    }
    return false;
  }

  const ready = await waitForServer(BASE_URL);
  if (!ready) {
    console.error('  ❌ Preview server did not start');
    try { server.kill(); } catch {}
    process.exit(1);
  }
  console.log('  Preview server ready.\n');

  let e2eFailed = false;
  for (const file of e2eFiles) {
    try {
      execSync(`BASE_URL=${BASE_URL} node "${join(TESTS_DIR, file)}"`, {
        cwd: ROOT,
        stdio: 'pipe',
        timeout: 120000,
        env: { ...process.env, BASE_URL },
      });
      console.log(`  ✅ ${file}`);
    } catch (err) {
      console.log(`  ❌ ${file}`);
      if (err.stdout) console.log(err.stdout.toString().split('\n').slice(-5).join('\n'));
      e2eFailed = true;
    }
  }

  try { server.kill('SIGTERM'); } catch {}

  if (e2eFailed) { console.error('\n❌ E2E predeploy tests failed'); process.exit(1); }
  console.log('✅ E2E predeploy tests passed\n');
}

console.log('══════════════════════════════════════════');
console.log('✅ All predeploy checks passed. Safe to deploy.');
