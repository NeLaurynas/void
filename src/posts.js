// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {withVT} from "./viewTransition.js";

const detailView = document.querySelector('#detail-view');
const listView = document.querySelector('#list-view');
const listHeading = document.querySelector('.list-title');

// Simple in-memory cache for loaded HTML content per post id
const postHtmlCache = new Map(); // id -> string (HTML)

function getMetaFromList(id) {
    const link = document.querySelector(`.post-link[data-post="${CSS.escape(id)}"]`);
    if (!link) return null;
    const header = (link.querySelector('.post-title') || {}).textContent || '';
    const subheader = (link.querySelector('.post-sub') || {}).textContent || '';
    const date = (link.querySelector('.post-date') || {}).textContent || '';
    return { header, subheader, date };
}

function deriveYear(meta) {
    const d = meta && typeof meta.date === 'string' ? meta.date.trim() : '';
    const m = /^([0-9]{4})/.exec(d);
    return m ? m[1] : '';
}

function ensureDetailArticle(id, meta) {
    let target = document.querySelector(`article.post-detail[data-post="${CSS.escape(id)}"]`);
    if (target) return target;
    const safe = (s) => (s == null ? '' : String(s));
    const header = safe(meta && meta.header);
    const subheader = safe(meta && meta.subheader);
    const date = safe(meta && meta.date);

    target = document.createElement('article');
    target.id = `post-${id}`;
    target.className = 'post-detail';
    target.setAttribute('data-post', id);
    target.hidden = true;
    target.setAttribute('aria-hidden', 'true');
    target.innerHTML = `
        <h1 class="post-title">${header}</h1>
        <p class="post-sub">${subheader}</p>
        <p class="post-meta"><time>${date}</time></p>
        <div class="content"><p>Įrašas kraunamas...</p></div>
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
    // meta can include: { header, subheader, date }
    meta = meta || getMetaFromList(id) || { header: '', subheader: '', date: '' };

    // Ensure article exists with skeleton content
    const target = ensureDetailArticle(id, meta);

    if (push) history.pushState({}, '', `/${id}`);

    withVT(() => {
        hide(listView);
        if (listHeading) hide(listHeading);
        show(detailView);
        detailView.querySelectorAll('article.post-detail').forEach((el) => {
            el.hidden = el !== target;
        });

        const newTitle = target.querySelector('.post-title');
        newTitle && newTitle.classList.add('vt-title');
    }, {
        before: () => {
            const sourceTitle = sourceLink ? sourceLink.querySelector('.post-title') : null;
            document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title'));
            sourceTitle && sourceTitle.classList.add('vt-title');
        }, after: () => document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title')),
    });

    // 1. check local cache and inject
    if (postHtmlCache.has(id)) {
        const cached = postHtmlCache.get(id);
        const content = target.querySelector('.content');
        if (content) content.innerHTML = cached;
        return;
    }

    // 4. load html from server
    const year = deriveYear(meta);
    if (!year) return; // cannot resolve path without year
    const url = `/${year}/${id}.html`;
    fetch(url)
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((html) => {
            // 5. replace loading paragraph and 6. store in cache
            postHtmlCache.set(id, html);
            const content = target.querySelector('.content');
            if (content) content.innerHTML = html;
        })
        .catch(() => {
            const content = target.querySelector('.content');
            if (content) content.innerHTML = '<p>Nepavyko įkelti įrašo.</p>';
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
