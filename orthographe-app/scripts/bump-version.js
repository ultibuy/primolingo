#!/usr/bin/env node
/**
 * Increments the patch number in docs/version.json AND package.json (kept in sync).
 * Also writes public/version.json so the UpdateBanner can fetch it at runtime.
 * Run automatically before each deploy via firebase.json predeploy.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const versionPath = join(__dirname, '..', 'docs', 'version.json');
const publicVersionPath = join(__dirname, '..', 'public', 'version.json');
const packagePath = join(__dirname, '..', 'package.json');

const version = JSON.parse(readFileSync(versionPath, 'utf-8'));
version.patch += 1;
const versionString = `${version.major}.${version.minor}.${String(version.patch).padStart(3, '0')}`;

writeFileSync(versionPath, JSON.stringify(version, null, 2) + '\n', 'utf-8');
writeFileSync(publicVersionPath, JSON.stringify(version, null, 2) + '\n', 'utf-8');

const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
pkg.version = versionString;
writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

console.log(`Version bumped → ${versionString}`);
