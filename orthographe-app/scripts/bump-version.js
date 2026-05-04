#!/usr/bin/env node
/**
 * Increments the patch number (xxx) in docs/version.json.
 * Run automatically before each deploy.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const versionPath = join(__dirname, '..', 'docs', 'version.json');

const version = JSON.parse(readFileSync(versionPath, 'utf-8'));
version.patch += 1;
writeFileSync(versionPath, JSON.stringify(version, null, 2) + '\n', 'utf-8');

console.log(`Version: ${version.major}.${version.minor}.${String(version.patch).padStart(3, '0')}`);
