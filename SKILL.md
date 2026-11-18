---
name: de-claudeify
description: "Removes the habits that make a design look AI-made: eyebrows, dotted subtitles, bordered cards, gradients, shadows, pills, emoji, title-case headings, stock marketing words. Use when building any page, deck, dashboard or UI, and whenever the user says de-claudeify, 'looks AI', 'looks generated' or 'too Claude'. For an existing design, only when the user names it, as in `/de-claudeify clean <path>`."
argument-hint: "<prompt> | clean <path> | scan <path>"
version: 1.0.0
---

# De-Claudeify

Makes what an AI builds look like a person made it. A short list of hard rules removes the habits every model falls into, a scanner checks them, and everything above that floor is your own design judgment.

The default style is plain on purpose: one typeface, a white or black surface, no boxes, no decorative lines, headings that make a claim. A client's brand overrides it.

## The Floor

These bind every output, in every harness. The ids match `references/tells.md` and the scanner.

1. No eyebrows, kickers or overlines, and no small label in tracked capitals. (`eyebrow`, `tracked-caps`)
2. No subtitle made of terms joined by dots, bullets, slashes or pipes. A title stands alone. (`dotted-meta`)
3. No gradients (except a scrim over a photo), no gradient text, no glass or blur. (`gradient`, `gradient-text`, `glass`)
4. No drop shadows. Focus rings are fine. (`shadow`)
5. No bordered, rounded boxes around content, no tinted callouts, no colored left bars. Group with space, size and weight. (`card-box`, `card-fill`, `callout-box`, `accent-bar`)
6. No decorative lines: none under titles, none around table cells. A line is welcome when it does work: it separates ideas or sections that space alone would blur, or it carries data (a chart axis, a total row). Ask of every line what it separates. (`rule-line`, `section-rule`, `row-rules`)
7. No emoji, no badges, pills or chips, no icon tiles, no pulsing status dots. (`emoji`, `badge`, `icon-tile`, `status-dot`)
8. One typeface, declared once. No italic word inside a heading. Headings in sentence case, written as claims. (`font-off-brand`, `heading-italic`, `heading-case`, `topic-heading`)
9. Write full sentences a person would say out loud, with a subject and a verb. No clipped fragments ("Three wines, all from the same rows."), no stacked short sentences ("128 orders. Two are late."). No em dashes, no arrows glued to link text, no stock marketing words, no "not X, but Y" sentences. (`clipped-headline`, `em-dash`, `arrow-link`, `ai-phrase`, `contrast-formula`)
10. Never an invented metric, logo, testimonial or "trusted by" line. Every number has a source and a date, or is labelled illustrative. (`invented-proof`)
11. Never `transition: all`. Motion shows cause or change, never ambience. (`transition-all`, `ambient-motion`, `hover-lift`)
12. If Node is available, run `node <skill-dir>/scripts/scan.mjs <output>` before handing back. Fix every `FAIL`. Fix or waive every `WARN` with a reason.

The tells nobody can grep for (three equal cards, a row of three numbers, the closing "Ready to get started?" band, everything centered) are in `references/tells.md` under **JUDGE**. Check them by eye.

## Modes

**Build** (`/de-claudeify <prompt>`, or any request to make a page, deck, dashboard or UI): design it with the Floor in mind from the first line, then scan.

**Clean** (`/de-claudeify clean <path>`): take an existing design and remove the tells while keeping the content, the structure that works and every piece of wiring (links, forms, scripts, accessibility). Read `references/clean.md` first.

**Scan** (`/de-claudeify scan <path>`): run the scanner and report. Change nothing.

Any other change to an existing design is not a De-Claudeify run. Do it as asked, in the project's own system.

## Flow

1. **Read the project first.** A `.de-claudeify.json`, a brand guide, a `design.md`, the fonts and tokens already in use. A client brand beats the default style (`references/style.md`, section Brand).
2. **Decide, do not interview.** Pick sensible defaults, state them in one line at the top of the reply, ask at most one question and only when the answer changes the result.
3. **Build or clean.**
   - Build: tokens first (`:root` holds every color and the one font), then the hero, then the rest. Sentence-case claims for headings. Space and type size do the grouping.
   - Clean: scan to get the baseline, apply the substitutions in `references/clean.md`, rescan.
4. **Write the copy like a person.** Read `references/copy.md`. Short and direct. Real nouns and verbs. No number without a source.
5. **Sweep.** Run the scanner until it reports no FAIL. Look at the page at 1280 wide and 390 wide if a browser is available. Then check the JUDGE list by eye.
6. **Report.** One line per decision. For a clean run, give the before and after counts: `18 FAIL, 6 WARN before. 0 FAIL, 0 WARN after.` Say what you kept and what you could not check.

## The scanner

```bash
node <skill-dir>/scripts/scan.mjs <file-or-folder> [--strict] [--json] [--font Arial|none]
node <skill-dir>/scripts/scan.mjs --list
node <skill-dir>/scripts/scan.mjs --explain card-box
```

It reads `.html`, `.css`, `.jsx`, `.tsx`, `.vue`, `.svelte` and `.astro`, including Tailwind classes and inline styles. It exits 1 on any FAIL.

A waiver is allowed when the tell is the point, for example a drop shadow on a mockup that imitates a real device. Write it where it applies, with the reason: `/* de-claudeify-allow: shadow -- imitates the real device */`. A waiver with no reason is a failure of the run.

Config lives in `.de-claudeify.json` at the project root:

```json
{ "font": "Arial", "fontAllow": ["Georgia"], "disable": ["palette-cream"] }
```

## Other formats

Word, PowerPoint, PDF and spreadsheet files have no scanner yet. The same rules apply by hand: `references/formats.md` is the checklist. Check it before handing back.

## References

Load a file only when you need it.

- `references/style.md`: the default style, tokens, type scale, layout without lines, brand override.
- `references/clean.md`: the clean procedure and the substitution table.
- `references/copy.md`: writing rules and the stock phrases.
- `references/formats.md`: Word, PowerPoint, PDF, spreadsheet and email checklists.
- `references/tells.md`: every tell with its reason, fix and an example. Generated from `scripts/rules.mjs`.
