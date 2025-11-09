// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

let disableOnce = false;

// Suppress the next view transition (used for browser history gestures).
export function suppressNextViewTransition() {
    disableOnce = true;
}

export function withVT(run, {before, after} = {}) {
    before && before();

    const shouldAnimate = !!document.startViewTransition && !disableOnce;
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
