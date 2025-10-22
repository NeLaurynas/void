// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

const homeLink = document.querySelector('#homeLink');
homeLink.setAttribute('data-text', homeLink.textContent.trim());

const glitchOnce = () => {
	let n = rand(5, 9), on = false;

	const tick = () => {
		if (n-- <= 0) return homeLink.classList.remove('glitch');
		on = !on;
		homeLink.classList.toggle('glitch', on);
		setTimeout(tick, on ? rand(25, 70) : rand(40, 110));
	};

	tick();
};

export function glitchLoop() {
	setTimeout(() => {
		glitchOnce();
		glitchLoop();
	}, rand(1000, 9000));
};
