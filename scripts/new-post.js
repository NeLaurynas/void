// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listDir(dir) {
  try { return await fs.readdir(dir); } catch (e) { if (e && e.code === 'ENOENT') return []; throw e; }
}

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function slugify(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-]+/gu, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '');
}

async function nextIndex(dir) {
  const files = await listDir(dir);
  let max = 0;
  for (const f of files) {
    const m = f.match(/^(\d+)_.*\.md$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

async function main() {
  const rl = readline.createInterface({ input, output });
  try {
    const year = String(new Date().getFullYear());
    const postsYearDir = path.join(process.cwd(), 'posts', year);
    await ensureDir(postsYearDir);

    const header = (await rl.question('Header: ')).trim();
    const defaultSlug = header ? slugify(header) : '';
    const slug = (await rl.question(`Slug${defaultSlug ? ` [${defaultSlug}]` : ''}: `)).trim() || defaultSlug;
    const subheader = (await rl.question('Subheader (optional): ')).trim();
    const tags = (await rl.question('Tags (comma-separated, optional): ')).trim();

    if (!slug) {
      console.error('Slug is required. Aborting.');
      process.exit(1);
    }

    const idx = await nextIndex(postsYearDir);
    const fileName = `${idx}_${slug}.md`;
    const filePath = path.join(postsYearDir, fileName);
    const date = todayISO();

    const meta = [
      `slug: ${slug}`,
      `header: ${header}`,
      `subheader: ${subheader}`,
      `date: ${date}`,
      `tags: ${tags}`,
      '',
      `hello world`,
      '',
    ].join('\n');

    await fs.writeFile(filePath, meta, 'utf8');
    console.log(`Created: ${path.relative(process.cwd(), filePath)}`);

    // Try to open in VS Code if available
    try {
      const p = spawn('code', [filePath], { stdio: 'ignore', detached: true });
      p.unref();
    } catch (e) {
      // no-op if code is not available
    }
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
