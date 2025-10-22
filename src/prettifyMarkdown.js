// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

// Apply small presentational refinements to rendered Markdown/HTML
// - Remove first-line indent for single-line paragraphs (not inside blockquotes)

const FIXED_MARK = 'md-fixed';

function contentRoot(root) {
  return root.querySelector ? (root.querySelector('.content') || root) : root;
}

export function isPrettified(root) {
  const scope = contentRoot(root);
  const first = scope.firstChild;
  return !!(first && first.nodeType === Node.COMMENT_NODE && String(first.nodeValue).includes(FIXED_MARK));
}

export function markPrettified(root) {
  const scope = contentRoot(root);
  if (!isPrettified(root)) scope.insertAdjacentHTML('afterbegin', `<!--${FIXED_MARK}-->`);
}

export function prettifyMarkdown(root) {
  const scope = contentRoot(root);
  const paras = scope.querySelectorAll('p');
  paras.forEach((p) => {
    if (p.closest('blockquote')) return;
    // Skip invisible paragraphs: measuring lines requires layout
    if (p.getClientRects().length === 0) return;
    const range = document.createRange();
    range.selectNodeContents(p);
    const rects = range.getClientRects();
    if (rects.length <= 1) p.classList.add('no-indent');
    else p.classList.remove('no-indent');
  });
  markPrettified(root);
}
