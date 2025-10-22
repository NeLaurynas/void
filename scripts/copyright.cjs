// Copyright (C) 2025 Laurynas 'Deviltry' Ekekeke
// SPDX-License-Identifier: BSD-3-Clause

const copyright = `Copyright (C) ${(new Date().getFullYear())} Laurynas 'Deviltry' Ekekeke
SPDX-License-Identifier: BSD-3-Clause`;

const ignored_folders = [
	'bin',
	'obj',
	'node_modules',
	'dist',
	'zig-cache',
	'deps',
	'.elixir_ls',
	'_build',
	'mpack-amalgamation-', // - treats as wildcard
	'cmake-build-'
];

const ignored_files = [
	'copyright_insert.js',
	'beam.zig',
	'beam_mutex.zig',
	'erl_nif.zig',
	'translations.ts'
];

const configComments = [
	['.js', '//'],
	['.ts', '//'],
	['.tsx', '//'],
	['.scss', '//'],
	['.cs', '//'],
	['.sql', '--'],
	['.swift', '//'],
	['.ex', '#'],
	['.exs', '#'],
	['.zig', '//'],
	['.c', '//'],
	['.sh', '#'],
];

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
console.log(root);

const getTrackedFiles = () => {
	const out = execSync(`git -C "${root}" ls-files -z -- src scripts`, { encoding: 'buffer' });
	return out.toString('utf8').split('\0').filter(Boolean);
};

const isIgnoredFolderSegment = seg =>
	ignored_folders.some(pat => pat.endsWith('-') ? seg.startsWith(pat) : seg === pat);

const shouldSkip = rel => {
	const parts = rel.split(path.sep);
	const base = parts[parts.length - 1];

	if (parts.some(p => p.startsWith('.'))) return true;

	if (ignored_files.includes(base)) return true;

	if (parts.slice(0, -1).some(isIgnoredFolderSegment)) return true;

	return false;
};

const processFile = file => {
	let result = false;
	const ext = path.extname(file).toLowerCase();
	const pair = configComments.find(x => x[0] === ext);
	if (!pair) return result;

	const commentPrefix = pair[1];

	const fileContent = fs.readFileSync(file, 'utf8');
	const firstLine = fileContent.split('\n', 1)[0];

	if (firstLine.includes('Copyright (C)')) return result;

	result = true;
	const copyright_insert = processComment(commentPrefix);

	fs.writeFileSync(file, copyright_insert + '\n' + fileContent);

	return result;
};

const processComment = commentPrefix =>
	copyright.split('\n')
		.map(x => commentPrefix + ' ' + x)
		.reduce((acc, x) => acc + x + '\n', '');

for (const rel of getTrackedFiles()) {
	if (shouldSkip(rel)) continue;
	const abs = path.join(root, rel);

	try {
		const stat = fs.statSync(abs);
		if (!stat.isFile()) continue;
	} catch {
		continue;
	}

	const changed = processFile(abs);
	console.log(`File: ${rel} - ${changed ? '✅' : '©️'}`);
}
