#!/usr/bin/env node
/**
 * run-e2e.js — Runs all E2E tests against a dev server.
 * Starts vite dev, waits for readiness, runs Playwright tests, then kills the server.
 */
import { execSync, spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const TESTS_DIR = join(__dirname, '..');

const PORT = process.env.PORT || 5199;
const BASE_URL = `http://localhost:${PORT}`;

// Parse registry
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

// Filter E2E tests and deduplicate by file
const e2eFiles = [...new Set(
  registry.filter(t => t.type === 'e2e').map(t => t.file)
)];

console.log(`\n🎭 Running ${e2eFiles.length} E2E test files against ${BASE_URL}...\n`);

// Start dev server
console.log('  Starting vite dev server...');
const server = spawn('npx', ['vite', '--port', String(PORT)], {
  cwd: ROOT,
  stdio: 'pipe',
  shell: true,
});

// Wait for server to be ready
async function waitForServer(url, maxWait = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

function killServer() {
  try { server.kill('SIGTERM'); } catch { /* already dead */ }
}

const ready = await waitForServer(BASE_URL);
if (!ready) {
  console.error('  ❌ Dev server did not start within 30s');
  killServer();
  process.exit(1);
}
console.log('  Dev server ready.\n');

let passed = 0;
let failed = 0;
const failures = [];

for (const file of e2eFiles) {
  const filePath = join(TESTS_DIR, file);
  try {
    console.log(`  ▶ ${file}`);
    execSync(`BASE_URL=${BASE_URL} node "${filePath}"`, {
      cwd: ROOT,
      stdio: 'pipe',
      timeout: 120000,
      env: { ...process.env, BASE_URL },
    });
    console.log(`  ✅ ${file}\n`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${file}`);
    if (err.stdout) console.log(err.stdout.toString().split('\n').slice(-8).join('\n'));
    console.log('');
    failed++;
    failures.push(file);
  }
}

killServer();

console.log(`${'─'.repeat(50)}`);
console.log(`E2E tests: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log(`\nFailed files:`);
  failures.forEach(f => console.log(`  • ${f}`));
  process.exit(1);
} else {
  console.log(`\n✅ All E2E tests passed!`);
}
