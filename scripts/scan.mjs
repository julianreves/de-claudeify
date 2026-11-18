#!/usr/bin/env node
// De-Claudeify scanner CLI. Finds the visual and copy habits that mark a design as AI-made.
import fs from 'node:fs';
import path from 'node:path';
import { scanSource, loadConfig, collectFiles } from './core.mjs';
import { ALL, GROUPS } from './rules.mjs';

const USAGE = `usage: de-claudeify scan <file-or-folder ...> [options]

  --json          machine-readable output
  --strict        exit 1 on WARN as well as FAIL
  --font <name>   main font to enforce (default Arial). "none" only warns about common generated-page fonts
  --disable <ids> comma-separated rule ids to switch off
  --list          list every rule id
  --explain <id>  show why a rule exists, how to fix it, and an example

Reads .html, .css, .jsx, .tsx, .vue, .svelte and .astro. Skips node_modules, build folders and dot folders.
Config: a .de-claudeify.json file in the project (font, fontAllow, disable).
Waive a finding on purpose: /* de-claudeify-allow: shadow -- reason */ on the line or the line above.
Exit code: 0 clean, 1 FAIL found, 2 usage error.`;

const args = process.argv.slice(2);
const opts = { json: false, strict: false, paths: [], override: {}, list: false, explain: null };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--json') opts.json = true;
  else if (a === '--strict') opts.strict = true;
  else if (a === '--list') opts.list = true;
  else if (a === '--explain') opts.explain = args[++i];
  else if (a === '--font') { const v = args[++i]; opts.override.font = !v || v.toLowerCase() === 'none' ? null : v; }
  else if (a === '--disable') opts.override.disable = (args[++i] || '').split(',').filter(Boolean);
  else if (a === '-h' || a === '--help') { console.log(USAGE); process.exit(0); }
  else if (a.startsWith('--')) { console.error(`unknown option ${a}\n\n${USAGE}`); process.exit(2); }
  else opts.paths.push(a);
}

if (opts.list) {
  for (const g of GROUPS) {
    console.log(`\n${g}`);
    for (const [id, r] of Object.entries(ALL)) if (r.group === g) console.log(`  ${r.grade.padEnd(5)} ${id.padEnd(18)} ${r.title}`);
  }
  process.exit(0);
}
if (opts.explain) {
  const r = ALL[opts.explain];
  if (!r) { console.error(`no rule "${opts.explain}". Run with --list.`); process.exit(2); }
  console.log(`${opts.explain} (${r.grade}, ${r.group})\n${r.title}\n\nWhy: ${r.why}\nFix: ${r.fix}`);
  if (r.bad) console.log(`\nBefore:\n${r.bad.replace(/^/gm, '  ')}\n\nAfter:\n${r.good.replace(/^/gm, '  ')}`);
  process.exit(0);
}
if (!opts.paths.length) { console.error(USAGE); process.exit(2); }

let files;
try { files = collectFiles(opts.paths); } catch (e) { console.error(e.message); process.exit(2); }
if (!files.length) { console.error('no .html, .css or component files found'); process.exit(2); }

const results = [];
for (const file of files) {
  let config;
  try { config = loadConfig(file, opts.override); } catch (e) { console.error(e.message); process.exit(2); }
  const findings = scanSource(fs.readFileSync(file, 'utf8'), { file, config });
  results.push({ file, findings });
}
const all = results.flatMap((r) => r.findings);
const fails = all.filter((f) => f.grade === 'FAIL').length;
const warns = all.filter((f) => f.grade === 'WARN').length;

if (opts.json) {
  console.log(JSON.stringify({ files: results.map((r) => ({ file: r.file, findings: r.findings })), summary: { fail: fails, warn: warns, files: files.length } }, null, 2));
} else {
  const tty = process.stdout.isTTY;
  const c = (code, s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : s);
  for (const { file, findings } of results) {
    if (!findings.length) continue;
    console.log(`\n${path.relative(process.cwd(), file) || file}`);
    for (const f of findings) {
      const g = f.grade === 'FAIL' ? c(31, 'FAIL') : c(33, 'WARN');
      console.log(`  ${g}  ${f.id.padEnd(16)} line ${String(f.line).padEnd(4)} ${f.evidence}`);
      console.log(`        ${c(2, 'fix: ' + f.fix)}`);
    }
  }
  const noun = files.length === 1 ? 'file' : 'files';
  console.log(`\n${fails} FAIL, ${warns} WARN in ${files.length} ${noun}${fails + warns === 0 ? '. Nothing gives it away.' : ''}`);
}
process.exit(fails > 0 || (opts.strict && warns > 0) ? 1 : 0);
