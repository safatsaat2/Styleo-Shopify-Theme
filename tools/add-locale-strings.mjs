#!/usr/bin/env node
// Deep-merges a JSON file of storefront strings into locales/en.default.json.
// Existing keys are kept unless --overwrite is passed.
//
// Usage: node tools/add-locale-strings.mjs path/to/strings.json [--overwrite]

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localePath = join(root, 'locales', 'en.default.json');
const [, , source, flag] = process.argv;
const overwrite = flag === '--overwrite';

const locale = JSON.parse(readFileSync(localePath, 'utf8'));
const additions = JSON.parse(readFileSync(source, 'utf8'));
let added = 0;

function merge(target, extra) {
  for (const [key, value] of Object.entries(extra)) {
    const isBranch = value && typeof value === 'object' && !('one' in value && 'other' in value);
    if (isBranch) {
      if (typeof target[key] !== 'object' || target[key] === null) target[key] = {};
      merge(target[key], value);
    } else if (!(key in target) || overwrite) {
      target[key] = value;
      added += 1;
    }
  }
}

merge(locale, additions);
writeFileSync(localePath, JSON.stringify(locale, null, 2) + '\n');
console.log(`Added ${added} strings.`);
