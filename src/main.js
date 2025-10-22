// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {route} from './router.js';
import {glitchLoop} from "./glitch.js";
import {applyTheme} from "./theme.js";
import {closePost, openPost, preloadPost} from "./posts.js";

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
    const maybePreload = (e) => {
        const path = e.composedPath ? e.composedPath() : [];
        const anchor = (path.find((n) => n && n.matches && n.matches('a.post-link')) || (e.target && e.target.closest && e.target.closest('a.post-link'))) || null;
        if (!anchor || !listView.contains(anchor)) return;
        const id = anchor.getAttribute('data-post');
        const header = anchor.querySelector('.post-title')?.textContent || '';
        const subheader = anchor.querySelector('.post-sub')?.textContent || '';
        const date = anchor.querySelector('.post-date')?.textContent || '';
        preloadPost(id, { header, subheader, date });
    };

    listView.addEventListener('mouseover', maybePreload, false);
    listView.addEventListener('focusin', maybePreload, false);

    listView.addEventListener('click', (e) => {
        const path = e.composedPath ? e.composedPath() : [];
        const anchor = (path.find((n) => n && n.matches && n.matches('a.post-link')) || (e.target && e.target.closest && e.target.closest('a.post-link'))) || null;
        if (!anchor || !listView.contains(anchor)) return;
        e.preventDefault();
        e.stopPropagation();
        const id = anchor.getAttribute('data-post');
        const header = anchor.querySelector('.post-title').textContent;
        const subheader = anchor.querySelector('.post-sub').textContent;
        const date = anchor.querySelector('.post-date').textContent;
        openPost(id, true, anchor, { header, subheader, date });
    }, false);
}

init();
