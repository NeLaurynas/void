# AGENT INSTRUCTIONS – VOID Blog

This repo is a lightweight static blog generator + a small client-side “single-page reader”. Posts are Markdown files under `posts/`, rendered at build time into `dist/`, then loaded/cached in the browser.

These instructions apply to the entire repository.

## Repo Layout (source of truth)

- `posts/<YEAR>/*.md`: Markdown posts.
- `posts/<YEAR>/images/*`: Per-year media (images + `.webm`); referenced from Markdown as `images/<name>.<ext>`.
- `scripts/*.js`: Build + dev scripts (run via Bun).
- `src/*`: Client app + HTML/CSS template.
- `dist/*`: Build output (generated; don’t hand-edit).

## Build Pipeline (Bun)

Core build command: `bun run build` (cleans `dist/` first).

- `scripts/clean-dist.js`: deletes + recreates `dist/`.
- `scripts/build-posts.js`:
  - Scans `posts/<YEAR>/*.md`.
  - Parses the simple metadata header (until first blank line): `slug`, `header`, `subheader`, `date`, `tags`.
  - Skips drafts (`date: draft`).
  - Renders Markdown to HTML (markdown-it + implicit figures; raw HTML in Markdown is disabled).
  - Copies `posts/<YEAR>/images/*` to `dist/images/<YEAR>/` and rewrites `images/...` → `/images/<YEAR>/...`.
  - Outputs: `dist/<YEAR>/<slug>.html` (HTML fragment) and `dist/posts.json` (manifest for the list).
  - Media extras via image syntax:
    - YouTube URLs render as `<iframe>` (supports `watch`, `youtu.be`, `shorts`, start times via `t`/`start`).
    - Local `.webm` renders as `<video autoplay loop muted playsinline>` with title hints for `controls` / `noautoplay` (`manual`).
  - Size hints in the image title apply to `<img>`, `<iframe>`, and `<video>`:
    - `small` / `half` → adds `.is-small` (50% width on desktop; full width on mobile).
    - `w=NN%`, `width=NN%`, `w=NNpx`, `width=NNpx` → inline `style="width:..."`.
  - Links open in new tabs (`target="_blank" rel="noopener"`). Images are wrapped in a self-link (unless already linked) so they can be opened full-size.
- `scripts/copy-html.js`: copies `src/blog.html` → `dist/blog.html`, injecting the list markup from `dist/posts.json`.
- `scripts/copy-assets.js`: copies `src/favicon.svg`, `src/robots.txt`, and highlight.js theme CSS files into `dist/` (when available in `node_modules`).
- `scripts/dev.js` (`bun run dev`):
  - Runs Bun bundler in `--watch` mode for JS/CSS.
  - Rewrites `src/blog.html` → `dist/blog.html` (with list injection) and adds live reload via `EventSource` at `/__livereload`.
  - Serves `dist/` and falls back to `dist/blog.html` for SPA routes.

## Post Format (Markdown)

Each post starts with `key: value` lines, then a blank line, then Markdown:

- Required: `slug`, `header`, `date`
- Optional: `subheader`, `tags` (comma-separated)
- Drafts: set `date: draft` to keep the post unpublished.

Important invariants:

- Slugs must be globally unique across all years (the client uses `data-post="<slug>"` and `localStorage[slug]`).
- The year used by the client is derived from the displayed `date` (`YYYY-MM-DD`), so `posts/<YEAR>/...` should match `date`’s year.

## Runtime App (client)

- `src/main.js`: bootstraps, theme, routing, list interactions (hover/focus preloads; plain left-click opens; modifiers use browser defaults).
- `src/router.js`: handles `/slug` and `/YEAR/slug`; unknown slugs route back to `/`. On iOS/Android history navigation, suppresses View Transitions to avoid gesture conflicts.
- `src/posts.js`:
  - Fetches post HTML from `/<year>/<slug>.html` and caches it in `localStorage` under the slug key.
  - Defers loading images beyond the first two (`img[src]` → `img[data-src]`) until the post is opened.
  - Syntax highlighting via highlight.js (registered: C, C++, C#, Rust).
- Cache housekeeping: `src/main.js` clears post caches every 48 hours; on localhost it clears all `localStorage` on load.
- Theme: `src/theme.js` follows `prefers-color-scheme` when unset; also swaps highlight.js theme CSS (`highlight-atom-one-{light,dark}.css`).

## Change Conventions / Gotchas

- Prefer `bun run new` to scaffold posts with consistent filenames + draft metadata.
- Don’t edit `dist/` by hand; it’s rebuilt (and `bun run build` deletes it).
- If you change routing, storage keys, or canonical URL rules, update `src/router.js`, `src/posts.js`, and any list injection logic together.
- Keep existing formatting per-file; avoid drive-by refactors.
- Theme & typography:
  - Default theme should follow `prefers-color-scheme` when no explicit choice is stored; do not silently default to dark.
  - Bold text in post content should be pure black in light mode and pure white in dark mode.
  - Code block backgrounds should be adjusted via `--code-bg` / `--code-inline-bg` tokens (not per-element hardcoding).
