# Cleaning an existing design

`/de-claudeify clean <path>` removes the tells and keeps everything that works. It is a surgical pass, not a redesign.

## Before you touch anything

1. Read the files. Note the content, the sections, the links, forms and scripts, the alt text and the ARIA labels. Those survive.
2. Run `node <skill-dir>/scripts/scan.mjs <path> --json` and keep the counts. That is the baseline.
3. Check for a brand: a logo, a brand font, brand colors, a `.de-claudeify.json`. If there is one, its tokens stay and only the tells go.
4. Work on a copy when the user's file is the only version: write `<name>.clean.<ext>` next to it unless they asked to edit in place.

## What stays

- Every word of real content, unless it is a tell in the copy (see below).
- Links, form fields and their names, scripts, event handlers, data attributes.
- Semantic structure: headings in order, landmarks, labels, alt text.
- Anything that carries information: a chart axis, a total row, a real photo, a real logo the client uses.

## Substitutions

| Tell | Replace with |
|---|---|
| Eyebrow, kicker, overline | Delete it. If the context matters, one plain sentence under the title. |
| Dotted subtitle | Delete it, or one plain sentence. |
| Bordered, rounded card | Remove border, radius, shadow and fill. Keep the grid and add gap. |
| Row of three feature cards | A grid with no boxes. Let the most important item be larger. |
| Icon in a rounded tile | Delete it. Keep the title and the text. |
| Callout box with a colored bar | A normal paragraph. Bold the key sentence only if it needs it. |
| Gradient background | A flat token color: `--bg` or `--ink`. |
| Gradient headline | Ink color. Accent on one word at most. |
| Glass panel | A solid token color. |
| Drop shadow | Nothing. Space separates. |
| Border under a heading | Margin. |
| `<hr>`, border on a header, footer or between sections | Remove it and look. Keep it only if it separates two ideas that space alone would blur, and waive it with the reason. |
| Table with gridlines | Remove cell borders. Align columns. Add 14 to 28px between rows. Keep a line above a total row. |
| Badge, pill, chip | Plain text next to the item. |
| Pulsing dot | The real status in words, or nothing. |
| Italic word in a heading | The same word in the heading's style. |
| Title Case heading | Sentence case. |
| Fragment headline ("Three wines, all from the same rows") or stacked short sentences | One full sentence with a subject and a verb, as you would say it aloud. |
| Topic heading ("Features") | A claim the section proves. Ask what the section is for. |
| Hover lift | A color change or an underline. |
| Fade-up on scroll, floating, glow | Remove. Keep motion that explains a change. |
| `transition: all` | The properties you mean. |
| A second or default web font | The configured font (Arial by default) or the brand font. |
| Cream background with clay accent | White or black, and the brand accent. |
| Emoji | Delete. |
| Arrow after link text | Delete the arrow. |

## Copy

Rewrite only what the scanner flags and what reads as generated:

- Stock words (`ai-phrase`): say what happens. "Unlock seamless workflows" becomes "Send an invoice and see when it is paid."
- "Not X, but Y" (`contrast-formula`): state the point once.
- Em dashes: a comma, a period or parentheses.
- Invented proof (`invented-proof`): remove it, or mark it `[[CLIENT: real figure and source]]` and tell the user it needs a real figure.

Never invent a replacement fact. A missing fact is a visible placeholder.

## Order of work

1. Structure: remove boxes, lines and decoration. The page should still read.
2. Type: one font, the scale from `style.md`, sentence-case claims.
3. Color: tokens at `:root`, flat surfaces, one accent.
4. Motion: remove ambient, keep meaningful.
5. Copy.
6. Rescan until no FAIL. Fix or waive each WARN.

## Verify

If a browser is available, open the page at 1280 and 390 wide, before and after. Check that nothing collapsed, nothing overflows and the hierarchy still reads without the boxes. If no browser is available, say so.

## Report

Keep it to a few lines:

```
Cleaned landing/before.html -> landing/after.html
Before: 21 FAIL, 9 WARN. After: 0 FAIL, 0 WARN.
Removed: eyebrows (4), cards (6), gradient, shadows, badge, hr, emoji, title-case headings (3).
Rewrote: 3 headings as claims, 5 stock phrases. Removed an unsourced "trusted by" line.
Kept: all links, the contact form, the logo.
Not checked: mobile layout (no browser available).
```
