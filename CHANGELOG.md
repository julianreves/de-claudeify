# Changelog

## 1.0.0

- Skill with three modes: build, clean and scan.
- Scanner for HTML, CSS, JSX, TSX, Vue, Svelte and Astro with 36 rules, plus 9 tells the agent checks by eye.
- Installer for Claude Code, Codex CLI, Cursor and OpenCode.
- Optional Claude Code hook that checks every web file the agent writes.
- Project config in `.de-claudeify.json` and per-finding waivers.
- Three before and after demos for a fictional winery: landing page, dashboard and slide, with an interactive slider (`demos/index.html`) and a Before and After GIF for each.
- Copy rule: full sentences, not clipped fragments or stacked short sentences (`clipped-headline`).
- Lines are judged by what they do: decorative lines fail, section lines warn, and a waiver with a reason keeps the ones that work.
