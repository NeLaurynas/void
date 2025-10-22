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

// Cache housekeeping: keep theme, drop post caches after 24h
const CACHE_EPOCH_KEY = 'postsCacheCreatedAt';
function cleanExpiredPostCache() {
    try {
        const now = Date.now();
        const raw = localStorage.getItem(CACHE_EPOCH_KEY);
        if (!raw) {
            // First visit: record epoch, don't touch existing keys
            localStorage.setItem(CACHE_EPOCH_KEY, String(now));
            return;
        }
        const ts = Number(raw);
        if (!Number.isFinite(ts)) {
            localStorage.setItem(CACHE_EPOCH_KEY, String(now));
            return;
        }
        const ONE_DAY = 24 * 60 * 60 * 1000;
        if (now - ts > ONE_DAY) {
            const keep = new Set(['theme', CACHE_EPOCH_KEY]);
            const toDelete = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && !keep.has(k)) toDelete.push(k);
            }
            toDelete.forEach((k) => { try { localStorage.removeItem(k); } catch {} });
            // Start a new epoch after cleanup
            localStorage.setItem(CACHE_EPOCH_KEY, String(now));
        }
    } catch {}
}

function adjustHeaderOffset() {
    if (!headerEl) return;
    const h = headerEl.offsetHeight || 0;
    document.documentElement.style.setProperty('--header-h', h + 'px');
}

function init() {
    // Perform cache TTL housekeeping before rendering
    cleanExpiredPostCache();
    glitchLoop();
    applyTheme();
    route();
    adjustHeaderOffset();
    window.addEventListener('resize', adjustHeaderOffset);

	homeLink.addEventListener('click', (e) => {
		e.preventDefault();
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

    listView.addEventListener('click', (e) => {
        const anchor = findPostAnchor(e.target);
        if (!anchor || !listView.contains(anchor)) return;
        e.preventDefault();
        e.stopPropagation();
        const id = anchor.getAttribute('data-post');
        openPost(id, true, anchor, extractMeta(anchor));
    }, false);
}

init();
