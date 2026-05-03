#!/usr/bin/env node
/**
 * Captures all documentation screenshots in sequence.
 * Starts a dev server, runs all 4 capture scripts, then kills the server.
 *
 * Usage: node docs/capture-all.js
 */
import { execSync, spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = 5199;
const BASE_URL = `http://localhost:${PORT}`;

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

console.log('\n🚀 Starting dev server...');
const server = spawn('npx', ['vite', '--port', String(PORT)], {
  cwd: ROOT, stdio: 'pipe', shell: true,
});

const ready = await waitForServer(BASE_URL);
if (!ready) {
  console.error('❌ Dev server did not start');
  server.kill();
  process.exit(1);
}
console.log('✅ Dev server ready\n');

const scripts = [
  ['App screenshots', 'docs/capture-screenshots.js'],
  ['Coaching messages', 'docs/capture-coaching-screenshots.js'],
  ['EndScreen fixtures', 'docs/capture-endscreen.js'],
  ['Shop + Rewards', 'docs/capture-shop-rewards.js'],
];

let failed = false;
for (const [label, script] of scripts) {
  console.log(`\n── ${label} ──`);
  try {
    execSync(`BASE_URL=${BASE_URL} node ${script}`, {
      cwd: ROOT, stdio: 'inherit', timeout: 300000,
      env: { ...process.env, BASE_URL },
    });
  } catch (err) {
    console.error(`⚠️  ${label} failed`);
    failed = true;
  }
}

server.kill();

if (failed) {
  console.log('\n⚠️  Some captures failed. Check output above.\n');
  process.exit(1);
} else {
  console.log('\n✅ All documentation screenshots captured!\n');
}
