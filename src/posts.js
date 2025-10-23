// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {withVT} from "./viewTransition.js";
import {prettifyMarkdown, isPrettified} from "./prettifyMarkdown.js";
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
		// After making article visible, apply prettifying once and update cache
		const content = target.querySelector('.content');
		if (!isPrettified(target)) {
			prettifyMarkdown(target);
			try {
				localStorage.setItem(id, content.innerHTML);
			} catch {
			}
		}
	}, {
		before: () => {
			const sourceTitle = sourceLink.querySelector('.post-title');
			try {
				window.scrollTo(0, 0);
			} catch {
			}
			clearVTTitles();
			sourceTitle.classList.add('vt-title');
		}, after: () => {
			clearVTTitles();
		},
	});
}

export function preloadPost(id, meta) {
	// Ensure DOM shell exists to accept content
	const target = ensureDetailArticle(id, meta);
	const content = target.querySelector('.content');

	// Load from cache immediately if present
	const cached = localStorage.getItem(id);
	if (cached !== null) {
		if (content.querySelector('[data-not-loaded]')) {
			content.innerHTML = cached;
		}
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
			localStorage.setItem(id, html);
			content.innerHTML = html;
			// If article is visible, prettify and update cache to fixed version
			const article = content.closest('article.post-detail');
			if (article && !article.hidden && !isPrettified(article)) {
				prettifyMarkdown(article);
				try {
					localStorage.setItem(id, content.innerHTML);
				} catch {
				}
			}
		})
		.catch(() => {
			// If this was a direct navigation to an unknown/failed slug, go home
			const raw = (location.pathname || '').slice(1);
			let current = raw;
			try {
				current = decodeURIComponent(raw);
			} catch {
			}
			if (current === id) {
				try {
					history.replaceState({}, '', '/');
				} catch {
				}
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
