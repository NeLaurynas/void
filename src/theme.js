// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

const toLight = document.querySelector('#toLight');
const toDark = document.querySelector('#toDark');
const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
toLight.addEventListener('mousedown', (e) => {
	if (e.button !== 0 || e.ctrlKey || e.metaKey) return; // only plain left click
	setTheme('light');
});
toDark.addEventListener('mousedown', (e) => {
	if (e.button !== 0 || e.ctrlKey || e.metaKey) return; // only plain left click
	setTheme('dark');
});

export function applyTheme(theme) {
	if (!theme) theme = localStorage.getItem('theme') ?? 'dark';

	const dark = theme === 'dark' || (theme === 'system' && prefersDark());

	document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
	toDark.setAttribute('aria-pressed', dark ? 'true' : 'false');
	toLight.setAttribute('aria-pressed', dark ? 'false' : 'true');
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
