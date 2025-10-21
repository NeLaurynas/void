export function withVT(run, {before, after} = {}) {
	before && before();

	if (document.startViewTransition) {
		const vt = document.startViewTransition(run);
		vt.finished.finally(() => after && after());
	} else {
		run();
		after && after();
	}
}
