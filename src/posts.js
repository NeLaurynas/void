// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {withVT} from "./viewTransition.js";

const detailView = document.querySelector('#detail-view');
const listView = document.querySelector('#list-view');
const listHeading = document.querySelector('.list-title');

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

	// Allow missing meta; attempt to derive from list, else fallback
	const fallbackFromList = document.querySelector(`.post-link[data-post="${id}"]`);
	const header = meta && meta.header ? meta.header : (fallbackFromList ? (fallbackFromList.querySelector('.post-title')?.textContent || '') : '');
	const subheader = meta && meta.subheader ? meta.subheader : (fallbackFromList ? (fallbackFromList.querySelector('.post-sub')?.textContent || '') : '');
	const date = meta && meta.date ? meta.date : (fallbackFromList ? (fallbackFromList.querySelector('.post-date')?.textContent || '') : '');

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

export function openPost(id, push, sourceLink, meta) {
	// Find preloaded article; if missing, create as fallback to avoid empty detail
	let target = document.querySelector(`article.post-detail[data-post="${id}"]`) || null;
	if (!target) target = ensureDetailArticle(id, meta);

	if (push) {
		// Prefer canonical /year/slug when we can infer the year
		let year = (meta && meta.date ? meta.date.slice(0, 4) : '') || '';
		if (!year) {
			const fallbackFromList = document.querySelector(`.post-link[data-post="${id}"]`);
			const date = fallbackFromList ? (fallbackFromList.querySelector('.post-date')?.textContent || '') : '';
			if (date) year = date.slice(0, 4);
		}
		const newPath = year ? `/${year}/${encodeURIComponent(id)}` : `/${encodeURIComponent(id)}`;
		history.pushState({}, '', newPath);
	}

	withVT(() => {
		hide(listView);
		if (listHeading) hide(listHeading);
		show(detailView);
		detailView.querySelectorAll('article.post-detail').forEach((el) => {
			el.hidden = el !== target;
		});

		const newTitle = target ? target.querySelector('.post-title') : null;
		newTitle && newTitle.classList.add('vt-title');
	}, {
		before: () => {
			const sourceTitle = sourceLink ? sourceLink.querySelector('.post-title') : null;
			document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title'));
			sourceTitle && sourceTitle.classList.add('vt-title');
		}, after: () => document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title')),
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
    let year = (meta && meta.date ? meta.date.slice(0, 4) : '') || '';
    if (!year) {
        const fallbackFromList = document.querySelector(`.post-link[data-post="${id}"]`);
        const date = fallbackFromList ? (fallbackFromList.querySelector('.post-date')?.textContent || '') : '';
        if (date) year = date.slice(0,4);
    }
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
		})
		.catch(() => {
			// If this was a direct navigation to an unknown/failed slug, go home
			const raw = (location.pathname || '').slice(1);
			let current = raw; try { current = decodeURIComponent(raw); } catch {}
			if (current === id) {
				try { history.replaceState({}, '', '/'); } catch {}
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
			if (listHeading) show(listHeading);
			hide(detailView);
			listTitleEl && listTitleEl.classList.add('vt-title');
		},
		{
			before: () => {
				document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title'));
				detailTitle && detailTitle.classList.add('vt-title');
			},
			after: () => document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title')),
		}
	);
};
