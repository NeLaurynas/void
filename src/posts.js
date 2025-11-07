// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {withVT} from "./viewTransition.js";
import {deriveYear} from "./postMeta.js";

const detailView = document.querySelector('#detail-view');
const listView = document.querySelector('#list-view');
const listHeading = document.querySelector('.list-title');
const backLink = document.querySelector('#backLink');

// Cache in browser localStorage (id -> HTML)

function ensureDetailArticle(id, meta) {
	let target = document.querySelector(`article.post-detail[data-post="${id}"]`);
	if (target) return target;

	target = document.createElement('article');

	target.id = `post-${id}`;
	target.className = 'post-detail';
	target.setAttribute('data-post', id);
	target.hidden = true;
	target.setAttribute('aria-hidden', 'true');

	const header = meta.header;
	const subheader = meta.subheader;
	const date = meta.date;

	target.innerHTML = `
        <h1 class="post-title">${header}</h1>
        <p class="post-sub">${subheader}</p>
        <p class="post-meta"><time>${date}</time></p>
        <div class="content"><p data-not-loaded>Įrašas kraunamas...</p></div>
    `;
	detailView.appendChild(target);
	return target;
}

const show = (el) => {
	el.hidden = false;
	el.setAttribute('aria-hidden', 'false');
};
const hide = (el) => {
	el.hidden = true;
	el.setAttribute('aria-hidden', 'true');
};

function clearVTTitles() {
	document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title'));
}

// Transform fetched HTML so that only the first two images keep `src`.
function deferImagesInHtml(html, keep = 2) {
	try {
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		let count = 0;
		const imgs = [...doc.querySelectorAll('img')];
		for (const img of imgs) {
			if (!img.hasAttribute('src')) continue;
			if (count < keep) {
				count++;
				continue;
			}
			const src = img.getAttribute('src');
			if (!src) continue;
			img.setAttribute('data-src', src);
			img.removeAttribute('src');
		}
		return doc.body.innerHTML;
	} catch {
		return html;
	}
}

// When the post is opened, replace data-src back to src to load remaining images.
function activateDeferredImages(root) {
	try {
		root.querySelectorAll('img[data-src]').forEach((img) => {
			const src = img.getAttribute('data-src');
			if (src) {
				img.setAttribute('src', src);
				img.removeAttribute('data-src');
			}
		});
	} catch {
		// ignore
	}
}

export function openPost(id, push, sourceLink, meta) {
	// Find preloaded article; if missing, create as fallback to avoid empty detail
	let target = document.querySelector(`article.post-detail[data-post="${id}"]`) || null;
	if (!target) target = ensureDetailArticle(id, meta);

	if (push) {
		// Prefer canonical /year/slug when we can infer the year
		const year = deriveYear(id, meta);
		const newPath = year ? `/${year}/${encodeURIComponent(id)}` : `/${encodeURIComponent(id)}`;
		history.pushState({}, '', newPath);
	}

	withVT(() => {
		hide(listView);
		hide(listHeading);
		show(detailView);
		backLink && show(backLink);
		detailView.querySelectorAll('article.post-detail').forEach((el) => {
			el.hidden = el !== target;
		});

		const newTitle = target.querySelector('.post-title');
		newTitle.classList.add('vt-title');
	}, {
		before: () => {
			const sourceTitle = sourceLink.querySelector('.post-title');
			window.scrollTo(0, 0);
			clearVTTitles();
			sourceTitle.classList.add('vt-title');
		}, after: () => {
			clearVTTitles();
		},
	});

	// If cached mutated HTML exists and the content is still placeholder, inject it now.
	const content = target.querySelector('.content');
	const cached = localStorage.getItem(id);
	if (content && cached && content.querySelector('[data-not-loaded]')) {
		content.innerHTML = cached;
	}
	// Ensure remaining images start loading once opened.
	activateDeferredImages(target);
}

export function preloadPost(id, meta) {
	// Ensure DOM shell exists to accept content
	const target = ensureDetailArticle(id, meta);
	const content = target.querySelector('.content');

	// Load from cache immediately if present
	const cached = localStorage.getItem(id);
	if (cached !== null) {
		if (content.querySelector('[data-not-loaded]')) content.innerHTML = cached;
		// If already open, load deferred images now
		if (!target.hidden) activateDeferredImages(target);
		return;
	}

	// Avoid duplicate fetches
	if (content.hasAttribute('data-loading')) return;
	content.setAttribute('data-loading', 'true');

	// Compute URL; if date missing, attempt to derive from list DOM
	const year = deriveYear(id, meta);
	if (!year) {
		content.removeAttribute('data-loading');
		return;
	}
	const url = `/${year}/${id}.html`;
	fetch(url)
		.then((r) => {
			if (!r.ok) throw new Error(`Failed to load post ${id}`);
			return r.text();
		})
		.then((html) => {
			// Replace img src with data-src for all but the first two
			const mutated = deferImagesInHtml(html, 2);
			localStorage.setItem(id, mutated);
			content.innerHTML = mutated;
			// If the post is currently open, immediately load deferred images
			if (!target.hidden) activateDeferredImages(target);
		})
		.catch(() => {
			const current = decodeURIComponent((location.pathname || '').slice(1));
			if (current === id) {
				history.replaceState({}, '', '/');
				closePost(false);
			}
		})
		.finally(() => {
			content.removeAttribute('data-loading');
		});
}

export function closePost(push) {
	if (push) history.pushState({}, '', '/');

	const openDetail = detailView.querySelector('article.post-detail:not([hidden])');
	const openId = openDetail ? openDetail.getAttribute('data-post') : null;
	const listLink = openId ? document.querySelector(`.post-link[data-post="${openId}"]`) : null;
	const listTitleEl = listLink ? listLink.querySelector('.post-title') : null;
	const detailTitle = openDetail ? openDetail.querySelector('.post-title') : null;

	withVT(
		() => {
			show(listView);
			show(listHeading);
			hide(detailView);
			backLink && hide(backLink);
			listTitleEl && listTitleEl.classList.add('vt-title');
		},
		{
			before: () => {
				clearVTTitles();
				detailTitle && detailTitle.classList.add('vt-title');
			},
			after: () => clearVTTitles(),
		}
	);
};
