// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

// Extract post metadata from a list/link element
export function getMetaFromLink(link) {
  const header = link.querySelector('.post-title').textContent;
  const subheader = link.querySelector('.post-sub').textContent;
  const date = link.querySelector('.post-date').textContent;
  return { header, subheader, date };
}

// Derive the year from meta or list view
export function deriveYear(id, meta) {
  let year = (meta && meta.date ? meta.date.slice(0, 4) : '') || '';
  if (!year) {
    const link = document.querySelector(`.post-link[data-post="${id}"]`);
    if (link) {
      const date = link.querySelector('.post-date').textContent;
      if (date) year = date.slice(0, 4);
    }
  }
  return year;
}

