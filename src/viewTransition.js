// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

let disableOnce = false;
let isInitialLoad = true;

// Suppress the next view transition (used for browser history gestures).
export function suppressNextViewTransition() {
    disableOnce = true;
}

// Mark that the first render finished; subsequent navigations may animate
export function markInitialLoadComplete() {
    isInitialLoad = false;
}

export function withVT(run, {before, after} = {}) {
    before && before();

    const shouldAnimate = !!document.startViewTransition && !disableOnce && !isInitialLoad;
    // Reset after checking so it applies to a single transition only
    disableOnce = false;

    if (shouldAnimate) {
        const vt = document.startViewTransition(run);
        vt.finished.finally(() => after && after());
    } else {
        run();
        after && after();
    }
}
