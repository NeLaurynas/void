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
    target.innerHTML = `
        <h1 class="post-title">${meta.header}</h1>
        <p class="post-sub">${meta.subheader}</p>
        <p class="post-meta"><time>${meta.date}</time></p>
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
        newTitle.classList.add('vt-title');
    }, {
        before: () => {
            const sourceTitle = sourceLink.querySelector('.post-title');
            document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title'));
            sourceTitle.classList.add('vt-title');
        }, after: () => document.querySelectorAll('.vt-title').forEach((el) => el.classList.remove('vt-title')),
    });

    if (localStorage.getItem(id) !== null) {
        const cached = localStorage.getItem(id);
        const content = target.querySelector('.content');
        content.innerHTML = cached;
        return;
    }

    const year = meta.date.slice(0, 4);
    const url = `/${year}/${id}.html`;
    fetch(url)
        .then((r) => r.text())
        .then((html) => {
            localStorage.setItem(id, html);
            const content = target.querySelector('.content');
            content.innerHTML = html;
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
