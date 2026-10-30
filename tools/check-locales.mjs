#!/usr/bin/env node
// Reports translation keys used in the theme that are missing from
// locales/en.default.json (storefront) or locales/en.default.schema.json (t: keys).
//
// Usage: node tools/check-locales.mjs

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const storefront = JSON.parse(readFileSync(join(root, 'locales', 'en.default.json'), 'utf8'));
const schema = JSON.parse(readFileSync(join(root, 'locales', 'en.default.schema.json'), 'utf8'));

function has(obj, key) {
  let node = obj;
  for (const part of key.split('.')) {
    if (node === null || typeof node !== 'object' || !(part in node)) return false;
    node = node[part];
  }
  // pluralized keys resolve to an object with one/other
  return typeof node === 'string' || (typeof node === 'object' && node !== null && 'other' in node);
}

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else yield path;
  }
}

const dirs = ['layout', 'sections', 'blocks', 'snippets', 'templates', 'config', 'listings'];
const missing = [];

for (const dir of dirs) {
  const full = join(root, dir);
  if (!existsSync(full)) continue;
  for (const path of files(full)) {
    if (!/\.(liquid|json)$/.test(path)) continue;
    const text = readFileSync(path, 'utf8');
    const rel = relative(root, path);
    for (const [, key] of text.matchAll(/['"]([a-z0-9_]+(?:\.[a-z0-9_]+)+)['"]\s*\|\s*t\b/g)) {
      if (!has(storefront, key)) missing.push(`${rel}: storefront key "${key}"`);
    }
    for (const [, key] of text.matchAll(/"t:([a-z0-9_.]+)"/g)) {
      if (!has(schema, key)) missing.push(`${rel}: schema key "t:${key}"`);
    }
  }
}

if (missing.length) {
  console.error(`Missing translations (${missing.length}):\n` + missing.join('\n'));
  process.exit(1);
}
console.log('All translation keys resolve.');
