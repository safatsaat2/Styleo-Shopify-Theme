// Accessibility and performance checks that Theme Check doesn't cover.
// Usage: node tools/audit.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dirs = ['layout', 'sections', 'snippets', 'blocks', 'templates'];

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (name.endsWith('.liquid')) yield path;
  }
}

// Each check matches whole tags (they may span lines).
const checks = [
  ['Button without a type', /<button\b(?![^>]*\btype=)[^>]*>/g],
  ['Script without defer or async', /<script\s+src=(?![^>]*\b(?:defer|async)\b)[^>]*>/g],
  ['New-tab link without rel', /<a\b(?=[^>]*target="_blank")(?![^>]*\brel=)[^>]*>/g],
  ['img without width and height', /<img\b(?![^>]*\bwidth=)[^>]*>/g],
  ['image_tag without sizes', /image_tag(?![^}]*sizes)[^}]*}}/g],
  ['Positive tabindex', /tabindex="[1-9]/g],
  ['iframe without title', /<iframe\b(?![^>]*\btitle=)[^>]*>/g],
  ['Icon-only button without a label', /<button\b(?![^>]*aria-label)[^>]*>\s*{%\s*render 'icon'[^%]*%}\s*<\/button>/g],
];

let total = 0;
for (const dir of dirs) {
  for (const path of files(join(root, dir))) {
    const source = readFileSync(path, 'utf8').replace(/{%-?\s*schema\s*-?%}[\s\S]*$/, '');
    for (const [label, pattern] of checks) {
      for (const match of source.matchAll(pattern)) {
        const line = source.slice(0, match.index).split('\n').length;
        console.log(`${relative(root, path)}:${line}  ${label}`);
        total += 1;
      }
    }
  }
}

// Motion: base.css stops every animation and transition under prefers-reduced-motion,
// so CSS files need no per-file check here.

console.log(total ? `\n${total} findings` : 'No findings.');
