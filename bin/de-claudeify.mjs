#!/usr/bin/env node
// One entry point: `de-claudeify scan|install|hook|explain|list`. Works with `npx github:<owner>/de-claudeify <command>`.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [cmd, ...rest] = process.argv.slice(2);
const run = (script, args) => process.exit(spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), ...args], { stdio: 'inherit' }).status ?? 1);

const HELP = `de-claudeify: remove the habits that make a design look AI-made

  de-claudeify scan <path> [--strict] [--json] [--font Arial|none]
  de-claudeify list                     every rule id
  de-claudeify explain <id>             why a rule exists, with a before and after
  de-claudeify install [--dry-run]      install the skill for Claude Code, Codex, Cursor, OpenCode
  de-claudeify hook [--global]          add the write-time check to Claude Code
  de-claudeify version`;

switch (cmd) {
  case 'scan': run('scan.mjs', rest); break;
  case 'list': run('scan.mjs', ['--list']); break;
  case 'explain': run('scan.mjs', ['--explain', rest[0] || '']); break;
  case 'install': run('install.mjs', rest); break;
  case 'hook': run('install-hook.mjs', rest); break;
  case 'version': console.log(JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version); break;
  case undefined: case '-h': case '--help': case 'help': console.log(HELP); break;
  default: console.error(`Unknown command "${cmd}".\n\n${HELP}`); process.exit(2);
}
