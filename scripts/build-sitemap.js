// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_SITE_URL = 'https://void.gorgut.eu';

function escapeXml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function getSiteUrl() {
	const configured = String(process.env.SITE_URL || DEFAULT_SITE_URL).trim();
	const siteUrl = new URL(configured);

	if (siteUrl.protocol !== 'http:' && siteUrl.protocol !== 'https:') {
		throw new Error('SITE_URL must use http or https');
	}

	return new URL('/', siteUrl);
}

function isIsoDate(value) {
	return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function renderUrl(siteUrl, pathname, lastmod = '') {
	const location = new URL(pathname, siteUrl).href;
	const lastmodXml = isIsoDate(lastmod) ? `\n\t\t<lastmod>${escapeXml(lastmod)}</lastmod>` : '';
	return `\t<url>\n\t\t<loc>${escapeXml(location)}</loc>${lastmodXml}\n\t</url>`;
}

async function main() {
	const root = process.cwd();
	const distDir = path.join(root, 'dist');
	const postsPath = path.join(distDir, 'posts.json');
	const sitemapPath = path.join(distDir, 'sitemap.xml');
	const {posts = []} = JSON.parse(await readFile(postsPath, 'utf8'));
	const siteUrl = getSiteUrl();
	const publishedPosts = Array.isArray(posts) ? posts : [];
	const newestDate = publishedPosts.map((post) => post.date).find(isIsoDate) || '';
	const urls = [
		renderUrl(siteUrl, '/', newestDate),
		...publishedPosts.map((post) => renderUrl(siteUrl, post.path || `/${post.year}/${post.slug}`, post.date)),
	];
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

	await writeFile(sitemapPath, sitemap, 'utf8');
	console.log(`Built ${urls.length} sitemap entries -> ${path.relative(root, sitemapPath)}`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
