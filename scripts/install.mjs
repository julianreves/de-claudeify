#!/usr/bin/env node
// Installs the De-Claudeify skill for every agent harness it finds. Zero dependencies, Node 18+.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const HOME = homedir();
const NAME = 'de-claudeify';
const PAYLOAD = ['SKILL.md', 'LICENSE', 'references', 'scripts', 'agents'];

const TARGETS = {
  claude: { label: 'Claude Code', dir: path.join(HOME, '.claude', 'skills', NAME), detect: () => fs.existsSync(path.join(HOME, '.claude')) },
  codex: { label: 'Codex CLI and Cursor', dir: path.join(HOME, '.agents', 'skills', NAME), detect: () => ['.codex', '.agents', '.cursor'].some((d) => fs.existsSync(path.join(HOME, d))) },
  opencode: { label: 'OpenCode', dir: path.join(HOME, '.config', 'opencode', 'skills', NAME), detect: () => fs.existsSync(path.join(HOME, '.config', 'opencode')) || fs.existsSync(path.join(HOME, '.opencode')) },
};

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const FLAGS = ['--claude', '--codex', '--cursor', '--opencode', '--dry-run', '--force', '--remove', '--help', '-h'];
const unknown = args.filter((a) => !FLAGS.includes(a));
if (has('--help') || has('-h') || unknown.length) {
  if (unknown.length) console.log(`Unknown option: ${unknown.join(' ')}\n`);
  console.log(`node scripts/install.mjs [--claude] [--codex] [--cursor] [--opencode] [--dry-run] [--force] [--remove]

  Installs De-Claudeify for every agent it finds (or only the ones named), after checking the skill.
  --dry-run  print what would be copied and change nothing
  --force    install even if the checks find a problem
  --remove   delete every installed copy`);
  process.exit(unknown.length ? 2 : 0);
}
const DRY = has('--dry-run');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (['.DS_Store', 'node_modules', '.git'].includes(e.name) || e.isSymbolicLink()) continue;
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

function check() {
  const problems = [];
  const skill = fs.readFileSync(path.join(ROOT, 'SKILL.md'), 'utf8');
  if (!/^---\nname: de-claudeify\n/.test(skill)) problems.push('SKILL.md frontmatter is missing or has the wrong name');
  for (const m of skill.matchAll(/`(references\/[\w.-]+\.md)`/g)) if (!fs.existsSync(path.join(ROOT, m[1]))) problems.push(`SKILL.md points at ${m[1]}, which does not exist`);
  const list = spawnSync(process.execPath, [path.join(HERE, 'scan.mjs'), '--list'], { encoding: 'utf8' });
  if (list.status !== 0) problems.push('scripts/scan.mjs does not run: ' + (list.stderr || '').trim());
  const tells = spawnSync(process.execPath, [path.join(HERE, 'gen-tells.mjs'), '--check'], { encoding: 'utf8' });
  if (tells.status !== 0) problems.push('references/tells.md is out of date. Run: node scripts/gen-tells.mjs');
  return problems;
}

function installTo(dir) {
  if (DRY) return console.log(`  would install -> ${dir}`);
  const tmp = dir + '.tmp-install';
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  for (const item of PAYLOAD) {
    const src = path.join(ROOT, item);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(tmp, item);
    if (fs.statSync(src).isDirectory()) copyDir(src, dest); else fs.copyFileSync(src, dest);
  }
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(dir), { recursive: true });
  fs.renameSync(tmp, dir);
  console.log(`  installed -> ${dir}`);
}

const named = ['claude', 'codex', 'cursor', 'opencode'].filter((k) => has('--' + k)).map((k) => (k === 'cursor' ? 'codex' : k));
const keys = Object.keys(TARGETS);

if (has('--remove')) {
  let removed = 0;
  for (const k of named.length ? named : keys) {
    const t = TARGETS[k];
    if (!fs.existsSync(t.dir)) continue;
    if (DRY) console.log(`  would remove ${t.dir}`); else { fs.rmSync(t.dir, { recursive: true, force: true }); console.log(`  removed ${t.dir}`); }
    removed++;
  }
  if (!removed) console.log('Nothing installed.');
  process.exit(0);
}

const chosen = named.length ? [...new Set(named)] : keys.filter((k) => TARGETS[k].detect());
if (!chosen.length) {
  console.log('No supported agent found (looked for Claude Code, Codex, Cursor, OpenCode).');
  console.log('Name one to install anyway: --claude, --codex, --cursor or --opencode.');
  process.exit(1);
}

const problems = check();
if (problems.length) {
  console.error('Checks failed:\n' + problems.map((p) => '  - ' + p).join('\n'));
  if (!has('--force')) { console.error('\nNothing installed. Use --force to install anyway.'); process.exit(1); }
}

console.log(DRY ? 'Dry run, nothing changes:' : 'Installing De-Claudeify:');
for (const k of chosen) { console.log(`${TARGETS[k].label}`); installTo(TARGETS[k].dir); }
console.log(`\nTry it: ask your agent to "/de-claudeify scan <path>" or "build a landing page with de-claudeify".`);
console.log(`Optional: node ${path.join(TARGETS[chosen[0]].dir, 'scripts', 'install-hook.mjs')} --global   (checks every web file the agent writes)`);
