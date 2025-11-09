// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {closePost, openPost, preloadPost} from "./posts.js";
import {suppressNextViewTransition} from "./viewTransition.js";

function isIOS() {
    const ua = navigator.userAgent || navigator.vendor || '';
    const iOSDevice = /iP(hone|od|ad)/.test(navigator.platform || '');
    const iPadOS13Plus = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const iOSInUA = /iOS|iPhone|iPad|iPod/i.test(ua);
    return iOSDevice || iPadOS13Plus || iOSInUA;
}

function isAndroid() {
    const ua = navigator.userAgent || navigator.vendor || '';
    return /Android/i.test(ua);
}

function isMobileLike() {
    return isIOS() || isAndroid();
}
import {getMetaFromLink} from "./postMeta.js";

// When navigating via browser history (buttons or edge-swipe gestures),
// skip our View Transitions to avoid clashing with the system gesture.
window.addEventListener('popstate', () => {
    // Limit suppression to mobile platforms (iOS/Android) where edge-swipe gestures occur
    if (isMobileLike()) suppressNextViewTransition();
    route();
});

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
