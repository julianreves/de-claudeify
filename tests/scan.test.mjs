import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanSource } from '../scripts/core.mjs';
import { RULES } from '../scripts/rules.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ids = (src, file = 'x.html', config = {}) => scanSource(src, { file, config }).map((f) => f.id);
const css = (body) => `<style>\n${body}\n</style>`;

// each rule: a snippet that must trigger it
const POSITIVE = {
  'tracked-caps': css('.l { text-transform: uppercase; letter-spacing: .12em; }'),
  'eyebrow': '<p class="eyebrow">Our approach</p><h2>We keep your books clean</h2>',
  'dotted-meta': '<p>Strategy · Q4 · 2026</p>',
  'heading-italic': '<h1>Finance that feels <em>effortless</em></h1>',
  'heading-case': '<h2>Why Choose Fernwood For Your Business</h2>',
  'topic-heading': '<h2>Features</h2>',
  'default-font': css('body { font-family: "Inter", sans-serif; }'),
  'font-off-brand': css('body { font-family: "Playfair Display", serif; }'),
  'emoji': '<h3>\u{1F680} Fast setup</h3>',
  'gradient': css('.hero { background: linear-gradient(135deg, #111, #333); }'),
  'gradient-text': css('h1 { background-clip: text; }'),
  'palette-cream': css('body { background: #faf9f6; }'),
  'palette-clay': css('a { color: #d97757; }'),
  'palette-indigo': css('.btn { background: #6366f1; }'),
  'shadow': css('.card { box-shadow: 0 10px 30px rgba(0,0,0,.08); }'),
  'glass': css('.nav { backdrop-filter: blur(12px); }'),
  'card-box': css('.feature { border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; }'),
  'card-fill': css('.stat-card { background: #f5f5f5; border-radius: 12px; padding: 24px; }'),
  'radius': css('.panel { border-radius: 24px; }'),
  'badge': '<span class="badge">New</span>',
  'icon-tile': '<div class="icon-box"><svg></svg></div>',
  'callout-box': '<div class="callout">Note</div>',
  'status-dot': '<span class="dot pulse"></span> Now live',
  'rule-line': css('h2 { border-bottom: 1px solid #eee; }'),
  'section-rule': '<hr>',
  'row-rules': css('td { border-bottom: 1px solid #eee; }'),
  'accent-bar': css('.note { border-left: 4px solid #333; }'),
  'transition-all': css('.btn { transition: all .3s ease; }'),
  'hover-lift': css('.card:hover { transform: translateY(-4px); }'),
  'ambient-motion': css('@keyframes fadeUp { from { opacity: 0; } }'),
  'em-dash': '<p>Fast — and reliable.</p>',
  'arrow-link': '<a href="/p">See pricing →</a>',
  'ai-phrase': '<p>Unlock seamless financial workflows.</p>',
  'clipped-headline': '<h2>Three wines, all from the same forty-one rows.</h2>',
  'contrast-formula': '<p>It’s not accounting, it’s peace of mind.</p>',
  'invented-proof': '<p>Trusted by 10,000+ teams</p>',
};

for (const id of Object.keys(RULES)) {
  test(`rule ${id} fires on its example`, () => {
    assert.ok(POSITIVE[id], `no positive example for ${id}`);
    const config = id === 'default-font' ? { font: null } : {};
    assert.ok(ids(POSITIVE[id], 'x.html', config).includes(id), `${id} did not fire. Got: ${ids(POSITIVE[id], 'x.html', config).join(', ')}`);
  });
}

test('font-off-brand needs a configured font, default-font needs none', () => {
  assert.ok(!ids(POSITIVE['default-font'], 'x.html', { font: 'Arial' }).includes('default-font'));
  assert.ok(ids(POSITIVE['default-font'], 'x.html', { font: null }).includes('default-font'));
  assert.ok(!ids(POSITIVE['font-off-brand'], 'x.html', { font: null }).includes('font-off-brand'));
});

test('clipped headlines are caught, full sentences are not', () => {
  assert.ok(ids('<h1>128 orders this week. Two are late.</h1>').includes('clipped-headline'));
  assert.ok(ids('<h1>One hillside, picked by hand.</h1>').includes('clipped-headline'));
  assert.ok(ids('<p>Fast. Simple. Done.</p>').includes('clipped-headline'));
  assert.deepEqual(ids('<h2>Our three wines come from the same forty-one rows.</h2>'), []);
  assert.deepEqual(ids('<h1>We shipped 128 orders this week, and two of them are late.</h1>'), []);
  assert.deepEqual(ids('<p>Send us the receipts on Friday and you get the report on Monday.</p>'), []);
});

test('a clean page raises nothing', () => {
  const page = `<!doctype html><html lang="en"><head><style>
:root { --bg:#fff; --ink:#111318; --muted:#6a7078; }
body { margin:0; font-family: Arial, Helvetica, sans-serif; background: var(--bg); color: var(--ink); }
h1 { font-size: 56px; letter-spacing: -.03em; }
.grid { display:grid; grid-template-columns: repeat(2, 1fr); gap: 80px; }
.total { border-top: 1px solid var(--ink); }
input:focus-visible { box-shadow: 0 0 0 2px #1e3a6e; }
.hero { background: linear-gradient(transparent, #000), url(photo.jpg); }
a { transition: color .15s; }
code { font-family: "SF Mono", Menlo, monospace; }
</style></head><body>
<h1>We close your books by the fifth</h1>
<p>Send us the receipts on Friday. You get the report on Monday.</p>
<a href="/contact">Book a call</a>
</body></html>`;
  assert.deepEqual(ids(page), []);
});

test('gradient over a photo is allowed, a border on a button is allowed', () => {
  assert.deepEqual(ids(css('.hero { background: linear-gradient(transparent, #000), url(a.jpg); }')), []);
  assert.deepEqual(ids(css('button { border: 1px solid #111; border-radius: 8px; }')), []);
});

test('focus rings are not shadows', () => {
  assert.deepEqual(ids(css('a:focus-visible { box-shadow: 0 0 0 3px #1e3a6e; }')), []);
});

test('semicolons inside url() do not break the parser', () => {
  const src = css('.a { background: url("data:image/svg+xml;base64,AAAA"); }\n.b { box-shadow: 0 4px 12px #0003; }');
  assert.deepEqual(ids(src), ['shadow']);
});

test('line numbers point at the declaration', () => {
  const f = scanSource('<p>one</p>\n<style>\n.a {\n  color: red;\n  box-shadow: 0 2px 8px #0002;\n}\n</style>', { file: 'x.html' });
  assert.equal(f[0].line, 5);
});

test('waivers work on the line above and for the whole file', () => {
  assert.deepEqual(ids(css('/* de-claudeify-allow: shadow -- real device */\n.d { box-shadow: 0 2px 8px #0002; }')), []);
  assert.deepEqual(ids('<!-- de-claudeify-allow-file: em-dash -->\n<p>Fast — and reliable.</p>'), []);
});

test('config can disable a rule', () => {
  assert.deepEqual(ids('<p>Fast — and reliable.</p>', 'x.html', { disable: ['em-dash'] }), []);
});

test('Tailwind utilities are caught', () => {
  const found = ids('<div class="rounded-xl border p-6 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:-translate-y-1 transition-all"></div>');
  for (const id of ['card-box', 'shadow', 'gradient', 'hover-lift', 'transition-all']) assert.ok(found.includes(id), id);
});

test('JSX className and style objects are read', () => {
  const found = ids('export const A = () => <div className={cn("shadow-md", x)} style={{ boxShadow: "0 4px 12px #0002" }}>Hi</div>;', 'a.tsx');
  assert.ok(found.includes('shadow'));
});

test('entities are decoded before text checks', () => {
  assert.ok(ids('<p>Strategy &middot; Q4 &middot; 2026</p>').includes('dotted-meta'));
  assert.ok(ids('<p>Fast &mdash; and reliable</p>').includes('em-dash'));
});

test('script and code content is ignored by text checks', () => {
  assert.deepEqual(ids('<script>const s = "a — b";</script><code>a · b · c</code>'), []);
});

test('CLI exit codes: 1 on FAIL, 0 when clean, 2 on bad input', () => {
  const scan = path.join(ROOT, 'scripts', 'scan.mjs');
  const bad = spawnSync(process.execPath, [scan, path.join(ROOT, 'demos/landing/before.html')]);
  assert.equal(bad.status, 1);
  const good = spawnSync(process.execPath, [scan, path.join(ROOT, 'demos/landing/after.html'), '--strict']);
  assert.equal(good.status, 0, good.stdout.toString());
  assert.equal(spawnSync(process.execPath, [scan, '/nonexistent/file.html']).status, 2);
  assert.equal(spawnSync(process.execPath, [scan, '--nope']).status, 2);
});

test('every demo: before fails, after is clean', () => {
  const scan = path.join(ROOT, 'scripts', 'scan.mjs');
  for (const demo of ['landing', 'dashboard', 'slide']) {
    const before = JSON.parse(spawnSync(process.execPath, [scan, path.join(ROOT, 'demos', demo, 'before.html'), '--json']).stdout.toString());
    assert.ok(before.summary.fail >= 8, `${demo} before should show at least 8 FAILs, got ${before.summary.fail}`);
    const after = JSON.parse(spawnSync(process.execPath, [scan, path.join(ROOT, 'demos', demo, 'after.html'), '--json']).stdout.toString());
    assert.equal(after.summary.fail + after.summary.warn, 0, `${demo} after should be clean: ${JSON.stringify(after.files[0].findings)}`);
  }
});

test('the showcase page is clean and its data matches the scanner', () => {
  const scan = path.join(ROOT, 'scripts', 'scan.mjs');
  const page = spawnSync(process.execPath, [scan, path.join(ROOT, 'demos/index.html'), '--strict']);
  assert.equal(page.status, 0, page.stdout.toString());
  const win = {};
  new Function('window', fs.readFileSync(path.join(ROOT, 'demos/data.js'), 'utf8'))(win);
  for (const [name, d] of Object.entries(win.DC_DEMOS)) {
    const got = JSON.parse(spawnSync(process.execPath, [scan, path.join(ROOT, 'demos', name, 'before.html'), '--json']).stdout.toString()).summary;
    assert.equal(d.fail, got.fail, `${name}: data.js is stale, run node demos/render.mjs`);
    assert.equal(d.warn, got.warn, `${name}: data.js is stale, run node demos/render.mjs`);
    assert.ok(d.markers.length >= 7);
  }
});

test('tells.md is in sync with rules.mjs', () => {
  const out = execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'gen-tells.mjs'), '--check']).toString();
  assert.match(out, /up to date/);
});
