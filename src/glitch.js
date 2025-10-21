const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

const homeLink = document.querySelector('#homeLink');

const glitchOnce = () => {
	if (!homeLink) return;
	homeLink.setAttribute('data-text', homeLink.textContent.trim());
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
