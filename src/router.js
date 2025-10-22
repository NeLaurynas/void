// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {closePost, openPost, preloadPost} from "./posts.js";

window.addEventListener('popstate', route);
window.addEventListener('change', route);

export function route() {
	const rawPath = (location.pathname || '').slice(1);
	if (!rawPath) {
		closePost(false);
		return;
	}

	// Support both "/slug" and "/year/slug". Canonicalize to "/year/slug" when possible.
	let year = '';
	let slugEnc = rawPath;
	const parts = rawPath.split('/');
	if (parts.length >= 2 && /^\d{4}$/.test(parts[0])) {
		year = parts[0];
		slugEnc = parts.slice(1).join('/');
	}
	let id = slugEnc;
	try { id = decodeURIComponent(slugEnc); } catch {}

	// Ensure the slug exists in the list; otherwise, render home
	const link = document.querySelector(`.post-link[data-post="${id}"]`);
	if (!link) {
		closePost(false);
		if (location.pathname !== '/') history.replaceState({}, '', '/');
		return;
	}

	// If year is missing in URL, try to derive and replace for canonical path
	if (!year) {
		const date = link.querySelector('.post-date')?.textContent || '';
		const y = date ? date.slice(0, 4) : '';
		if (y) {
			try { history.replaceState({}, '', `/${y}/${encodeURIComponent(id)}`); } catch {}
		}
	}

	const header = link.querySelector('.post-title')?.textContent || '';
	const subheader = link.querySelector('.post-sub')?.textContent || '';
	const date = link.querySelector('.post-date')?.textContent || '';
	preloadPost(id, { header, subheader, date });
	openPost(id, false, link, { header, subheader, date });
};
