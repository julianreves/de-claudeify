# The default style

Calm and clear. Few colors, one font, a lot of space, and every element earns its place. When in doubt, remove something.

This is the style the scanner enforces by default. A client's brand overrides the values below (see Brand). The grammar stays.

## Surface and color

- Surface: pure white `#FFFFFF` or pure black `#000000`. Pick one as the main surface. No gradients, textures, shadows or photos behind text.
- Ink `#111318` on white, `#FFFFFF` on black. Secondary text `#6A7078`.
- Red `#D62718` (small text `#A81C0B`) for what matters most: the key number, the conclusion, the active item. One to three red things per screen.
- Yellow `#FFDE00` as a highlighter behind one or two words, a deadline or a caveat. A fill, never a text color.
- Dark blue `#1E3A6E` for calm structure: the second series in a chart, the neutral side of a comparison.
- Hairline `#DCDBD4` for a functional line.

Everything else is black or grey. If a screen shows more colors than these, something is wrong.

Declare every color once as a token at `:root` and use only tokens after that.

```css
:root {
  --bg: #ffffff;
  --ink: #111318;
  --muted: #6a7078;
  --accent: #d62718;
  --hairline: #dcdbd4;
}
```

## Type

One typeface: Arial, with `Helvetica, sans-serif` as the fallback. Use `font-variant-numeric: tabular-nums` wherever numbers line up.

| Element | Size on a 1440 canvas | Weight and tracking |
|---|---|---|
| Hero number | 96 to 200px | 700, tracking -0.045em, line height 0.9 |
| Page title | about 96px | 700, -0.035em |
| Section heading | 52 to 62px | 700, -0.03em |
| Statement or quote | 30 to 54px | 600 to 700 |
| Lead paragraph | 19 to 21px | 400, line height 1.45, secondary ink |
| Body | 15 to 17px | 400, line height 1.4 to 1.5 |
| Source line | 11 to 12px | 500, secondary ink |

Headings are sentence case and written as full sentences that make a claim, the way a person would say them. Not fragments with a tail ("Three wines, all from the same rows"), not stacked short sentences. There is no eyebrow row, no label above a title and no dotted subtitle. If a title needs context, write one plain sentence under it.

## Layout without lines

Structure comes from four tools: whitespace, size, weight and color.

- A group of three to five items is a grid with generous gaps (80 to 100px between columns, 40px between rows). Each item is a short bold title and a short paragraph. No boxes, no dividers.
- A comparison is two columns. The weight and size of the type do the contrast.
- Emphasis is a highlighter behind one or two words, or the accent on a number. Not both on the same words.
- Stacked rows, like a price list or a log, align on a grid and are separated by 22 to 28px of space.
- A card with a thin border is allowed only when text must sit on a busy visual such as a map.
- A line is welcome when it does work. It can separate ideas or sections that space alone would blur (one wine from the next in a price list), or carry data (a chart axis, a bracket marking a range, the total row of a table). A line under a title, around a box or on every table cell does no work, so it goes. Ask of each line: what does it separate?

Left-align text. Cap the measure: paragraphs 600 to 900px wide. Generous margins: about 74px top and bottom and 92 to 115px at the sides on a 1440 canvas.

No rounded corners and no drop shadows on content. Controls (buttons, inputs) may keep a small radius.

## Visuals

- Charts are drawn in code in the page's own type and colors. Label the bars directly. No legend, no gridlines. The chart's point is the headline.
- One hero number can own a screen: huge, alone, in the accent.
- Photos only when they carry information: the product, the place, the person. Never stock photos, clip art or decorative images.
- No emoji, no filler icons.

## Motion

Motion always means something: a bar grows to its value, a counter moves to its number, a headline gets struck through. No fade-up on scroll, no floating, no glow. Respect `prefers-reduced-motion`. Never `transition: all`.

## Brand

A client's brand beats this file. Swap the tokens, keep the grammar.

- **Changes:** colors, logo, tone of voice, the heading font if the brand relies on it and it is free to embed.
- **Stays:** no decorative lines, no eyebrows, no boxes, claim headings, sources on numbers, one idea per screen.
- **Accent:** the client's accent replaces red and yellow.
- **Black and white brands** get no accent. Emphasis comes from weight, size and an inverted `<mark>`.
- Set the brand font in `.de-claudeify.json` (`"font": "Brand Sans"`) so the scanner enforces it instead of Arial.
