#!/usr/bin/env node
// Renders the bottle product shots in demos/landing/img with Three.js inside headless Chrome.
// Needs Chrome and a network connection (it loads Three.js from a CDN). The PNGs are committed, so you only run this to change them.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, '..', 'landing', 'img');
const CHROME = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find((p) => fs.existsSync(p));
if (!CHROME) { console.error('Chrome not found. Set CHROME=/path/to/chrome.'); process.exit(1); }
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'dc-img-'));
const r = spawnSync(CHROME, ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', `--user-data-dir=${profile}`, '--window-size=1000,1500', '--virtual-time-budget=60000', '--dump-dom', pathToFileURL(path.join(HERE, 'bottles.html')).href], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 240000 });
fs.rmSync(profile, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let n = 0;
for (const m of r.stdout.matchAll(/<pre id="img-(\w+)">data:image\/png;base64,([^<]+)<\/pre>/g)) {
  fs.writeFileSync(path.join(OUT, `${m[1]}.png`), Buffer.from(m[2], 'base64')); n++;
  console.log(`img/${m[1]}.png`);
}
if (!n) { console.error('No images rendered.\n' + r.stderr.slice(0, 600)); process.exit(1); }
