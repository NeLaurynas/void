// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {closePost, openPost, preloadPost} from "./posts.js";

window.addEventListener('popstate', route);
window.addEventListener('change', route);

export function route() {
	const rawPath = (location.pathname || '').slice(1);
	let id = rawPath;
	try { id = decodeURIComponent(rawPath); } catch {}
	if (!id) {
		closePost(false);
		return;
	}

	// Ensure the slug exists in the list; otherwise, render home
	const link = document.querySelector(`.post-link[data-post="${id}"]`);
	if (!link) {
		closePost(false);
		if (location.pathname !== '/') history.replaceState({}, '', '/');
		return;
	}

	const header = link.querySelector('.post-title')?.textContent || '';
	const subheader = link.querySelector('.post-sub')?.textContent || '';
	const date = link.querySelector('.post-date')?.textContent || '';
	preloadPost(id, { header, subheader, date });
	openPost(id, false, link, { header, subheader, date });
};
