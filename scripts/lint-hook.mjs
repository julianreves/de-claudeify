#!/usr/bin/env node
// Claude Code PostToolUse hook: after the agent writes a web file, scan it and hand any FAIL back as context.
// Reads the hook payload on stdin. Never blocks: on any problem it exits 0 with no output.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { scanSource, loadConfig } from './core.mjs';

const OK = (obj = {}) => { process.stdout.write(JSON.stringify(obj)); process.exit(0); };

try {
  const payload = JSON.parse(readFileSync(0, 'utf8'));
  const file = payload?.tool_input?.file_path;
  if (typeof file !== 'string' || !/\.(html?|css|jsx|tsx|vue|svelte|astro)$/i.test(file)) OK();
  const config = loadConfig(file);
  if (config.hook === false) OK();
  const fails = scanSource(readFileSync(file, 'utf8'), { file, config }).filter((f) => f.grade === 'FAIL');
  if (!fails.length) OK();
  const lines = fails.slice(0, 10).map((f) => `- ${f.id} (line ${f.line}): ${f.evidence}. ${f.fix}`);
  const more = fails.length > 10 ? `\n(+${fails.length - 10} more)` : '';
  OK({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: `De-Claudeify found ${fails.length} FAIL in ${path.basename(file)}:\n${lines.join('\n')}${more}\nFix these now. Waive one only when the tell is the point, with a reason.`,
    },
  });
} catch { OK(); }
