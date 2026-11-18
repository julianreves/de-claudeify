#!/usr/bin/env node
// Generates references/tells.md from scripts/rules.mjs. `--check` fails if the file is stale (used in CI).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RULES, JUDGED, GROUPS } from './rules.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'references', 'tells.md');

const fence = (code, lang) => '```' + lang + '\n' + code + '\n```';
const langOf = (code) => (code.trimStart().startsWith('<') ? 'html' : 'css');

let md = `# The tells

Every habit De-Claudeify looks for, grouped by what it touches. This file is generated from \`scripts/rules.mjs\`. Do not edit it by hand: change the rule and run \`node scripts/gen-tells.mjs\`.

Grades: **FAIL** is a hard tell the scanner blocks on. **WARN** is a judgment call the scanner reports. **JUDGE** is a tell no scanner can see, so the skill checks it by eye.

Waive a finding on purpose with \`/* de-claudeify-allow: <id> -- reason */\` on the line or the line above. Use \`de-claudeify-allow-file: <id>\` to waive it for a whole file.
`;

for (const group of GROUPS) {
  const entries = Object.entries({ ...RULES, ...JUDGED }).filter(([, r]) => r.group === group);
  if (!entries.length) continue;
  md += `\n## ${group}\n`;
  for (const [id, r] of entries) {
    md += `\n### \`${id}\` (${r.grade})\n\n**${r.title}.** ${r.why}\n\n**Fix.** ${r.fix}\n`;
    if (r.bad) md += `\n${fence(r.bad, langOf(r.bad))}\n\n${fence(r.good, langOf(r.good))}\n`;
  }
}

if (process.argv.includes('--check')) {
  const current = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (current !== md) { console.error('references/tells.md is out of date. Run: node scripts/gen-tells.mjs'); process.exit(1); }
  console.log('references/tells.md is up to date');
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, md);
  console.log(`wrote ${path.relative(process.cwd(), OUT)} (${Object.keys(RULES).length} scanned rules, ${Object.keys(JUDGED).length} judged)`);
}
