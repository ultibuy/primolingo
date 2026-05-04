#!/usr/bin/env node
/**
 * run-unit.js — Runs all unit tests listed in testRegistry.
 * Reads the registry, deduplicates by file, executes each.
 */
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const TESTS_DIR = join(__dirname, '..');

// Import registry — parse it manually since it uses ESM export
const registryPath = join(ROOT, 'src/debug/testRegistry.js');
const registryContent = readFileSync(registryPath, 'utf-8');
// Extract the array by evaluating — safe since we control the file
const match = registryContent.match(/const testRegistry = (\[[\s\S]*?\]);/);
let registry;
if (match) {
  registry = new Function(`return ${match[1]}`)();
} else {
  console.error('Could not parse testRegistry.js');
  process.exit(1);
}

// Filter unit tests and deduplicate by file
const unitFiles = [...new Set(
  registry.filter(t => t.type === 'unit').map(t => t.file)
)];

console.log(`\n🧪 Running ${unitFiles.length} unit test files...\n`);

let passed = 0;
let failed = 0;
const failures = [];

for (const file of unitFiles) {
  const filePath = join(TESTS_DIR, file);
  try {
    console.log(`  ▶ ${file}`);
    execSync(`node "${filePath}"`, { cwd: ROOT, stdio: 'pipe', timeout: 30000 });
    console.log(`  ✅ ${file}\n`);
    passed++;
  } catch (err) {
    console.log(`  ❌ ${file}`);
    if (err.stdout) console.log(err.stdout.toString().split('\n').slice(-5).join('\n'));
    console.log('');
    failed++;
    failures.push(file);
  }
}

console.log(`${'─'.repeat(50)}`);
console.log(`Unit tests: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log(`\nFailed files:`);
  failures.forEach(f => console.log(`  • ${f}`));
  process.exit(1);
} else {
  console.log(`\n✅ All unit tests passed!`);
}
