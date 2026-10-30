#!/usr/bin/env node
// Moves English schema strings into locales/en.default.schema.json and replaces
// them with "t:" keys. Keys are derived from the English text, so identical
// labels share one translation. Safe to run repeatedly: values that already
// start with "t:" are left alone.
//
// Usage: node tools/localize-schema.mjs

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const localePath = join(root, 'locales', 'en.default.schema.json');
const locale = existsSync(localePath) ? JSON.parse(readFileSync(localePath, 'utf8')) : {};

const MAX_SLUG = 48;

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function hash(text) {
  return createHash('sha1').update(text).digest('hex').slice(0, 6);
}

function keyFor(namespace, text) {
  let slug = slugify(text) || 'text';
  if (/^[0-9]/.test(slug)) slug = `n_${slug}`;
  if (slug.length > MAX_SLUG) slug = `${slug.slice(0, MAX_SLUG).replace(/_+$/, '')}_${hash(text)}`;
  locale[namespace] ??= {};
  const existing = locale[namespace][slug];
  if (existing !== undefined && existing !== text) slug = `${slug}_${hash(text)}`;
  locale[namespace][slug] = text;
  return `t:${namespace}.${slug}`;
}

function tr(obj, prop, namespace) {
  const value = obj?.[prop];
  if (typeof value !== 'string' || value === '' || value.startsWith('t:')) return;
  obj[prop] = keyFor(namespace, value);
}

function walkSetting(setting) {
  tr(setting, 'label', 'labels');
  tr(setting, 'info', 'info');
  tr(setting, 'placeholder', 'placeholders');
  if (setting.type === 'header' || setting.type === 'paragraph') tr(setting, 'content', 'content');
  for (const option of setting.options ?? []) {
    tr(option, 'label', 'options');
    tr(option, 'group', 'options');
  }
  // color_scheme_group definitions hold their own settings
  for (const inner of setting.definition ?? []) walkSetting(inner);
}

function walkSchema(schema) {
  tr(schema, 'name', 'names');
  for (const setting of schema.settings ?? []) walkSetting(setting);
  for (const block of schema.blocks ?? []) {
    tr(block, 'name', 'names');
    for (const setting of block.settings ?? []) walkSetting(setting);
  }
  for (const preset of schema.presets ?? []) {
    tr(preset, 'name', 'names');
    tr(preset, 'category', 'categories');
  }
}

// Rewrites are queued and only written after the locale file is saved, so a
// failure never leaves "t:" keys on disk without their English text.
const pending = [];

// config/settings_schema.json
const settingsPath = join(root, 'config', 'settings_schema.json');
if (existsSync(settingsPath)) {
  const source = readFileSync(settingsPath, 'utf8');
  const groups = JSON.parse(source);
  for (const group of groups) {
    if (group.name === 'theme_info') continue;
    tr(group, 'name', 'names');
    for (const setting of group.settings ?? []) walkSetting(setting);
  }
  const out = JSON.stringify(groups, null, 2) + '\n';
  if (out !== source) pending.push([settingsPath, out]);
}

// {% schema %} in sections/ and blocks/
const schemaRe = /({%-?\s*schema\s*-?%})([\s\S]*?)({%-?\s*endschema\s*-?%})/;
for (const dir of ['sections', 'blocks']) {
  const full = join(root, dir);
  if (!existsSync(full)) continue;
  for (const file of readdirSync(full)) {
    const path = join(full, file);
    if (file.endsWith('.json')) {
      // section groups: only the group name is translatable
      const group = JSON.parse(readFileSync(path, 'utf8'));
      if (group.name) {
        const before = group.name;
        tr(group, 'name', 'names');
        if (group.name !== before) pending.push([path, JSON.stringify(group, null, 2) + '\n']);
      }
      continue;
    }
    if (!file.endsWith('.liquid')) continue;
    const source = readFileSync(path, 'utf8');
    const match = source.match(schemaRe);
    if (!match) continue;
    let schema;
    try {
      schema = JSON.parse(match[2]);
    } catch (error) {
      console.error(`Invalid schema JSON in ${dir}/${file}: ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    walkSchema(schema);
    const body = '\n' + JSON.stringify(schema, null, 2) + '\n';
    const next = source.replace(schemaRe, (match, open, _old, close) => `${open}${body}${close}`);
    if (next !== source) pending.push([path, next]);
  }
}

function sortDeep(value) {
  if (Array.isArray(value) || typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]));
}

if (process.exitCode) {
  console.error('Schema errors found; nothing was written.');
  process.exit();
}
mkdirSync(dirname(localePath), { recursive: true });
writeFileSync(localePath, JSON.stringify(sortDeep(locale), null, 2) + '\n');
for (const [path, text] of pending) writeFileSync(path, text);
console.log(`Localized schema strings. Files updated: ${pending.length}.`);
