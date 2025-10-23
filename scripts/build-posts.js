// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import { promises as fs } from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import implicitFigures from 'markdown-it-implicit-figures';

/**
 * Build script: scans posts/YYYY/*.md and produces dist/posts.json
 * with a list of posts, renders each post to HTML into dist/YYYY/<slug>.html,
 * and copies images from posts/YYYY/images/* to dist/images/YYYY.
 */

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function pathExists(p) {
  try { await fs.stat(p); return true; } catch { return false; }
}

async function listDir(dir) {
  try {
    return await fs.readdir(dir);
  } catch (err) {
    if (err && err.code === 'ENOENT') return [];
    throw err;
  }
}

function parseMetadata(md) {
  // Read until first blank line; parse key:value pairs we know.
  const lines = md.split(/\r?\n/);
  const meta = { slug: '', header: '', subheader: '', date: '', tags: [] };
  for (const line of lines) {
    if (!line.trim()) break; // stop at first blank line
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const rawVal = line.slice(idx + 1).trim();
    switch (key) {
      case 'slug':
        meta.slug = rawVal;
        break;
      case 'header':
        meta.header = rawVal;
        break;
      case 'subheader': {
        // Only strip surrounding quotes if they are a matching pair; preserve leading apostrophes like 'ere
        let v = rawVal;
        if (v.length >= 2) {
          const first = v[0];
          const last = v[v.length - 1];
          if ((first === '"' || first === "'") && last === first) {
            v = v.slice(1, -1);
          }
        }
        meta.subheader = v;
        break;
      }
      case 'date':
        meta.date = rawVal;
        break;
      case 'tags':
        meta.tags = rawVal
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        break;
      default:
        // ignore unknown keys
        break;
    }
  }
  return meta;
}

async function copyImages(yearDir, distDir) {
  const srcImages = path.join(yearDir, 'images');
  const year = path.basename(yearDir);
  // With dist as HTTP root, serve as /images/<year>/...
  const destImages = path.join(distDir, 'images', year);

  if (!(await pathExists(srcImages))) return { copied: 0 };

  await ensureDir(destImages);

  const items = await listDir(srcImages);
  let copied = 0;
  for (const name of items) {
    if (name === '.DS_Store') continue;
    const src = path.join(srcImages, name);
    const dst = path.join(destImages, name);
    const st = await fs.stat(src);
    if (st.isFile()) {
      await fs.copyFile(src, dst);
      copied++;
    }
  }
  return { copied };
}

async function main() {
  const root = process.cwd();
  const postsRoot = path.join(root, 'posts');
  const distRoot = path.join(root, 'dist');

  await ensureDir(distRoot);

  const entries = await listDir(postsRoot);
  const years = entries.filter((e) => /^\d{4}$/.test(e)).sort();

  const posts = [];
  let totalImagesCopied = 0;

  for (const year of years) {
    const yearDir = path.join(postsRoot, year);
    const files = (await listDir(yearDir)).filter((f) => f.endsWith('.md'));

    // Copy images for this year (if any)
    const { copied } = await copyImages(yearDir, distRoot);
    totalImagesCopied += copied;

    // Prepare markdown renderer for this year
    const md = new MarkdownIt({ html: false, linkify: true, typographer: false });
    md.use(implicitFigures, { figcaption: true });
    // Ensure links open in a new tab from generated HTML
    md.renderer.rules.link_open = (tokens, i, options, env, self) => {
      const token = tokens[i];
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noopener');
      return self.renderToken(tokens, i, options);
    };
    const escape = md.utils.escapeHtml;
    md.renderer.rules.image = (tokens, i) => {
      const t = tokens[i];
      let src = t.attrGet('src') || '';
      if (src.startsWith('images/')) {
        src = `/images/${year}/${src.slice(7)}`;
      }
      const alt = t.content || t.attrGet('alt') || '';
      let title = (t.attrGet('title') || '').trim();

      // Interpret simple sizing hints in the title:
      //  - "small" or "half" => width: 50%
      //  - "w=NN%" or "width=NN%" / px => explicit width
      let classes = [];
      let widthStyle = '';

      if (/\b(small|half)\b/i.test(title)) {
        classes.push('is-small');
        widthStyle = 'width:50%;';
        title = title.replace(/\b(small|half)\b/ig, '').trim();
      }
      const m = title.match(/\b(?:w|width)\s*=\s*(\d{1,3})(%|px)?\b/i);
      if (m) {
        const unit = m[2] || '%';
        widthStyle = `width:${m[1]}${unit};`;
        title = title.replace(m[0], '').trim();
      }

      const classAttr = classes.length ? ` class=\"${classes.join(' ')}\"` : '';
      const styleAttr = widthStyle ? ` style=\"${widthStyle}\"` : '';
      const titleAttr = title ? ` title=\"${escape(title)}\"` : '';

      return `<img src=\"${escape(src)}\" alt=\"${escape(alt)}\"${classAttr}${styleAttr}${titleAttr}>`;
    };

    for (const file of files) {
      if (file === '.DS_Store') continue;
      const filePath = path.join(yearDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const meta = parseMetadata(content);

      // Strip metadata header from content (first block until blank line)
      const parts = content.split(/\r?\n\r?\n/); // split by first blank line
      let body = '';
      if (parts.length > 1) {
        // Remove first paragraph (metadata block), rejoin the rest
        body = parts.slice(1).join('\n\n');
      } else {
        body = content; // if no blank line, render everything (unlikely)
      }

      // Render HTML
      const html = md.render(body);

      // Build path: use slug for route path (e.g., "/<slug>")
      const slug = meta.slug || path.basename(file, path.extname(file));
      const post = {
        slug,
        header: meta.header || '',
        subheader: meta.subheader || '',
        date: meta.date || '',
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        year,
        path: `/${year}/${slug}`,
        source: path.relative(root, filePath),
      };
      posts.push(post);

      // Write rendered HTML to dist/YYYY/<slug>.html
      const outDir = path.join(distRoot, year);
      await ensureDir(outDir);
      const outPath = path.join(outDir, `${slug}.html`);
      await fs.writeFile(outPath, html, 'utf8');
    }
  }

  // Optional: sort posts by date desc when valid YYYY-MM-DD
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const postsJsonPath = path.join(distRoot, 'posts.json');
  await fs.writeFile(postsJsonPath, JSON.stringify({ posts }, null, 2), 'utf8');

  console.log(`Built ${posts.length} post entries -> ${path.relative(root, postsJsonPath)}`);
  console.log(`Copied ${totalImagesCopied} image(s) to dist/images/<year>`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
