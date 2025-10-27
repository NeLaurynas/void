// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {route} from './router.js';
import {glitchLoop} from "./glitch.js";
import {applyTheme} from "./theme.js";
import {closePost, openPost, preloadPost} from "./posts.js";
import {getMetaFromLink} from "./postMeta.js";

const homeLink = document.querySelector('#homeLink');
const listView = document.querySelector('#list-view');
const headerEl = document.querySelector('.site-header');
const backLink = document.querySelector('#backLink');

// Cache housekeeping: keep theme, drop post caches after 24h
const CACHE_EPOCH_KEY = 'postsCacheCreatedAt';

function cleanExpiredPostCache() {
	const now = Date.now();
	const ts = Number(localStorage.getItem(CACHE_EPOCH_KEY) || 0);
	const ONE_DAY = 24 * 60 * 60 * 1000;
	if (!ts || now - ts > ONE_DAY) {
		const keep = new Set(['theme', CACHE_EPOCH_KEY]);
		const toDelete = [];
		for (let i = 0; i < localStorage.length; i++) {
			const k = localStorage.key(i);
			if (k && !keep.has(k)) toDelete.push(k);
		}
		toDelete.forEach((k) => localStorage.removeItem(k));
		localStorage.setItem(CACHE_EPOCH_KEY, String(now));
	}
}

function isLocalhost() {
    const h = (location.hostname || '').toLowerCase();
    return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

function clearAllCacheIfLocalhost() {
    if (!isLocalhost()) return;
    try {
        localStorage.clear();
    } catch {}
}

function adjustHeaderOffset() {
	const h = headerEl ? headerEl.offsetHeight : 0;
	document.documentElement.style.setProperty('--header-h', h + 'px');
}

function init() {
	// If running on localhost, clear all caches regardless
	clearAllCacheIfLocalhost();
	// Perform cache TTL housekeeping before rendering
	cleanExpiredPostCache();
	glitchLoop();
	applyTheme();
	route();
	adjustHeaderOffset();
	window.addEventListener('resize', adjustHeaderOffset);

    // Navigation controls: click preventDefault; mousedown triggers for snappier feel
    homeLink.addEventListener('click', (e) => e.preventDefault());
    homeLink.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || e.ctrlKey || e.metaKey) return; // only plain left click
        closePost(true);
    });
    backLink?.addEventListener('click', (e) => e.preventDefault());
    backLink?.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || e.ctrlKey || e.metaKey) return; // only plain left click
        closePost(true);
    });

	// Preload on hover/focus for instant open
	const findPostAnchor = (target) => target.closest('a.post-link');
	const extractMeta = (anchor) => getMetaFromLink(anchor);

	const maybePreload = (e) => {
		const anchor = findPostAnchor(e.target);
		if (!anchor || !listView.contains(anchor)) return;
		const id = anchor.getAttribute('data-post');
		preloadPost(id, extractMeta(anchor));
	};

	listView.addEventListener('mouseover', maybePreload, false);
	listView.addEventListener('focusin', maybePreload, false);

    // Cancel default click only for plain left-click on a post link;
    // allow ctrl/cmd/middle-click to use browser default (e.g., open in new tab)
    listView.addEventListener('click', (e) => {
        const anchor = findPostAnchor(e.target);
        if (!anchor || !listView.contains(anchor)) return;
        const hasModifier = e.ctrlKey || e.metaKey || e.altKey || e.shiftKey;
        const isPlainLeft = e.button === 0 && !hasModifier;
        if (isPlainLeft) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, false);
    listView.addEventListener('mousedown', (e) => {
        if (e.button !== 0 || e.ctrlKey || e.metaKey) return; // only plain left click
        const anchor = findPostAnchor(e.target);
        if (!anchor || !listView.contains(anchor)) return;
        const id = anchor.getAttribute('data-post');
        openPost(id, true, anchor, extractMeta(anchor));
    }, false);
}

init();
