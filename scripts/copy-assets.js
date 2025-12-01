// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {promises as fs} from 'node:fs';
import path from 'node:path';

async function ensureDir(dir) {
  await fs.mkdir(dir, {recursive: true});
}

async function copyIfExists(src, dst) {
  try {
    const st = await fs.stat(src);
    if (!st.isFile()) return false;
  } catch {
    return false;
  }
  await ensureDir(path.dirname(dst));
  await fs.copyFile(src, dst);
  return true;
}

async function main() {
  const root = process.cwd();
  const dist = path.join(root, 'dist');
  await ensureDir(dist);

  const assets = [
    {src: path.join(root, 'src', 'favicon.svg'), dst: path.join(dist, 'favicon.svg')},
    {src: path.join(root, 'src', 'robots.txt'), dst: path.join(dist, 'robots.txt')},
  ];

  let copied = 0;
  for (const a of assets) {
    if (await copyIfExists(a.src, a.dst)) copied++;
  }

  // Try to copy highlight.js themes from node_modules if installed.
  const stylesRoot = path.join(root, 'node_modules', 'highlight.js', 'styles');
  const highlightStyles = [
    {name: 'atom-one-light', out: 'highlight-atom-one-light.css'},
    {name: 'atom-one-dark', out: 'highlight-atom-one-dark.css'},
  ];
  for (const style of highlightStyles) {
    const dest = path.join(dist, style.out);
    const candidates = [
      path.join(stylesRoot, `${style.name}.min.css`),
      path.join(stylesRoot, `${style.name}.css`),
    ];
    let ok = false;
    for (const src of candidates) {
      if (await copyIfExists(src, dest)) {
        copied++;
        ok = true;
        break;
      }
    }
    // If neither file exists, skip silently (user may not have installed highlight.js yet).
    if (!ok) continue;
  }

  console.log(`[build] Copied ${copied} asset(s) to dist`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
