// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

const HLJS_LIGHT_HREF = '/highlight-atom-one-light.css';
const HLJS_DARK_HREF = '/highlight-atom-one-dark.css';

const toLight = document.querySelector('#toLight');
const toDark = document.querySelector('#toDark');
const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

let hljsLink;

function applyHighlightTheme(dark) {
	try {
		const doc = document;
		if (!doc) return;
		if (!hljsLink) {
			hljsLink = doc.querySelector('link[data-hljs-theme]') || doc.createElement('link');
			if (!hljsLink.hasAttribute('data-hljs-theme')) {
				hljsLink.setAttribute('rel', 'stylesheet');
				hljsLink.setAttribute('data-hljs-theme', '1');
				doc.head.appendChild(hljsLink);
			}
		}
		const href = dark ? HLJS_DARK_HREF : HLJS_LIGHT_HREF;
		if (hljsLink.getAttribute('href') !== href) {
			hljsLink.setAttribute('href', href);
		}
	} catch {
		// ignore
	}
}

toLight.addEventListener('mousedown', (e) => {
	if (e.button !== 0 || e.ctrlKey || e.metaKey) return; // only plain left click
	setTheme('light');
});
toDark.addEventListener('mousedown', (e) => {
	if (e.button !== 0 || e.ctrlKey || e.metaKey) return; // only plain left click
	setTheme('dark');
});

export function applyTheme(theme) {
	if (!theme) theme = localStorage.getItem('theme');

	const dark =
		theme === 'dark' ||
		(!theme && prefersDark()) ||
		(theme === 'system' && prefersDark());

	document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
	toDark.setAttribute('aria-pressed', dark ? 'true' : 'false');
	toLight.setAttribute('aria-pressed', dark ? 'false' : 'true');
	applyHighlightTheme(dark);
}

export function setTheme(theme) {
	localStorage.setItem('theme', theme);

	if (document.startViewTransition) {
		withVT(() => applyTheme(theme));
		return;
	}

	// Fallback: temporarily enable color transitions
	document.documentElement.classList.add('theme-animating');
	applyTheme(theme);
	setTimeout(() => {
		document.documentElement.classList.remove('theme-animating');
	}, 220);
}

import {withVT} from "./viewTransition.js";
