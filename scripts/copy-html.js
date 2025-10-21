import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

async function main() {
  const root = process.cwd();
  const srcPath = path.join(root, 'src', 'blog.html');
  const outDir = path.join(root, 'dist');
  const outPath = path.join(outDir, 'blog.html');

  await mkdir(outDir, { recursive: true });
  let html = await readFile(srcPath, 'utf8');

  await writeFile(outPath, html, 'utf8');
  console.log('Copied src/blog.html -> dist/blog.html');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
