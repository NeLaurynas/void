// Copyright (C) 2026 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

import {mkdir, rm} from 'node:fs/promises';
import path from 'node:path';

async function main() {
	const root = process.cwd();
	const distDir = path.join(root, 'dist');

	await rm(distDir, {recursive: true, force: true});
	await mkdir(distDir, {recursive: true});

	console.log('[clean] Recreated dist/');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

