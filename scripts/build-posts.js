// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {promises as fs} from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import implicitFigures from 'markdown-it-implicit-figures';

/**
 * Build script: scans posts/YYYY/*.md and produces dist/posts.json
 * with a list of posts, renders each post to HTML into dist/YYYY/<slug>.html,
 * and copies images from posts/YYYY/images/* to dist/images/YYYY.
 */

async function ensureDir(dir) {
	await fs.mkdir(dir, {recursive: true});
}

async function pathExists(p) {
	try {
		await fs.stat(p);
		return true;
	} catch {
		return false;
	}
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
	const meta = {slug: '', header: '', subheader: '', date: '', tags: []};
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

	if (!(await pathExists(srcImages))) return {copied: 0};

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
	return {copied};
}

// No paragraph-indent post-processing; render Markdown as-is

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
		const {copied} = await copyImages(yearDir, distRoot);
		totalImagesCopied += copied;

		// Prepare markdown renderer for this year
		const md = new MarkdownIt({html: false, linkify: true, typographer: false});
		md.use(implicitFigures, {figcaption: true});
		// Ensure links open in a new tab from generated HTML
		md.renderer.rules.link_open = (tokens, i, options, env, self) => {
			const token = tokens[i];
			token.attrSet('target', '_blank');
			token.attrSet('rel', 'noopener');
			return self.renderToken(tokens, i, options);
		};
		const escape = md.utils.escapeHtml;

		function toYouTubeEmbed(url) {
			// Accept: https://www.youtube.com/watch?v=ID[&t=90s], https://youtu.be/ID[?t=90], https://www.youtube.com/shorts/ID
			// Return: https://www.youtube.com/embed/ID[?start=90]
			try {
				const u = new URL(url);
				const host = u.hostname.toLowerCase();
				let id = '';
				if (host.endsWith('youtube.com')) {
					if (u.pathname === '/watch') id = u.searchParams.get('v') || '';
					else if (u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2] || '';
				} else if (host === 'youtu.be') {
					id = (u.pathname.split('/')[1] || '').trim();
				}
				if (!id) return null;

				// Derive start seconds from t or start query
				let start = 0;
				const t = u.searchParams.get('t') || u.searchParams.get('start');
				if (t) {
					// "90" or "1m30s" → seconds
					const m = String(t).match(/^(?:(\d+)m)?(?:(\d+)s)?$|^(\d+)$/i);
					if (m) {
						if (m[3]) start = parseInt(m[3], 10) || 0; // plain seconds
						else start = (parseInt(m[1] || '0', 10) * 60) + (parseInt(m[2] || '0', 10));
					}
				}
				const q = start > 0 ? `?start=${start}` : '';
				return `https://www.youtube.com/embed/${id}${q}`;
			} catch {
				return null;
			}
		}

		md.renderer.rules.image = (tokens, i) => {
			const t = tokens[i];
			let src = t.attrGet('src') || '';
			const alt = t.content || t.attrGet('alt') || '';
			let title = (t.attrGet('title') || '').trim();

			// Images from local folder are rewritten to /images/<year>/...
			if (src.startsWith('images/')) {
				src = `/images/${year}/${src.slice(7)}`;
			}

			// Interpret simple sizing hints in the title:
			//  - "small" or "half" => width: 50%
			//  - "w=NN%" or "width=NN%" / px => explicit width
			let classes = [];
			let widthStyle = '';

            if (/\b(small|half)\b/i.test(title)) {
                classes.push('is-small');
                title = title.replace(/\b(small|half)\b/ig, '').trim();
            }
			const m = title.match(/\b(?:w|width)\s*=\s*(\d{1,3})(%|px)?\b/i);
			if (m) {
				const unit = m[2] || '%';
				widthStyle = `width:${m[1]}${unit};`;
				title = title.replace(m[0], '').trim();
			}

			// If the source is a YouTube URL, render an iframe instead of <img>
			const yt = toYouTubeEmbed(src);
			const classAttr = classes.length ? ` class=\"${classes.join(' ')}\"` : '';
			const styleAttr = widthStyle ? ` style=\"${widthStyle}\"` : '';

			if (yt) {
				const titleAttr = alt ? ` title=\"${escape(alt)}\"` : '';
				return `<iframe src=\"${escape(yt)}\"${classAttr}${styleAttr}${titleAttr} frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe>`;
			}

			// Default: regular image
			const titleAttr = title ? ` title=\"${escape(title)}\"` : '';
			const imgHtml = `<img src=\"${escape(src)}\" alt=\"${escape(alt)}\"${classAttr}${styleAttr}${titleAttr}>`;

			// If image is already wrapped in a link (e.g., Markdown [![]]() ),
			// avoid nesting anchors. Detect common pattern link_open -> image -> link_close.
			const prev = tokens[i - 1];
			const next = tokens[i + 1];
			const alreadyLinked = prev && prev.type === 'link_open' && next && next.type === 'link_close';
			if (alreadyLinked) return imgHtml;

			// Wrap image in a link to itself that opens in a new tab
			const href = escape(src);
			return `<a href=\"${href}\" target=\"_blank\" rel=\"noopener\">${imgHtml}</a>`;
		};

		for (const file of files) {
			if (file === '.DS_Store') continue;
			const filePath = path.join(yearDir, file);
			const content = await fs.readFile(filePath, 'utf8');
			const meta = parseMetadata(content);

			// Skip drafts: if date is explicitly set to "draft", do not publish
			if (String(meta.date || '').trim().toLowerCase() === 'draft') {
				continue;
			}

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
			let html = md.render(body);

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
	await fs.writeFile(postsJsonPath, JSON.stringify({posts}, null, 2), 'utf8');

	console.log(`Built ${posts.length} post entries -> ${path.relative(root, postsJsonPath)}`);
	console.log(`Copied ${totalImagesCopied} image(s) to dist/images/<year>`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
