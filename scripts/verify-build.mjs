import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import config from '../astro.config.mjs';

const root = resolve('dist');
if (!existsSync(root)) throw new Error('Run npm run build first.');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
const pages = walk(root).filter(file => file.endsWith('.html'));
const errors = [];
const decode = value => value.replaceAll('&amp;', '&');
const routeFile = path => path.endsWith('/') ? join(root, path, 'index.html') : existsSync(join(root, path)) ? join(root, path) : join(root, path, 'index.html');
let checked = 0;
let clientBytes = 0;
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const path = file.slice(root.length).replaceAll('\\', '/').replace(/index\.html$/, '');
  const base = new URL(path, config.site);
  if ((html.match(/<h1(?:\s|>)/g) ?? []).length !== 1) errors.push(`${path}: expected one h1`);
  if (!html.includes('name="description"') || !html.includes('id="main"') || !html.includes('lang="en"')) errors.push(`${path}: missing document metadata or main landmark`);
  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
  if (scripts.length !== 2 || !scripts[0][1].includes('data-portfolio-script="theme-init"') || !scripts[1][1].includes('type="module"')) errors.push(`${path}: expected only theme initialization and the shared interaction module`);
  const bytes = scripts.reduce((total, script) => total + Buffer.byteLength(script[2]), 0);
  clientBytes = Math.max(clientBytes, bytes);
  if (bytes > 8192) errors.push(`${path}: client script budget exceeded (8 KiB)`);
  for (const match of html.matchAll(/<(a|img|video|source|link)\b[^>]*?\s(href|src)="([^"]+)"[^>]*>/g)) {
    const [, tag, , raw] = match;
    const url = new URL(decode(raw), base);
    if (url.origin !== base.origin) continue;
    const target = routeFile(decodeURIComponent(url.pathname));
    checked++;
    if (!existsSync(target)) { errors.push(`${path}: missing ${raw}`); continue; }
    if (tag === 'a' && url.hash) {
      const content = readFileSync(target, 'utf8');
      const id = decodeURIComponent(url.hash.slice(1));
      if (!content.includes(`id="${id}"`)) errors.push(`${path}: missing fragment ${raw}`);
    }
    if (tag === 'img' && !/\balt="[^"]*"/.test(match[0])) errors.push(`${path}: image missing alt text`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Verified ${pages.length} static pages and ${checked} local links/assets; ${clientBytes} bytes of client scripts per page (8 KiB budget).`);
