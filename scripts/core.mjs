// De-Claudeify scanner core. Zero dependencies, Node 18+.
// scanSource(source, { file, config }) returns a list of findings: { id, grade, line, evidence, fix }.
import fs from 'node:fs';
import path from 'node:path';
import { RULES } from './rules.mjs';

export const DEFAULT_CONFIG = {
  font: 'Arial',      // the main font. Set to null to only warn about the fonts generated pages reach for.
  fontAllow: [],      // extra families allowed as the first family
  disable: [],        // rule ids to switch off for the whole project
};

const DEFAULT_FONTS = [
  'inter', 'inter tight', 'space grotesk', 'dm sans', 'dm serif display', 'fraunces', 'playfair display',
  'instrument serif', 'instrument sans', 'poppins', 'manrope', 'plus jakarta sans', 'outfit', 'sora',
  'geist', 'jetbrains mono', 'newsreader', 'bricolage grotesque',
];
const GENERIC = new Set(['sans-serif', 'serif', 'monospace', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace',
  'cursive', 'fantasy', 'inherit', 'initial', 'unset', 'revert', 'math', 'emoji']);
const CODE_FONTS = new Set(['sf mono', 'sfmono-regular', 'menlo', 'consolas', 'courier new', 'courier', 'monaco', 'liberation mono', 'dejavu sans mono']);

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const TEXT_SKIP = new Set(['script', 'style', 'code', 'pre', 'kbd', 'samp', 'svg', 'textarea']);
const CONTROL = /(^|[\s,>+~.#\[:-])(input|button|select|textarea|img|picture|video|code|pre|kbd|btn|button|field|control|toggle|switch|checkbox|radio|avatar|swatch)/i;

const AI_PHRASES = [
  /\bseamless(ly)?\b/i, /\belevate[sd]?\b/i, /\bunlock(s|ing)?\b/i, /\bempower(s|ing|ed)?\b/i, /\bstreamline[sd]?\b/i,
  /\brevolutioni[sz]e[sd]?\b/i, /\bcutting[- ]edge\b/i, /\bgame[- ]chang(er|ing)\b/i, /\bsupercharge[sd]?\b/i,
  /\beffortless(ly)?\b/i, /\bin today['’]s (fast[- ]paced|digital|ever[- ]changing)\b/i, /\bfast[- ]paced\b/i,
  /\btake (it|your \w+) to the next level\b/i, /\bdelve[sd]?\b/i, /\bleverag(e|es|ing)\b/i, /\bholistic\b/i,
  /\bnext[- ]gen(eration)?\b/i, /\bstate[- ]of[- ]the[- ]art\b/i, /\bworld[- ]class\b/i, /\bbest[- ]in[- ]class\b/i,
  /\bready to get started\b/i, /\beverything you need\b/i, /\btapestry\b/i, /\bdigital landscape\b/i,
  /\bone[- ]stop[- ]shop\b/i, /\bmission[- ]critical\b/i, /\bmeticulous(ly)?\b/i, /\bwhether you['’]re\b/i,
  /\brobust\b/i, /\bde vanguardia\b/i, /\bsoluciones integrales\b/i, /\bal siguiente nivel\b/i, /\bsin complicaciones\b/i,
];
const CONTRAST = [
  /\b(it|this|that)(['’]s| is) not\b[^.!?\n]{1,80}[,;.]\s*(it|this|that)(['’]s| is)\b/i,
  /\bnot just\b[^.!?\n]{1,70}\bbut( also)?\b/i,
  /\b(isn['’]t|aren['’]t|wasn['’]t)\b[^.!?\n]{1,60}[,;.]\s*(it['’]s|they['’]re|it is|they are)\b/i,
  /\bno (es|son|solo)\b[^.!?\n]{1,60}[,;.]?\s*(sino|es|son)\b/i,
];
const PROOF = [
  /\b(trusted|loved|used|chosen) by\b/i, /\bjoin (over |more than )?\d[\d,.]*\+?/i, /\bjoin (thousands|millions|hundreds)\b/i,
  /\b\d{1,3}(,\d{3})+\+?\s+(teams|customers|users|companies|businesses|clients)\b/i,
  /\b\d+\+\s+(teams|customers|users|companies|businesses|clients)\b/i, /\b99\.9+%/, /★{3,}/,
];
const TOPIC_HEADINGS = new Set(['features', 'key features', 'benefits', 'how it works', 'why us', 'why choose us', 'our services',
  'services', 'testimonials', 'what we do', 'about us', 'about', 'overview', 'the problem', 'the solution', 'our mission',
  'our values', 'our approach', 'our story', 'get started', 'faq', 'frequently asked questions', 'pricing', 'contact us']);
const SMALL_WORDS = new Set(['a', 'an', 'the', 'of', 'to', 'in', 'for', 'and', 'or', 'on', 'at', 'by', 'with', 'from', 'as', 'is', 'vs', 'but', 'nor']);
const KEYFRAME_TELLS = /^(fade-?(in)?-?(up|down)?|slide-?(in-?)?up|pulse|ping|glow|float|floating|shimmer|bounce|blob|aurora|gradient-?(shift|move)|spin-?slow)$/i;

// ---------- helpers ----------

function lineMap(src) {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') starts.push(i + 1);
  return (pos) => {
    let lo = 0, hi = starts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= pos) lo = mid; else hi = mid - 1; }
    return lo + 1;
  };
}
const short = (s, n = 110) => { const t = String(s).replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };

const ENT = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", middot: '·', bull: '•', mdash: '—',
  ndash: '–', rarr: '→', larr: '←', rsaquo: '›', raquo: '»', hellip: '…', rsquo: '’', lsquo: '‘', copy: '©', reg: '®', trade: '™' };
export function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try { return String.fromCodePoint(code); } catch { return m; }
    }
    return ENT[e.toLowerCase()] ?? m;
  });
}

function toPx(v) {
  const m = String(v).match(/(-?\d*\.?\d+)(px|rem|em)?/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return m[2] === 'rem' || m[2] === 'em' ? n * 16 : n;
}
const isReal = (v) => v != null && !/^(none|0(px|em|rem)?(\s+none)?|initial|unset|inherit|transparent)\s*$/i.test(v.trim());

function splitTop(s, sep) {
  const out = []; let depth = 0, q = null, cur = '';
  for (const c of s) {
    if (q) { cur += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (c === sep && depth === 0) { out.push(cur); cur = ''; } else cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

function parseColors(v) {
  const out = [];
  for (const m of v.matchAll(/#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b|rgba?\(([^)]*)\)/gi)) {
    let r, g, b;
    if (m[1]) {
      let h = m[1]; if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      r = parseInt(h.slice(0, 2), 16); g = parseInt(h.slice(2, 4), 16); b = parseInt(h.slice(4, 6), 16);
    } else {
      const p = m[2].split(/[\s,/]+/).filter(Boolean).slice(0, 3).map(Number);
      if (p.length < 3 || p.some(Number.isNaN)) continue;
      [r, g, b] = p;
    }
    out.push({ text: m[0], hsl: toHsl(r, g, b) });
  }
  return out;
}
function toHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6; else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

// ---------- CSS parsing ----------

function parseCss(raw) {
  const s = raw.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const lineOf = lineMap(s);
  const rules = [], keyframes = [];

  const skipString = (i) => { const q = s[i]; let j = i + 1; while (j < s.length && s[j] !== q) { if (s[j] === '\\') j++; j++; } return j + 1; };
  const matchBrace = (open) => {
    let depth = 0;
    for (let i = open; i < s.length; i++) {
      const c = s[i];
      if (c === '"' || c === "'") { i = skipString(i) - 1; continue; }
      if (c === '{') depth++;
      if (c === '}') { depth--; if (depth === 0) return i; }
    }
    return s.length;
  };
  const nest = (sel, parent) => {
    if (!parent) return sel.trim();
    return splitTop(sel, ',').map((p) => (p.includes('&') ? p.trim().replace(/&/g, parent) : `${parent} ${p.trim()}`)).join(', ');
  };
  const addDecl = (rule, text, at) => {
    const idx = text.indexOf(':');
    if (idx < 1 || !rule) return;
    const prop = text.slice(0, idx).trim().toLowerCase();
    if (!/^-{0,2}[a-z][\w-]*$/.test(prop)) return;
    const value = text.slice(idx + 1).trim().replace(/\s*!important$/i, '');
    if (!value) return;
    const lead = text.length - text.trimStart().length;
    rule.decls.push({ prop, value, line: lineOf(at + lead) });
  };

  function walk(from, to, sel, rule) {
    let i = from, start = from, paren = 0;
    while (i < to) {
      const c = s[i];
      if (c === '"' || c === "'") { i = skipString(i); continue; }
      if (c === '(') paren++;
      else if (c === ')') paren = Math.max(0, paren - 1);
      else if (paren === 0 && c === ';') { addDecl(rule, s.slice(start, i), start); start = i + 1; }
      else if (paren === 0 && c === '{') {
        const end = Math.min(matchBrace(i), to);
        block(s.slice(start, i).trim(), i + 1, end, sel, rule, start);
        i = end + 1; start = i; continue;
      } else if (paren === 0 && c === '}') { start = i + 1; }
      i++;
    }
    if (rule && start < to) addDecl(rule, s.slice(start, to), start);
  }
  function block(prelude, bs, be, parentSel, parentRule, at) {
    const p = prelude.toLowerCase();
    if (/^@(-\w+-)?keyframes/.test(p)) { keyframes.push({ name: prelude.split(/\s+/)[1] || '', line: lineOf(at + (s.slice(at).length - s.slice(at).trimStart().length)) }); return; }
    if (p.startsWith('@font-face') || p.startsWith('@page') || p.startsWith('@property')) return;
    if (p.startsWith('@')) {
      if (!parentSel) walk(bs, be, '', null);
      else walk(bs, be, parentSel, parentRule);
      return;
    }
    const sel = nest(prelude, parentSel);
    const rule = { sel, decls: [], line: lineOf(at + (s.slice(at).length - s.slice(at).trimStart().length)) };
    rules.push(rule);
    walk(bs, be, sel, rule);
  }
  walk(0, s.length, '', null);
  return { rules, keyframes };
}

function parseInlineStyle(text, line) {
  const rule = { sel: '[style]', decls: [], line };
  for (const part of splitTop(text, ';')) {
    const idx = part.indexOf(':');
    if (idx < 1) continue;
    const prop = part.slice(0, idx).trim().toLowerCase();
    const value = part.slice(idx + 1).trim().replace(/\s*!important$/i, '');
    if (/^-{0,2}[a-z][\w-]*$/.test(prop) && value) rule.decls.push({ prop, value, line });
  }
  return rule;
}
function parseJsxStyle(text, line) {
  const rule = { sel: '[style]', decls: [], line };
  for (const m of text.matchAll(/([A-Za-z]+)\s*:\s*['"`]([^'"`]+)['"`]/g)) {
    rule.decls.push({ prop: m[1].replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()), value: m[2], line });
  }
  return rule;
}

// ---------- the scanner ----------

export function scanSource(src, { file = '', config = {} } = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const ext = path.extname(file).toLowerCase();
  const lineOf = lineMap(src);
  const findings = [];
  const seen = new Set();
  const once = new Set();

  // waivers: `de-claudeify-allow: id, id -- reason` (this line or the next) and `de-claudeify-allow-file: id`
  const allowLine = new Map(); const allowFile = new Set();
  for (const m of src.matchAll(/de-claudeify-allow(-file)?:\s*([^\n]*)/gi)) {
    const ids = m[2].split(/\s--|\*\/|-->/)[0].split(/[,\s]+/).filter((x) => /^[a-z-]+$/.test(x));
    if (m[1]) ids.forEach((x) => allowFile.add(x));
    else { const ln = lineOf(m.index); for (const x of ids) { for (const l of [ln, ln + 1]) { if (!allowLine.has(l)) allowLine.set(l, new Set()); allowLine.get(l).add(x); } } }
  }
  if (/de-claudeify-ignore-file/.test(src)) return [];
  const disabled = new Set(cfg.disable);

  const add = (id, line, evidence, onceKey) => {
    if (disabled.has(id) || allowFile.has(id) || allowFile.has('all')) return;
    const al = allowLine.get(line);
    if (al && (al.has(id) || al.has('all'))) return;
    if (onceKey) { const k = id + '|' + onceKey; if (once.has(k)) return; once.add(k); }
    const key = `${id}|${line}|${evidence}`;
    if (seen.has(key)) return; seen.add(key);
    findings.push({ id, grade: RULES[id].grade, line, evidence: short(evidence), fix: RULES[id].fix });
  };

  // --- one rule or element's declarations ---
  const checkRule = (rule, baseLine, ctx = {}) => {
    const L = (d) => baseLine + d.line - 1;
    const get = (p) => { for (let i = rule.decls.length - 1; i >= 0; i--) if (rule.decls[i].prop === p) return rule.decls[i]; return null; };
    const sel = rule.sel;
    const ev = (d) => `${sel} { ${d.prop}: ${d.value} }`;
    const isControl = ctx.tag ? /^(input|button|select|textarea|img|picture|video|code|pre|kbd)$/.test(ctx.tag) : CONTROL.test(sel);
    const hasUrl = rule.decls.some((d) => /url\(/i.test(d.value));
    const focus = /:focus/.test(sel);

    // type
    const tt = get('text-transform'), ls = get('letter-spacing'), fv = get('font-variant') || get('font-variant-caps');
    if (tt && /uppercase/i.test(tt.value) && ls) {
      const n = parseFloat(ls.value);
      const em = /em\s*$/.test(ls.value.trim()) ? n : null, px = /px\s*$/.test(ls.value.trim()) ? n : null;
      if ((em !== null && em >= 0.04) || (px !== null && px >= 0.5)) add('tracked-caps', L(tt), ev(tt) + ` ${ls.prop}: ${ls.value}`);
    }
    if (fv && /small-caps/i.test(fv.value)) add('tracked-caps', L(fv), ev(fv));

    for (const d of rule.decls) {
      const isFamily = d.prop === 'font-family' || (d.prop === 'font' && !/^(inherit|initial|unset|var\()/i.test(d.value));
      if (isFamily) {
        let list = d.value;
        if (d.prop === 'font') { const m = d.value.match(/(?:^|\s)(?:\d*\.?\d+(?:px|rem|em|%|pt)|(?:x-)?(?:small|medium|large))(?:\/[\d.]+(?:px|rem|em|%)?)?\s+(.+)$/); list = m ? m[1] : ''; }
        if (list && !/var\(/i.test(list)) checkFonts(splitTop(list, ',').map((f) => f.trim().replace(/^["']|["']$/g, '')), L(d), ev(d));
      }

      // color
      if (/gradient\(/i.test(d.value) && !hasUrl && !/^(mask|-webkit-mask)/.test(d.prop)) add('gradient', L(d), ev(d));
      if ((d.prop === 'background-clip' || d.prop === '-webkit-background-clip') && /text/i.test(d.value)) add('gradient-text', L(d), ev(d));
      if (/^(--[\w-]+|background(-color)?|color|border(-\w+)?(-color)?|fill|stroke|outline(-color)?)$/.test(d.prop) && !/gradient\(/i.test(d.value)) {
        const bgish = /^background(-color)?$/.test(d.prop) || (d.prop.startsWith('--') && /bg|background|surface|paper|canvas|cream|page/i.test(d.prop));
        for (const c of parseColors(d.value)) {
          const { h, s, l } = c.hsl;
          if (bgish && l >= 0.93 && l < 0.995 && h >= 25 && h <= 55 && s >= 0.2 && s <= 0.8) add('palette-cream', L(d), `${d.prop}: ${c.text}`, c.text.toLowerCase());
          if (h >= 8 && h <= 24 && s >= 0.5 && s <= 0.85 && l >= 0.45 && l <= 0.65) add('palette-clay', L(d), `${d.prop}: ${c.text}`, c.text.toLowerCase());
          if (h >= 235 && h <= 290 && s >= 0.55 && l >= 0.45 && l <= 0.75) add('palette-indigo', L(d), `${d.prop}: ${c.text}`, c.text.toLowerCase());
        }
      }

      // shape
      const shadowProp = d.prop === 'box-shadow' || d.prop === 'text-shadow' || (d.prop.startsWith('--') && /shadow/i.test(d.prop));
      if (shadowProp && isReal(d.value) && !focus && !/^var\(/i.test(d.value)) add('shadow', L(d), ev(d));
      if (d.prop === 'filter' && /drop-shadow\(/i.test(d.value)) add('shadow', L(d), ev(d));
      if ((d.prop === 'backdrop-filter' || d.prop === '-webkit-backdrop-filter') && isReal(d.value)) add('glass', L(d), ev(d));

      // lines
      if (/^(border-left|border-inline-start)$/.test(d.prop) && isReal(d.value) && /solid|double|dashed/i.test(d.value) && toPx(d.value) >= 3) add('accent-bar', L(d), ev(d));
      if (d.prop === 'border-left-width' && toPx(d.value) >= 3) add('accent-bar', L(d), ev(d));

      // motion
      if (d.prop === 'transition' || d.prop === 'transition-property') {
        if (splitTop(d.value, ',').some((t) => /^\s*all\b/i.test(t))) add('transition-all', L(d), ev(d));
      }
      if (d.prop === 'transform' && /:hover/.test(sel) && /(translate(y|3d)?\(\s*-|scale\(\s*1\.(0[2-9]|[1-9]))/i.test(d.value)) add('hover-lift', L(d), ev(d));
      if (d.prop === 'animation' || d.prop === 'animation-name') {
        const first = d.value.split(/[\s,]+/).find((w) => KEYFRAME_TELLS.test(w));
        if (first) add('ambient-motion', L(d), ev(d));
      }
    }

    // borders, radius, fills
    const border = get('border');
    const bw = get('border-width'), bs = get('border-style');
    const fullBorder = (border && isReal(border.value)) || (bw && bs && isReal(bw.value) && isReal(bs.value));
    const radiusDecl = get('border-radius');
    let radius = 0;
    if (radiusDecl && !/%/.test(radiusDecl.value)) radius = Math.max(...(radiusDecl.value.match(/-?\d*\.?\d+(px|rem|em)?/g) || ['0']).map(toPx));
    const bgDecl = get('background') || get('background-color');
    const hasFill = bgDecl && isReal(bgDecl.value) && !/^(#fff(fff)?|white|var\(--(bg|background|surface)\)|transparent)\s*$/i.test(bgDecl.value.trim()) && !/gradient|url\(/i.test(bgDecl.value);
    const flagged = new Set();
    if (fullBorder && radius >= 6 && !isControl) { add('card-box', L(border || bw), `${sel} { border: ${(border || bw).value}; border-radius: ${radiusDecl.value} }`); flagged.add('card'); }
    if (!flagged.size && radius >= 6 && hasFill && !isControl && get('padding') && /card|tile|panel|stat|metric|kpi|feature|box/i.test(sel)) { add('card-fill', L(radiusDecl), `${sel} { background: ${bgDecl.value}; border-radius: ${radiusDecl.value} }`); flagged.add('card'); }
    if (!flagged.size && radius >= 16 && radius < 900 && !isControl) add('radius', L(radiusDecl), ev(radiusDecl));

    // rules
    const side = ['border-bottom', 'border-top', 'border-block-end', 'border-block-start'].map(get).find((d) => d && isReal(d.value) && /solid|dashed|dotted|double|\d/.test(d.value) && toPx(d.value) > 0);
    const lastSel = sel.split(',').pop().trim().split(/[\s>+~]+/).pop();
    if (/^(td|th)\b|[\s>+~](td|th)\b/.test(sel) && fullBorder) add('rule-line', L(border || bw), `table gridline: ${ev(border || bw)}`);
    else if (side && /^(td|th|tr)\b/.test(lastSel)) add('row-rules', L(side), ev(side));
    else if (side && (/^h[1-6]\b/.test(lastSel) || /(title|heading)/i.test(lastSel))) add('rule-line', L(side), ev(side));
    else if (side && (/^(header|footer|nav|section)\b/.test(lastSel) || /(header|footer|navbar|topbar|divider|separator)/i.test(lastSel))) add('section-rule', L(side), ev(side));
    if (/^(hr|\.?(divider|separator|hairline)s?)$/i.test(lastSel) && rule.decls.some((d) => /^(border|border-top|border-bottom|background|height)$/.test(d.prop) && isReal(d.value))) add('section-rule', rule.decls[0].line + baseLine - 1, `${sel} draws a line`);

    // name-based checks for plain .css files (in markup they run on the element)
    if (ctx.names && !ctx.tag) nameChecks(lastSel.replace(/[.#]/g, ' ').trim().split(/[^\w-]+/), L(rule.decls[0] || { line: rule.line }), sel, rule);
  };

  const nameChecks = (names, line, ev, rule) => {
    const styled = !rule || rule.decls.some((d) => /^(background|background-color|border|border-radius|box-shadow|padding)$/.test(d.prop));
    for (const n of names) {
      if (/(^|[-_])(eyebrow|kicker|overline|pretitle|supertitle|superhead)($|[-_])/i.test(n)) add('eyebrow', line, `class "${n}" ${ev}`);
      else if (/(^|[-_])(badge|pill|chip|tag)s?($|[-_])/i.test(n) && styled) add('badge', line, `class "${n}" ${ev}`);
      else if (/icon-?(wrap|box|tile|bg|circle|container|badge)/i.test(n)) add('icon-tile', line, `class "${n}" ${ev}`);
      else if (/(^|[-_])(callout|admonition|alert-?box|note-?box|highlight-?box|info-?box)($|[-_])/i.test(n) && styled) add('callout-box', line, `class "${n}" ${ev}`);
      else if (/(^|[-_])(dot|pulse|ping|live-?dot|status-?dot)($|[-_])/i.test(n)) add('status-dot', line, `class "${n}" ${ev}`);
    }
  };

  function checkFonts(families, line, evidence) {
    const first = (families[0] || '').toLowerCase();
    if (!first) return;
    if (cfg.font) {
      const allowed = new Set([cfg.font.toLowerCase(), ...cfg.fontAllow.map((f) => f.toLowerCase())]);
      if (!allowed.has(first) && !GENERIC.has(first) && !CODE_FONTS.has(first)) add('font-off-brand', line, `${evidence} (main font should be ${cfg.font})`);
    } else {
      const hit = families.find((f) => DEFAULT_FONTS.includes(f.toLowerCase()));
      if (hit) add('default-font', line, `${evidence} (${hit})`);
    }
  }

  const checkCssBlock = (css, baseLine, names) => {
    const { rules, keyframes } = parseCss(css);
    for (const r of rules) checkRule(r, baseLine, { names });
    for (const k of keyframes) if (KEYFRAME_TELLS.test(k.name)) add('ambient-motion', baseLine + k.line - 1, `@keyframes ${k.name}`);
  };

  // --- Tailwind and utility classes ---
  const checkClasses = (classStr, tag, line) => {
    const toks = classStr.split(/\s+/).filter(Boolean);
    const base = toks.map((t) => t.replace(/^(?:[\w-]+:)+/, ''));
    const has = (re) => toks.find((t) => re.test(t));
    const ev = `<${tag} class="${short(classStr, 70)}">`;
    let t;
    if ((t = has(/^(?:[\w-]+:)*shadow(-(sm|md|lg|xl|2xl|inner|\[[^\]]+\]))?$/) ) && !/shadow-none$/.test(t) && !/^(?:[\w-]+:)*focus/.test(t)) add('shadow', line, `${ev} (${t})`);
    if ((t = has(/^(?:[\w-]+:)*(bg-gradient-to-|bg-linear-|bg-radial|bg-conic)/))) add('gradient', line, `${ev} (${t})`);
    if ((t = has(/^(?:[\w-]+:)*backdrop-blur/))) add('glass', line, `${ev} (${t})`);
    if (base.includes('uppercase') && base.some((b) => /^tracking-(wide|wider|widest|\[)/.test(b))) add('tracked-caps', line, ev);
    if ((t = has(/^(?:[\w-]+:)*border-l-(2|4|8|\[[3-9]px\])$/))) add('accent-bar', line, `${ev} (${t})`);
    if ((t = has(/^(?:[\w-]+:)*hover:(-translate-y|scale-(10[5-9]|1[1-9]0))/)) || (t = has(/^hover:-translate-y/))) add('hover-lift', line, `${ev} (${t})`);
    if (base.includes('transition-all')) add('transition-all', line, ev);
    if ((t = has(/^divide-[xy]$/))) add('row-rules', line, `${ev} (${t})`);
    const control = /^(input|button|select|textarea|img)$/.test(tag);
    if (!control && base.some((b) => /^border$|^border-[1-9]$/.test(b)) && base.some((b) => /^rounded-(md|lg|xl|2xl|3xl)$/.test(b))) add('card-box', line, ev);
    if (!control && base.includes('rounded-full') && base.some((b) => /^px-/.test(b)) && base.some((b) => /^text-(xs|sm)$/.test(b)) && base.some((b) => /^(bg-|border)/.test(b))) add('badge', line, ev);
    if (/^(header|footer|nav|h[1-6])$/.test(tag) && base.some((b) => /^border-(b|t)(-\d)?$/.test(b)) && !base.some((b) => /^border-(b|t)-0$/.test(b))) add(/^h[1-6]$/.test(tag) ? 'rule-line' : 'section-rule', line, ev);
  };

  // --- headings and text ---
  const wordCount = (x) => x.split(/\s+/).filter((w) => /[A-Za-z0-9\u00c0-\u00ff]/.test(w)).length;
  const stacked = (t) => {
    const parts = t.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
    return parts.length >= 2 && parts.length <= 4 && parts.every((x) => wordCount(x) <= 5);
  };
  const CLIPPED_HEAD = [
    /^[^.!?]{2,48},\s+(all|each|every|only|just|both|always|never)\b/i,
    /^(one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+\w+(\s\w+)?,\s+\w+/i,
  ];
  const checkHeading = (text, line) => {
    const t = decode(text).replace(/\s+/g, ' ').trim();
    if (!t) return;
    if (stacked(t) || CLIPPED_HEAD.some((re) => re.test(t))) add('clipped-headline', line, `<h> ${t}`);
    const words = t.split(/\s+/).filter((w) => /[A-Za-zÀ-ÿ]/.test(w));
    if (TOPIC_HEADINGS.has(t.toLowerCase().replace(/[.:!?]+$/, ''))) add('topic-heading', line, `<h> ${t}`);
    const major = words.filter((w) => !SMALL_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, '')));
    if (words.length >= 4 && major.length >= 3 && major.every((w) => /^[A-ZÀ-Ý]/.test(w.replace(/^[^A-Za-zÀ-ÿ]+/, '')))) add('heading-case', line, `Title Case: ${t}`);
    else if (words.length >= 2 && /[A-Z]/.test(t) && t === t.toUpperCase() && t.replace(/[^A-Za-z]/g, '').length >= 6) add('heading-case', line, `ALL CAPS: ${t}`);
  };

  const checkText = (raw, line, tags) => {
    const t = decode(raw).replace(/\s+/g, ' ').trim();
    if (!t || t.length < 2) return;
    const inAnchor = tags.includes('a') || tags.includes('button');
    if (/—/.test(t)) add('em-dash', line, t);
    if (t.length <= 90 && !tags.some((x) => /^h[1-6]$/.test(x)) && stacked(t)) add('clipped-headline', line, t);
    if (/\p{Extended_Pictographic}/u.test(t.replace(/[©®™]/g, ''))) add('emoji', line, t);
    if (/\S\s[·•∙⋅●]\s\S/.test(t)) add('dotted-meta', line, t);
    else if (t.length <= 90 && !tags.includes('title') && (t.match(/\s[|\/]\s/g) || []).length >= 2 && !/https?:|\.[a-z]{2,4}\b/i.test(t)) add('dotted-meta', line, t);
    if (inAnchor && /[→↗➜➔›»↦]\s*$/.test(t)) add('arrow-link', line, t);
    for (const re of AI_PHRASES) { const m = t.match(re); if (m) { add('ai-phrase', line, `"${m[0]}" in: ${t}`); break; } }
    for (const re of CONTRAST) { if (re.test(t)) { add('contrast-formula', line, t); break; } }
    for (const re of PROOF) { if (re.test(t)) { add('invented-proof', line, t); break; } }
  };

  // ---------- run ----------
  if (ext === '.css' || ext === '.scss') {
    checkCssBlock(src, 1, true);
    return findings.sort((a, b) => a.line - b.line);
  }

  const stack = [];
  const TOKEN = /<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>|<(\/?)([A-Za-z][\w:.-]*)((?:"[^"]*"|'[^']*'|\{[^}]*\}|[^>"'{])*)>|[^<]+|</g;
  let m;
  while ((m = TOKEN.exec(src))) {
    const tok = m[0];
    const line = lineOf(m.index);
    if (tok.startsWith('<!--')) continue;
    if (m[1]) {
      if (m[1].toLowerCase() === 'style') {
        const open = tok.indexOf('>') + 1;
        const css = tok.slice(open, tok.lastIndexOf('</'));
        checkCssBlock(css, lineOf(m.index + open), false);
      }
      continue;
    }
    if (m[3]) {
      const tag = m[3].toLowerCase(), closing = m[2] === '/', attrs = m[4] || '';
      if (closing) {
        for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === tag) { const el = stack.splice(i).shift(); if (/^h[1-6]$/.test(tag) && el.text) checkHeading(el.text, el.line); break; }
        continue;
      }
      const attr = (name) => {
        const r = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{([\\s\\S]*?)\\}(?=\\s|/?$))`, 'i');
        const a = attrs.match(r);
        return a ? { v: a[1] ?? a[2] ?? a[3] ?? '', braced: a[3] !== undefined } : null;
      };
      const literals = (a) => (a ? (a.braced ? [...a.v.matchAll(/["'`]([^"'`]*)["'`]/g)].map((x) => x[1]).join(' ') : a.v) : null);
      let cls = literals(attr('class')) ?? literals(attr('className'));
      cls = cls || '';
      const names = cls.split(/\s+/).filter(Boolean);
      if (tag === 'hr') add('section-rule', line, '<hr>');
      if (/^(em|i)$/.test(tag) && stack.some((e) => /^h[1-6]$/.test(e.tag))) add('heading-italic', line, `<${tag}> inside a heading`);
      if (names.length) { nameChecks(names, line, `<${tag}>`, null); checkClasses(cls, tag, line); }
      const st = attr('style');
      if (st) {
        const rule = st.braced ? parseJsxStyle(st.v, line) : parseInlineStyle(st.v, line);
        rule.sel = `<${tag} style>`;
        checkRule(rule, line, { tag });
      }
      if (tag === 'link' && /fonts\.(googleapis|bunny)\.net|use\.typekit\.net/i.test(attrs)) {
        const href = attr('href')?.v || '';
        const fams = [...href.matchAll(/family=([^&:;"']+)/g)].map((x) => decodeURIComponent(x[1]).replace(/\+/g, ' '));
        if (fams.length) checkFonts(fams, line, `<link> loads ${fams.join(', ')}`);
        else if (cfg.font) add('font-off-brand', line, `<link> loads a web font (main font should be ${cfg.font})`);
      }
      if (!VOID.has(tag) && !/\/\s*$/.test(attrs)) stack.push({ tag, line, text: '' });
      continue;
    }
    // text
    const tags = stack.map((e) => e.tag);
    if (tags.some((t) => TEXT_SKIP.has(t))) continue;
    const trimmed = tok.replace(/\{[^}]*\}/g, ' ');
    const lead = tok.length - tok.trimStart().length;
    for (const e of stack) if (/^h[1-6]$/.test(e.tag)) e.text += ' ' + trimmed;
    checkText(trimmed, lineOf(m.index + lead), tags);
  }
  return findings.sort((a, b) => a.line - b.line || a.id.localeCompare(b.id));
}

// ---------- config and files ----------

export function loadConfig(startPath, override = {}) {
  let dir = path.resolve(startPath);
  try { if (fs.statSync(dir).isFile()) dir = path.dirname(dir); } catch { /* use as is */ }
  let found = {};
  for (let i = 0; i < 12; i++) {
    const p = path.join(dir, '.de-claudeify.json');
    if (fs.existsSync(p)) {
      try { found = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { throw new Error(`cannot parse ${p}`); }
      break;
    }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return { ...DEFAULT_CONFIG, ...found, ...override };
}

const EXT = new Set(['.html', '.htm', '.css', '.jsx', '.tsx', '.vue', '.svelte', '.astro']);
export function collectFiles(paths) {
  const out = []; const seen = new Set();
  const visit = (p, top) => {
    let st; let real;
    try { st = fs.statSync(p); real = fs.realpathSync(p); } catch { if (top) throw new Error(`cannot read ${p}`); return; }
    if (seen.has(real)) return; seen.add(real);
    if (st.isDirectory()) {
      const base = path.basename(p);
      if (!top && (base === 'node_modules' || base.startsWith('.') || ['dist', 'build', 'coverage'].includes(base))) return;
      for (const e of fs.readdirSync(p).sort()) visit(path.join(p, e), false);
    } else if (EXT.has(path.extname(p).toLowerCase())) out.push(p);
  };
  for (const p of paths) visit(p, true);
  return out;
}
