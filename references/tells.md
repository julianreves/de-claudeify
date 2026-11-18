# The tells

Every habit De-Claudeify looks for, grouped by what it touches. This file is generated from `scripts/rules.mjs`. Do not edit it by hand: change the rule and run `node scripts/gen-tells.mjs`.

Grades: **FAIL** is a hard tell the scanner blocks on. **WARN** is a judgment call the scanner reports. **JUDGE** is a tell no scanner can see, so the skill checks it by eye.

Waive a finding on purpose with `/* de-claudeify-allow: <id> -- reason */` on the line or the line above. Use `de-claudeify-allow-file: <id>` to waive it for a whole file.

## Type

### `tracked-caps` (FAIL)

**Small uppercase labels with wide letter spacing.** The most repeated marker of generated design. It appears above every section, so the page reads as a template.

**Fix.** Write the label as a plain sentence in the body face, a step smaller, in sentence case and untracked. Or delete it.

```css
.label { text-transform: uppercase; letter-spacing: .12em; font-size: 11px; }
```

```css
.label { font-size: 14px; color: var(--muted); }
```

### `eyebrow` (FAIL)

**A short label stacked above a headline.** Eyebrows, kickers and overlines add a second headline to say what the first one already says.

**Fix.** Delete it. If the reader needs context, write one plain sentence under the title.

```html
<p class="eyebrow">Our approach</p>
<h2>We keep your books clean</h2>
```

```html
<h2>We keep your books clean</h2>
```

### `dotted-meta` (FAIL)

**Terms joined by dots, bullets, slashes or pipes.** Strings like "Strategy · Q4 · 2026" decorate a title with fake metadata. Nobody speaks that way.

**Fix.** Let the title stand alone. If context is needed, write one plain sentence.

```html
<p>Strategy · Q4 · 2026</p>
```

```html
<p>The plan for the last quarter of 2026.</p>
```

### `heading-italic` (FAIL)

**One italic word inside a roman heading.** The serif-italic accent word is the signature of generated landing pages.

**Fix.** Set the whole heading in one style. Emphasis comes from the words.

```html
<h1>Finance that feels <em>effortless</em></h1>
```

```html
<h1>Your books are closed by the fifth of each month</h1>
```

### `heading-case` (WARN)

**Title Case Or ALL CAPS headings.** Headings in Title Case or capitals read as labels. People write sentences.

**Fix.** Use sentence case: capital for the first word and proper nouns only.

```html
<h2>Why Choose Fernwood For Your Business</h2>
```

```html
<h2>Why owners stay with Fernwood for years</h2>
```

### `topic-heading` (WARN)

**A heading that names a topic instead of making a claim.** "Features", "How it works" and "Benefits" tell the reader nothing. A heading should be the point of the section.

**Fix.** Rewrite the heading as the claim the section proves.

```html
<h2>Features</h2>
```

```html
<h2>One invoice, one payment, one place to find both</h2>
```

### `default-font` (WARN)

**A font that generated pages reach for.** Inter, Space Grotesk, Fraunces and a few others show up in most generated pages. They are good fonts and an instant signal.

**Fix.** Choose one typeface on purpose, or set `font` in `.de-claudeify.json` and let the scanner enforce it.

```css
body { font-family: "Inter", sans-serif; }
```

```css
body { font-family: Arial, Helvetica, sans-serif; }
```

### `font-off-brand` (FAIL)

**The main font is not the configured font.** The house style is one typeface everywhere. A second face needs a client brand that demands it.

**Fix.** Use the configured font (Arial by default) as the first family, or add the family to `fontAllow`.

```css
body { font-family: "Playfair Display", serif; }
```

```css
body { font-family: Arial, Helvetica, sans-serif; }
```

### `emoji` (FAIL)

**Emoji used as icons or bullets.** Emoji in a heading or a feature list is decoration, and it dates the page immediately.

**Fix.** Remove it. If an icon carries meaning, draw a real one in the page palette.

```html
<h3>🚀 Fast setup</h3>
```

```html
<h3>Set up in an afternoon</h3>
```

## Color

### `gradient` (FAIL)

**Gradients.** Purple-to-blue washes, glow blobs and gradient buttons are the clearest visual tell. A gradient over a photo to keep text readable is allowed.

**Fix.** Use a flat token color. For depth, use space and size.

```css
.hero { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
```

```css
.hero { background: var(--bg); }
```

### `gradient-text` (FAIL)

**Text filled with a gradient.** Gradient headlines are the loudest version of the gradient tell.

**Fix.** Set the heading in the ink color. Use the accent color on a single word at most.

```css
h1 { background: linear-gradient(90deg, #f0f, #00f); -webkit-background-clip: text; color: transparent; }
```

```css
h1 { color: var(--ink); }
```

### `palette-cream` (WARN)

**Warm cream page background.** Cream paper with a clay accent and a serif is a recognisable generated look. Pure white or black ages better.

**Fix.** Use pure white or pure black for the surface, or a color that comes from the client brand.

```css
body { background: #faf9f6; }
```

```css
body { background: #ffffff; }
```

### `palette-clay` (WARN)

**Terracotta or clay accent.** The orange-clay accent is the signature accent of a generated editorial page.

**Fix.** Pick the accent from the brand, or use one strong red or blue with a stated meaning.

```css
a { color: #d97757; }
```

```css
a { color: var(--accent); }
```

### `palette-indigo` (WARN)

**Indigo or violet accent.** The default Tailwind indigo and violet fill thousands of generated pages.

**Fix.** Pick the accent from the brand, or one color with a stated meaning.

```css
.btn { background: #6366f1; }
```

```css
.btn { background: var(--accent); }
```

## Shape

### `shadow` (FAIL)

**Drop shadows.** Soft shadows lift every card off the page and make the layout look like a component kit.

**Fix.** Remove the shadow. Separate things with space. Focus rings are allowed.

```css
.card { box-shadow: 0 10px 30px rgba(0,0,0,.08); }
```

```css
.card { }
```

### `glass` (FAIL)

**Glass and blur effects.** Frosted panels (backdrop blur) are decoration that rarely helps reading.

**Fix.** Use a solid color.

```css
.nav { backdrop-filter: blur(12px); background: rgba(255,255,255,.6); }
```

```css
.nav { background: var(--bg); }
```

### `card-box` (FAIL)

**The bordered, rounded box around content.** The square card with a thin border and soft corners is the default container of generated pages. It turns every idea into the same box.

**Fix.** Drop the border and the radius. Group with a grid, whitespace and type size.

```css
.feature { border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; }
```

```css
.feature { padding: 0; }
```

### `card-fill` (WARN)

**A filled, rounded card.** A grey or tinted rounded panel does the same job as the bordered card.

**Fix.** Remove the fill and the radius. Use space and weight to group.

```css
.stat-card { background: #f5f5f5; border-radius: 12px; padding: 24px; }
```

```css
.stat { padding: 0; }
```

### `radius` (WARN)

**Fat corner radius.** Radius of 16px and above makes everything look soft and generic.

**Fix.** Use 0 on content. Keep a small radius on controls only.

```css
.panel { border-radius: 24px; }
```

```css
.panel { border-radius: 0; }
```

### `badge` (FAIL)

**Badges, pills and chips.** A rounded "New" pill or status chip is ornament. If the status matters, say it in words.

**Fix.** Write it as plain text next to the item.

```html
<span class="badge">New</span>
```

```css
New in November.
```

### `icon-tile` (WARN)

**Icon in a rounded tile or circle.** A small icon inside a tinted rounded square above each feature title is a filler pattern.

**Fix.** Remove the icon, or draw one that explains something.

```html
<div class="icon-box"><svg>...</svg></div>
```

```css
(nothing)
```

### `callout-box` (WARN)

**Callout and note boxes.** Tinted boxes with a bold lead-in are used as ornament in generated documents.

**Fix.** Write the note as a normal paragraph. Move the key sentence up.

```html
<div class="callout">Note: ...</div>
```

```html
<p>...</p>
```

### `status-dot` (WARN)

**Decorative status or live dots.** A pulsing dot beside a label suggests live data that usually is not there.

**Fix.** Remove it, or show the real status in words.

```html
<span class="dot pulse"></span> Now live
```

```css
Live since 3 November.
```

## Lines

### `rule-line` (FAIL)

**Decorative lines.** A rule under a title, or a border on every table cell. These add nothing: the heading and the data already say where they start and stop.

**Fix.** Remove the line and leave the space. A line is fine when it does work: separating ideas or sections, or carrying data like a chart axis or a total row.

```css
h2 { border-bottom: 1px solid #e5e5e5; }
td { border: 1px solid #e5e5e5; }
```

```css
h2 { margin-bottom: 24px; }
```

### `section-rule` (WARN)

**A line between sections, or under a header or footer.** Often decoration, sometimes the right call. A line is worth keeping when it separates two ideas that space alone would blur, like one wine from the next in a price list.

**Fix.** Remove it and look: does the grouping still read? If yes, leave it out. If not, keep it and waive it with the reason: `/* de-claudeify-allow: section-rule -- separates one wine from the next */`.

```css
header { border-bottom: 1px solid #eee; }
<hr>
```

```css
header { margin-bottom: 64px; }
```

### `row-rules` (WARN)

**Hairlines between table rows or list items.** Row dividers are a softer version of the gridline. Alignment and spacing already separate rows.

**Fix.** Remove the divider and add 20 to 28px between rows. Keep a line above a total row, or where rows are long and a line helps the eye.

```css
td { border-bottom: 1px solid #eee; }
```

```css
td { padding: 14px 0; }
```

### `accent-bar` (FAIL)

**Colored bar on the left edge.** A thick left border on a note, quote or card is the standard generated callout.

**Fix.** Remove the bar. Set the text apart with size or weight.

```css
.note { border-left: 4px solid #d97757; padding-left: 16px; }
```

```css
.note { font-weight: 700; }
```

## Motion

### `transition-all` (FAIL)

**transition: all.** It animates properties nobody meant to animate, including layout.

**Fix.** List the properties: `transition: color .15s, opacity .15s`.

```css
.btn { transition: all .3s ease; }
```

```css
.btn { transition: opacity .15s; }
```

### `hover-lift` (WARN)

**Cards that rise on hover.** translateY(-4px) plus a bigger shadow on every card is a generated reflex.

**Fix.** Change color or underline instead.

```css
.card:hover { transform: translateY(-4px); }
```

```css
.card:hover { color: var(--accent); }
```

### `ambient-motion` (WARN)

**Ambient animation: fade-up, pulse, float, glow.** Motion without meaning. Everything fades up on scroll and nothing is explained by it.

**Fix.** Animate only to show cause or change: a bar grows to its value, a counter moves to its number.

```css
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } }
```

```css
(no keyframes)
```

## Copy

### `em-dash` (FAIL)

**Em dashes.** The em dash is the best-known marker of generated prose.

**Fix.** Use a comma, a period or parentheses.

```css
Fast — and reliable.
```

```css
Fast and reliable.
```

### `arrow-link` (FAIL)

**Arrows glued to link text.** "Learn more →" is a reflex. The link already looks like a link.

**Fix.** Say what the link does in plain words and drop the arrow.

```html
<a href="/pricing">See pricing →</a>
```

```html
<a href="/pricing">See pricing</a>
```

### `ai-phrase` (WARN)

**Stock marketing words.** Seamless, elevate, unlock, empower, streamline, robust, cutting-edge and their relatives. They say nothing and they sound generated.

**Fix.** Say what actually happens, with a verb and a noun a customer would use.

```css
Unlock seamless financial workflows.
```

```css
Send an invoice and see when it is paid.
```

### `clipped-headline` (WARN)

**Headlines and lines built from clipped fragments.** Two or three short sentences stacked ("128 orders this week. Two are late."), or a noun phrase with a tail ("Three wines, all from the same rows."). Models use this rhythm over and over. People say a whole sentence with a subject and a verb.

**Fix.** Write it the way you would say it out loud: "Our three wines come from the same forty-one rows." "We shipped 128 orders this week, and two of them are late."

```html
<h2>Three wines, all from the same forty-one rows.</h2>
<h1>128 orders this week. Two are late.</h1>
```

```html
<h2>Our three wines come from the same forty-one rows.</h2>
<h1>We shipped 128 orders this week, and two of them are late.</h1>
```

### `contrast-formula` (WARN)

**"Not X, but Y" sentences.** The two-beat pattern that denies a claim and then flips it. In English and Spanish ("no es X, es Y") it is the clearest sentence-level tell.

**Fix.** State the point once, in the form you mean.

```css
It’s not accounting, it’s peace of mind.
```

```css
We close your books by the fifth.
```

### `invented-proof` (WARN)

**Unsourced proof: "Trusted by", counts, uptime.** Generated pages invent logos, user counts and percentages. A number without a source is a liability.

**Fix.** Remove it, or replace it with a real figure and its source and date.

```css
Trusted by 10,000+ teams
```

```css
(a real client name and a real result, with permission)
```

### `fragment-copy` (JUDGE)

**A page where every line is a fragment.** A hero line, a tagline and three captions all clipped to a few words, with no verbs. Read the page out loud: nobody talks like that.

**Fix.** Rewrite the main lines as full sentences. Keep a fragment only where a person would use one, like a price or a label.

## Layout

### `three-up` (JUDGE)

**Three equal cards under the hero.** Three features, three columns, same height. The rule of three as layout.

**Fix.** Give the most important idea its own space and cut the rest. If there really are three, let them differ in size.

### `stat-row` (JUDGE)

**A row of three big numbers with small labels.** Often invented, always symmetrical.

**Fix.** Keep one number with its source and make it the headline.

### `cta-band` (JUDGE)

**The closing band: "Ready to get started?".** A centered headline, one sentence and two buttons at the end of every page.

**Fix.** End on the last real content. Put one plain link where the reader finished reading.

### `centered-stack` (JUDGE)

**Everything centered in one narrow column.** Centered heading, centered paragraph, centered buttons, repeated per section.

**Fix.** Left-align text. Use the width of the page.

### `numbered-circles` (JUDGE)

**Steps in numbered circles.** Three colored circles with 1, 2, 3 joined by a line.

**Fix.** Write the steps as a short numbered list or as three plain sentences.

### `button-pair` (JUDGE)

**A filled button next to a ghost "Learn more".** Two actions where one would do.

**Fix.** One primary action. The second is a text link, or nothing.

### `logo-wall` (JUDGE)

**A wall of customer logos.** Usually invented or used without permission.

**Fix.** Use one real client quote with a name and permission, or nothing.

### `headline-topic` (JUDGE)

**Slide titles that name a topic.** On decks and reports, "Overview" and "Market" are labels. The title should be the claim of the slide.

**Fix.** Rewrite each title as a sentence the slide proves.
