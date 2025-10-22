// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';

function escapeHtml(s) {
    return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function renderList(posts) {
    return posts.map(p => `		<article class="post-card">
				<a href="/${escapeHtml(p.year || '')}/${escapeHtml(p.slug)}" class="post-link" data-post="${escapeHtml(p.slug)}">
					<h2 class="post-title">${escapeHtml(p.header || '')}</h2>
					<p class="post-sub">${escapeHtml(p.subheader || '')}</p>
					<time class="post-date">${escapeHtml(p.date || '')}</time>
				</a>
			</article>`).join('\n');
}

async function main() {
	const root = process.cwd();
	const srcPath = path.join(root, 'src', 'blog.html');
	const outDir = path.join(root, 'dist');
	const outPath = path.join(outDir, 'blog.html');

	await mkdir(outDir, {recursive: true});
	let html = await readFile(srcPath, 'utf8');

	// If we have posts metadata, replace the list view contents
	try {
		const postsJson = JSON.parse(await readFile(path.join(outDir, 'posts.json'), 'utf8'));
		const listHtml = renderList(Array.isArray(postsJson.posts) ? postsJson.posts : []);
		html = html.replace(
			/<section id="list-view" class="list-view">[\s\S]*?<\/section>/,
			`<section id="list-view" class="list-view">\n${listHtml}\n\t</section>`
		);
	} catch (e) {
		// No posts.json yet or parse error — leave template list as-is
	}

	await writeFile(outPath, html, 'utf8');
	console.log('Copied src/blog.html -> dist/blog.html');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
