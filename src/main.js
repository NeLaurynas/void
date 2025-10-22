// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {route} from './router.js';
import {glitchLoop} from "./glitch.js";
import {applyTheme} from "./theme.js";
import {closePost, openPost} from "./posts.js";

const homeLink = document.querySelector('#homeLink');
const listView = document.querySelector('#list-view');

function init() {
	glitchLoop();
	applyTheme();
	route();

	homeLink.addEventListener('click', (e) => {
		e.preventDefault();
		closePost(true);
	});

	listView.addEventListener('click', (e) => {
		const path = e.composedPath ? e.composedPath() : [];
		const anchor = (path.find((n) => n && n.matches && n.matches('a.post-link')) || (e.target && e.target.closest && e.target.closest('a.post-link'))) || null;
		if (!anchor || !listView.contains(anchor)) return;
		e.preventDefault();
		e.stopPropagation();
		openPost(anchor.getAttribute('data-post'), true, anchor);
	}, false);
}

init();
