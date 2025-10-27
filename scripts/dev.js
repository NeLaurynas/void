// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import http from 'node:http';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {watch, statSync, createReadStream} from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const port = Number(process.env.PORT || 3000);

const clients = new Set();
let reloadTimer = null;

function broadcastReload() {
	clearTimeout(reloadTimer);
	reloadTimer = setTimeout(() => {
		for (const res of clients) {
			try {
				res.write('data: reload\n\n');
			} catch {
			}
		}
	}, 50);
}

async function copyHtmlDev() {
	await mkdir(distDir, {recursive: true});
	const srcPath = path.join(root, 'src', 'blog.html');
	const outPath = path.join(distDir, 'blog.html');
	let html = await readFile(srcPath, 'utf8');

	// Replace list-view with posts
	function escapeHtml(s) {
		return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
	}

	function renderList(posts) {
		return posts.map(p => `\t\t<article class="post-card">\n\t\t\t<a href="/${escapeHtml(p.year || '')}/${escapeHtml(p.slug)}" class="post-link" data-post="${escapeHtml(p.slug)}">\n\t\t\t\t<h2 class="post-title">${escapeHtml(p.header || '')}</h2>\n\t\t\t\t<p class="post-sub">${escapeHtml(p.subheader || '')}</p>\n\t\t\t\t<time class="post-date">${escapeHtml(p.date || '')}</time>\n\t\t\t</a>\n\t\t</article>`).join('\n');
	}

	try {
		const posts = JSON.parse(await readFile(path.join(distDir, 'posts.json'), 'utf8')).posts || [];
		const listHtml = renderList(posts);
		html = html.replace(/<section id="list-view" class="list-view">[\s\S]*?<\/section>/, `<section id="list-view" class="list-view">\n${listHtml}\n\t</section>`);
	} catch {
	}
	// Adjust asset paths to be relative to /dist
	html = html.replaceAll('../dist/', './').replaceAll('./dist/', './');
	// Inject a tiny live reload client
	const snippet = `\n<script>(function(){try{var es=new EventSource('/__livereload');es.onmessage=function(e){if(e.data==='reload') location.reload()};es.onerror=function(){es.close();setTimeout(function(){location.reload()},1000)}}catch(e){}})();</script>\n`;
	if (!/__livereload/.test(html)) {
		html = html.replace(/<\/body>/i, `${snippet}</body>`);
	}
	await writeFile(outPath, html, 'utf8');
	console.log('[dev] Copied blog.html -> dist/blog.html (with live reload)');
}

function contentType(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case '.html':
			return 'text/html; charset=utf-8';
		case '.js':
			return 'application/javascript; charset=utf-8';
		case '.css':
			return 'text/css; charset=utf-8';
		case '.map':
			return 'application/json; charset=utf-8';
		case '.svg':
			return 'image/svg+xml';
		case '.png':
			return 'image/png';
		case '.jpg':
		case '.jpeg':
			return 'image/jpeg';
		case '.gif':
			return 'image/gif';
		case '.avif':
			return 'image/avif';
		default:
			return 'application/octet-stream';
	}
}

function startServer() {
	const server = http.createServer(async (req, res) => {
		try {
			if (!req.url) return res.end();
			if (req.method !== 'GET' && req.method !== 'HEAD') {
				res.statusCode = 405;
				return res.end('Method Not Allowed');
			}

			if (req.url === '/__livereload') {
				res.writeHead(200, {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Connection': 'keep-alive',
					'Access-Control-Allow-Origin': '*',
				});
				res.write(': ok\n\n');
				clients.add(res);
				req.on('close', () => clients.delete(res));
				return;
			}

			let reqPath = decodeURIComponent((req.url.split('?')[0] || '/'));
			const ext = path.extname(reqPath).toLowerCase();
			const isStatic = ext === '.css' || ext === '.js' || ext === '.avif' || ext === '.html';

			if (isStatic) {
				const rel = reqPath.startsWith('/') ? reqPath.slice(1) : reqPath;
				const filePath = path.join(distDir, rel);
				// Prevent path traversal
				if (!filePath.startsWith(distDir)) {
					res.statusCode = 403;
					return res.end('Forbidden');
				}
				try {
					const st = statSync(filePath);
					if (st.isDirectory()) {
						res.statusCode = 403;
						return res.end('Forbidden');
					}
					res.setHeader('Content-Type', contentType(filePath));
					if (req.method === 'HEAD') return res.end();
					return createReadStream(filePath).pipe(res);
				} catch {
					res.statusCode = 404;
					return res.end('Not Found');
				}
			}

			// Fallback: always serve blog.html for any non-asset path
			const blogPath = path.join(distDir, 'blog.html');
			try {
				const st = statSync(blogPath);
				if (!st.isFile()) throw new Error('not a file');
			} catch {
				res.statusCode = 404;
				return res.end('Not Found');
			}
			res.setHeader('Content-Type', 'text/html; charset=utf-8');
			if (req.method === 'HEAD') return res.end();
			createReadStream(blogPath).pipe(res);
		} catch (err) {
			res.statusCode = 500;
			res.end('Internal Server Error');
		}
	});

	server.listen(port, () => {
		console.log(`[dev] Server http://localhost:${port}`);
	});
}

async function main() {
    await mkdir(distDir, {recursive: true});

    // JS/CSS bundle watch using Bun's bundler for parity with production
    const startWatch = (args, label) => {
        const proc = spawn('bun', ['build', ...args, '--watch'], {
            cwd: root,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        proc.stdout.on('data', (c) => process.stdout.write(`[${label}] ${c}`));
        proc.stderr.on('data', (c) => process.stderr.write(`[${label}] ${c}`));
        proc.on('exit', (code) => {
            console.log(`[${label}] exited with code ${code}`);
        });
        return proc;
    };

    const jsProc = startWatch(['src/main.js', '--bundle', '--minify', '--outfile=dist/bundle.js'], 'bun:js');
    const cssProc = startWatch(['src/blog.css', '--minify', '--outfile=dist/blog.css'], 'bun:css');

	// HTML copy + watch
	await copyHtmlDev();
	let htmlTimer = null;
	watch(path.join(root, 'src', 'blog.html'), {persistent: true}, () => {
		clearTimeout(htmlTimer);
		htmlTimer = setTimeout(async () => {
			await copyHtmlDev();
			broadcastReload();
		}, 50);
	});

	// Watch dist for rebuilds and notify clients
	let distTimer = null;
	watch(distDir, {persistent: true}, () => {
		clearTimeout(distTimer);
		distTimer = setTimeout(broadcastReload, 50);
	});

	startServer();

    const shutdown = async () => {
        console.log('\n[dev] Shutting down…');
        try { jsProc.kill('SIGTERM'); } catch {}
        try { cssProc.kill('SIGTERM'); } catch {}
        process.exit(0);
    };
	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
