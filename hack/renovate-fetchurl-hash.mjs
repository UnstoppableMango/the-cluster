// Renovate postUpgradeTask: the nix regex manager in .github/renovate.json
// bumps a fetchurl URL but cannot recompute its hash. Rewrite the `hash` that
// follows each bumped URL with the SRI hash of the new release asset.
//
// Usage: node hack/renovate-fetchurl-hash.mjs <file> <owner/repo> <version>

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const [file, depName, version] = process.argv.slice(2);
if (!file || !depName || !version) {
	console.error('usage: renovate-fetchurl-hash.mjs <file> <owner/repo> <version>');
	process.exit(2);
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const prefix = `https://github.com/${depName}/releases/download/${version}/`;
const urlRe = new RegExp(`"(${escape(prefix)}[^"]+)"`, 'g');
const hashRe = /hash = "sha256-[A-Za-z0-9+/=]+"/;

const src = await readFile(file, 'utf8');
let out = '';
let pos = 0;
let count = 0;

for (const match of src.matchAll(urlRe)) {
	const url = match[1];
	const afterUrl = match.index + match[0].length;
	const hashMatch = hashRe.exec(src.slice(afterUrl));
	if (!hashMatch) {
		throw new Error(`no hash after ${url} in ${file}`);
	}

	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`GET ${url}: ${res.status} ${res.statusText}`);
	}
	const digest = createHash('sha256')
		.update(Buffer.from(await res.arrayBuffer()))
		.digest('base64');

	const hashStart = afterUrl + hashMatch.index;
	out += src.slice(pos, hashStart) + `hash = "sha256-${digest}"`;
	pos = hashStart + hashMatch[0].length;
	count++;
	console.log(`${url} sha256-${digest}`);
}

if (count === 0) {
	throw new Error(`no ${prefix} URL in ${file}`);
}

await writeFile(file, out + src.slice(pos));
