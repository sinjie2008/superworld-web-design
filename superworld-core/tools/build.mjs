import { mkdir } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { build } from 'esbuild';
import * as sass from 'sass';

process.chdir(new URL('..', import.meta.url).pathname);
await mkdir('assets/dist', { recursive: true });
await build({
  entryPoints: ['assets/js/index.js'],
  outfile: 'assets/dist/parts.js',
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: true,
  sourcemap: false,
});
const css = sass.compile('assets/scss/catalog.scss', { style: 'compressed' });
writeFileSync('assets/dist/catalog.css', css.css + '\n');
console.log('Built Superworld component assets.');
