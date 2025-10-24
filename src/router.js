// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {closePost, openPost, preloadPost} from "./posts.js";
import {getMetaFromLink} from "./postMeta.js";

window.addEventListener('popstate', route);

export function route() {
	const rawPath = location.pathname.slice(1);
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
	const id = decodeURIComponent(slugEnc);

	// Ensure the slug exists in the list; otherwise, render home
	const link = document.querySelector(`.post-link[data-post="${id}"]`);
	if (!link) {
		closePost(false);
		history.replaceState({}, '', '/');
		return;
	}

	// If a year is present in the URL, it must match the post's actual year
	if (year) {
		const meta = getMetaFromLink(link);
		const actualYear = meta.date.slice(0, 4);
		if (actualYear !== year) {
			closePost(false);
			history.replaceState({}, '', '/');
			return;
		}
	}

	// If year is missing in URL, try to derive and replace for canonical path
	if (!year) {
		const date = link.querySelector('.post-date')?.textContent || '';
		const y = date ? date.slice(0, 4) : '';
		if (y) history.replaceState({}, '', `/${y}/${encodeURIComponent(id)}`);
	}

	const meta = getMetaFromLink(link);
	preloadPost(id, meta);
	openPost(id, false, link, meta);
};
