#!/usr/bin/env node
// Adds (or removes) the De-Claudeify PostToolUse hook in Claude Code's settings.json.
import { readFileSync, writeFileSync, existsSync, renameSync, realpathSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { homedir } from 'node:os';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOOK_CMD = `node "${path.join(HERE, 'lint-hook.mjs')}" # de-claudeify`;
const args = process.argv.slice(2);
const has = (f) => args.includes(f);

if (has('--help') || has('-h')) {
  console.log(`node scripts/install-hook.mjs [--global] [--remove] [--print]

  Adds a hook that scans every .html, .css, .jsx, .tsx, .vue, .svelte or .astro file the agent writes,
  and gives any FAIL back to the agent to fix.
  --global   edit ~/.claude/settings.json (default: ./.claude/settings.json in this project)
  --remove   take the hook out again
  --print    show the JSON and change nothing`);
  process.exit(0);
}

const settingsPath = has('--global') ? path.join(homedir(), '.claude', 'settings.json') : path.join(process.cwd(), '.claude', 'settings.json');
const entry = { matcher: 'Write|Edit|MultiEdit', hooks: [{ type: 'command', command: HOOK_CMD, timeout: 10 }] };

if (has('--print')) {
  console.log(`# add to ${settingsPath}:`);
  console.log(JSON.stringify({ hooks: { PostToolUse: [entry] } }, null, 2));
  process.exit(0);
}

const ours = (h) => typeof h?.command === 'string' && h.command.includes('lint-hook.mjs') && h.command.includes('de-claudeify');
const without = (list) => list.flatMap((e) => {
  if (!Array.isArray(e?.hooks) || !e.hooks.some(ours)) return [e];
  const rest = e.hooks.filter((h) => !ours(h));
  return rest.length ? [{ ...e, hooks: rest }] : [];
});

if (has('--remove') && !existsSync(settingsPath)) { console.log(`No ${settingsPath}. Nothing to remove.`); process.exit(0); }

let settings = {};
if (existsSync(settingsPath)) {
  try { settings = JSON.parse(readFileSync(settingsPath, 'utf8')); } catch { console.error(`Refusing to overwrite ${settingsPath}: it is not valid JSON. Fix or delete it first.`); process.exit(1); }
}
if (!settings || typeof settings !== 'object' || Array.isArray(settings)) { console.error(`Refusing to rewrite ${settingsPath}: it is not a JSON object.`); process.exit(1); }
settings.hooks ??= {};
settings.hooks.PostToolUse ??= [];
if (!Array.isArray(settings.hooks.PostToolUse)) { console.error(`Refusing to rewrite ${settingsPath}: hooks.PostToolUse is not a list.`); process.exit(1); }

settings.hooks.PostToolUse = without(settings.hooks.PostToolUse);
if (!has('--remove')) settings.hooks.PostToolUse.push(entry);
if (!settings.hooks.PostToolUse.length) delete settings.hooks.PostToolUse;
if (!Object.keys(settings.hooks).length) delete settings.hooks;

// Write beside the file and rename over it so a crash never leaves settings.json half written.
const dest = existsSync(settingsPath) ? realpathSync(settingsPath) : settingsPath;
mkdirSync(path.dirname(dest), { recursive: true });
const tmp = `${dest}.de-claudeify-tmp`;
writeFileSync(tmp, JSON.stringify(settings, null, 2) + '\n');
renameSync(tmp, dest);
console.log(has('--remove') ? `Removed the hook from ${settingsPath}` : `Hook added to ${settingsPath}`);
