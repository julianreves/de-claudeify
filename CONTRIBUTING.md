# Contributing

Thanks for helping. The project is small on purpose: one rule list, one scanner, one skill.

## Set up

Node 18 or newer. No install step, there are no dependencies.

```bash
npm test
```

## Add or change a rule

1. Edit `scripts/rules.mjs`. Give the rule an id in kebab-case, a group, a grade (`FAIL` for a hard tell, `WARN` for a judgment call), a title, the reason, the fix, and a `bad` and `good` example.
2. Implement the check in `scripts/core.mjs`.
3. Add a positive example to `POSITIVE` in `tests/scan.test.mjs`. The test suite fails if a rule has no example.
4. Regenerate the catalogue: `node scripts/gen-tells.mjs`. CI fails when `references/tells.md` is stale.
5. Run `npm test` and `npm run scan:demos`. The three `after` demos must stay clean.

## Grading

- **FAIL** only when the pattern is close to always a tell and there is a clear replacement.
- **WARN** when it is sometimes right. Say in the rule when it is.
- Prefer a false negative over a noisy false positive. A scanner people disable helps nobody.

## Demos

`demos/*/before.html` are generated pages with the tells left in. `after.html` is the cleaned version. Both use a fictional business and invented, labelled data. Never use a real brand, a real person or real numbers. Re-render with `node demos/render.mjs`, which needs Chrome (and ffmpeg for the GIFs). Product images are rendered with `node demos/tools/render-images.mjs`. Demo copy follows the rules too: full sentences a person would say, never fragments with a tail.

## Style of the repo

The repo follows its own rules. No em dashes, no "not X, but Y" sentences, no emoji, short direct sentences. Pull requests that add decoration to the docs will be asked to remove it.

## Reporting a miss

Open an issue with a snippet that looks generated and passes the scan, or a clean snippet that is flagged. A minimal example is the most useful thing you can send.
