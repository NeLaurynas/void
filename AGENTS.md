# AGENT INSTRUCTIONS – VOID Blog

This repo is a small static blog engine plus client-side app built around Markdown posts, a Bun-based build pipeline, and a single-page style reader.

The instructions in this file apply to the entire repository.

## High-level Architecture

- **Posts + assets**
  - Posts live under `posts/<YEAR>/*.md`.
  - Images for a given year live in `posts/<YEAR>/images/` and are referenced from Markdown as `images/<name>.<ext>`.
  - Each post starts with a simple `key: value` metadata block, then a blank line, then Markdown content.
  - The builder strips metadata, renders Markdown to HTML (markdown-it + implicit figures), and handles image copy/rewrites and size hints.

- **Build-time (Bun)**
  - `scripts/build-posts.js`
    - Scans `posts/<YEAR>/*.md`.
    - Parses metadata: `slug`, `header`, `subheader`, `date`, `tags`.
    - Renders Markdown to HTML.
    - Rewrites image paths `images/...` → `/images/<YEAR>/...` and copies source files to `dist/images/<YEAR>/`.
    - Interprets size hints in image titles: `small`/`half` (50%), `w=NN%`, `width=NNpx`.
    - Outputs per-post HTML files: `dist/<YEAR>/<slug>.html` and manifest `dist/posts.json`.
  - `scripts/copy-html.js`
    - Copies `src/blog.html` to `dist/blog.html`.
    - When `dist/posts.json` exists, injects the list view markup (links with `data-post` slugs).
  - `scripts/copy-assets.js`
    - Copies any static assets (e.g., favicons, misc files) into `dist` (see the script for exact behavior).
  - Bundling (`bun run build`)
    - Bundles `src/main.js` to `dist/bundle.js`.
    - Minifies `src/blog.css` to `dist/blog.css`.
    - Runs `build-posts`, `copy-html`, and `copy-assets` in sequence via the `build` script.

- **Runtime (client)**
  - `src/main.js`
    - Handles app bootstrapping, theme setup, router wiring, list/detail transitions, and hover/focus preloading of posts.
    - Manages `localStorage` caching of post HTML; clears caches every 24h (and fully clears on localhost).
  - `src/router.js`
    - Client-side routing and canonicalization between `/slug` and `/YEAR/slug`.
    - Validates slugs against the manifest and redirects unknown routes to `/`.
  - `src/posts.js`
    - `preloadPost(id, meta)` loads HTML (from cache or `/YEAR/<slug>.html`) and stores in `localStorage`.
    - `openPost(id, push, link, meta)` performs list→detail transitions (View Transitions when available) and pushes canonical URLs.
    - `closePost(push)` transitions back to the list and updates history.
  - `src/theme.js`, `src/viewTransition.js`
    - Implement theme switching with View Transitions (with a CSS fallback).
  - `src/blog.css`
    - Defines layout, typography, light/dark design tokens, transitions, centered images, figure captions, and “small/half” sizing behavior.

## Commands and Tooling

- Runtime: Bun (`"packageManager": "bun@1.1.30"`, requires Bun ≥ 1.1.0).
- Key scripts (from `package.json`):
  - `bun run build:js` → bundle `src/main.js` to `dist/bundle.js`.
  - `bun run build:css` → minify `src/blog.css` to `dist/blog.css`.
  - `bun run build:posts` → generate `dist/<YEAR>/<slug>.html` and `dist/posts.json`.
  - `bun run build:html` → copy/inject `src/blog.html` into `dist/blog.html`.
  - `bun run build:assets` → copy static assets via `scripts/copy-assets.js`.
  - `bun run build` → full production build (js, css, posts, html, assets).
  - `bun run dev` → development workflow / dev server (see `scripts/dev.js` for details).
  - `bun run new` → interactive helper to scaffold new posts (`posts/<YEAR>/<index>_<slug>.md`).
  - `bun run copyright` → runs `scripts/copyright.cjs`.

## Conventions for Future Changes

- Prefer using the `bun run new` helper to create posts and maintain consistent metadata + filenames.
- Keep build-time scripts (`scripts/*.js`) side-effect free except for expected filesystem operations under `dist/` and `posts/`.
- Avoid introducing additional build systems or bundlers; integrate new behavior into the existing Bun-based pipeline.
- Preserve the current client-side routing and caching approach; if changing routes or storage keys, update both the router and posts modules coherently.
- Do not add large new dependencies unless absolutely necessary; the project is intentionally lightweight.

