// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

const toLight = document.querySelector('#toLight');
const toDark = document.querySelector('#toDark');
const prefersDark = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
toLight.addEventListener('click', () => setTheme('light'));
toDark.addEventListener('click', () => setTheme('dark'));

export function applyTheme(theme) {
	if (!theme) theme = localStorage.getItem('theme') ?? 'dark';

	const dark = theme === 'dark' || (theme === 'system' && prefersDark());

	document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
	toDark.setAttribute('aria-pressed', dark ? 'true' : 'false');
	toLight.setAttribute('aria-pressed', dark ? 'false' : 'true');
}

export function setTheme(theme) {
	localStorage.setItem('theme', theme);
	applyTheme(theme);
}
