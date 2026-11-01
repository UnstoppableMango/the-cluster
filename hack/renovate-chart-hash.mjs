// Renovate postUpgradeTask: nix/crds.nix downloads some Flux HelmRelease
// charts as fixed-output derivations, reading repo, chart and version from the
// manifests but carrying each chartHash itself. Renovate bumps the version, so
// recompute the matching chartHash here.
//
// chartHash is the NAR hash of `helm pull --untar`'s output (kubelib's
// downloadHelmChart), not the sha256 of the .tgz, so this expands the archive
// the way helm does and hashes the result the way nix does. The Renovate image
// has neither helm nor nix.
//
// Usage: node hack/renovate-chart-hash.mjs [<helm-release.yml>...]
//
// Each argument is a HelmRelease under infrastructure/controllers/<namespace>/;
// a namespace crds.nix does not download is skipped. With no arguments, every
// chart crds.nix downloads is recomputed.

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, posix } from 'node:path';
import { pathToFileURL } from 'node:url';
import { gunzipSync } from 'node:zlib';

const CRDS = 'nix/crds.nix';

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const unquote = (s) => s.trim().replace(/^(['"])(.*)\1$/, '$2');
const indentOf = (line) => line.length - line.trimStart().length;

// The url and digest of one chart version in a helm repository's index.yaml.
// A line scanner rather than a YAML parser, since the Renovate image gives a
// repository script no node_modules; it reads the block-style YAML that helm
// and chart-releaser write.
export function chartUrl(index, repo, chart, version) {
	const lines = index.split('\n');
	const start = lines.findIndex((l) => /^entries:\s*$/.test(l));
	const keyRe = new RegExp(`^(\\s+)${escape(chart)}:\\s*$`);
	const key = lines.findIndex((l, i) => i > start && keyRe.test(l));
	if (start < 0 || key < 0) {
		throw new Error(`no ${chart} ${version} in ${repo}/index.yaml`);
	}

	const keyIndent = indentOf(lines[key]);
	const items = [];
	let itemIndent;
	let item;
	let inUrls = false;
	for (const line of lines.slice(key + 1)) {
		if (!line.trim()) continue;
		let indent = indentOf(line);
		let content = line.slice(indent);
		if (indent < keyIndent || (indent === keyIndent && !content.startsWith('- '))) break;

		itemIndent ??= indent;
		if (indent === itemIndent && content.startsWith('- ')) {
			item = { urls: [] };
			items.push(item);
			inUrls = false;
			indent += 2;
			content = content.slice(2);
		}

		const fieldIndent = itemIndent + 2;
		if (inUrls && indent >= fieldIndent && content.startsWith('- ')) {
			item.urls.push(unquote(content.slice(2)));
		} else if (indent === fieldIndent) {
			const m = /^([\w-]+):(.*)$/.exec(content);
			inUrls = m?.[1] === 'urls';
			if (m && (m[1] === 'version' || m[1] === 'digest')) {
				item[m[1]] = unquote(m[2]);
			}
		}
	}

	const bare = (v) => v?.replace(/^v/, '');
	const found =
		items.find((i) => i.version === version) ?? items.find((i) => bare(i.version) === bare(version));
	if (!found?.urls.length) {
		throw new Error(`no ${chart} ${version} in ${repo}/index.yaml`);
	}

	return {
		url: new URL(found.urls[0], repo.replace(/\/*$/, '/')).href,
		digest: found.digest,
	};
}

function tarNumber(field) {
	if (field[0] & 0x80) {
		let n = BigInt(field[0] & 0x7f);
		for (const b of field.subarray(1)) n = (n << 8n) | BigInt(b);
		return Number(n);
	}
	const s = field.toString('latin1').replace(/[\0 ]+$/, '').trim();
	return s ? parseInt(s, 8) : 0;
}

const cstring = (b) => {
	const end = b.indexOf(0);
	return b.subarray(0, end < 0 ? b.length : end).toString('utf8');
};

function paxRecords(data) {
	const records = {};
	let off = 0;
	while (off < data.length) {
		const space = data.indexOf(0x20, off);
		if (space < 0) break;
		const len = parseInt(data.subarray(off, space).toString(), 10);
		if (!(len > 0)) break;
		const record = data.subarray(space + 1, off + len - 1).toString('utf8');
		const eq = record.indexOf('=');
		records[record.slice(0, eq)] = record.slice(eq + 1);
		off += len;
	}
	return records;
}

// The files of a chart archive, keyed by path inside the chart directory, as
// helm's archive.LoadArchiveFiles and chartutil.Expand lay them out on disk:
// directories and extension headers skipped, the first path component
// stripped, a leading UTF-8 BOM trimmed, and a later entry overwriting an
// earlier one at the same path. Every entry, links included, becomes a regular
// file holding the entry's data.
export function chartFiles(tgz) {
	const buf = gunzipSync(tgz);
	const files = new Map();
	let pax = {};
	let longName;
	let off = 0;
	while (off + 512 <= buf.length) {
		const header = buf.subarray(off, off + 512);
		if (header.every((b) => b === 0)) break;

		const type = header[156] === 0 ? '0' : String.fromCharCode(header[156]);
		const extension = 'xgLK'.includes(type);
		const size = !extension && pax.size ? Number(pax.size) : tarNumber(header.subarray(124, 136));
		const data = buf.subarray(off + 512, off + 512 + size);
		off += 512 + Math.ceil(size / 512) * 512;

		if (type === 'x') {
			pax = paxRecords(data);
			continue;
		}
		if (type === 'L') {
			longName = cstring(data);
			continue;
		}
		if (extension) continue;

		let name = pax.path ?? longName;
		if (name === undefined) {
			name = cstring(header.subarray(0, 100));
			if (header.subarray(257, 262).toString('latin1') === 'ustar') {
				const prefix = cstring(header.subarray(345, 500));
				if (prefix) name = `${prefix}/${name}`;
			}
		}
		pax = {};
		longName = undefined;
		if (type === '5' || name.endsWith('/')) continue;

		const delimiter = name.includes('\\') ? '\\' : '/';
		const rest = name.split(delimiter).slice(1).join('/');
		const path = posix.normalize(rest).replace(/\/$/, '');
		if (rest.startsWith('/') || path === '.' || path.startsWith('..')) {
			throw new Error(`chart archive entry ${name} is outside the chart directory`);
		}

		const bom = Buffer.from([0xef, 0xbb, 0xbf]);
		files.set(path, Buffer.from(data.subarray(0, 3).equals(bom) ? data.subarray(3) : data));
	}

	if (files.size === 0) {
		throw new Error('no files in chart archive');
	}
	return files;
}

// The SRI sha256 of the NAR serialisation of a directory holding `files`, each
// a regular, non-executable file: what `nix hash path` prints for it.
export function narHash(files) {
	const root = new Map();
	for (const [path, data] of files) {
		const parts = path.split('/');
		let dir = root;
		for (const part of parts.slice(0, -1)) {
			if (!(dir.get(part) instanceof Map)) dir.set(part, new Map());
			dir = dir.get(part);
		}
		dir.set(parts.at(-1), data);
	}

	const hash = createHash('sha256');
	const str = (s) => {
		const b = Buffer.isBuffer(s) ? s : Buffer.from(s);
		const len = Buffer.alloc(8);
		len.writeBigUInt64LE(BigInt(b.length));
		hash.update(len);
		hash.update(b);
		hash.update(Buffer.alloc((8 - (b.length % 8)) % 8));
	};
	const node = (n) => {
		str('(');
		str('type');
		if (n instanceof Map) {
			str('directory');
			const names = [...n.keys()].sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
			for (const name of names) {
				str('entry');
				str('(');
				str('name');
				str(name);
				str('node');
				node(n.get(name));
				str(')');
			}
		} else {
			str('regular');
			str('contents');
			str(n);
		}
		str(')');
	};

	str('nix-archive-1');
	node(root);
	return `sha256-${hash.digest('base64')}`;
}

const chartBlocks = (src) => src.matchAll(/downloadFluxHelmChart\s*\{[^{}]*\}/g);
const namespaceOf = (block) => /releaseNamespace = "([^"]+)";/.exec(block)?.[1];

// crds.nix with the chartHash of the chart downloaded from releaseNamespace
// replaced, or null when crds.nix downloads no chart from there.
export function rewriteChartHash(src, releaseNamespace, hash) {
	for (const m of chartBlocks(src)) {
		if (namespaceOf(m[0]) !== releaseNamespace) continue;
		const block = m[0].replace(/chartHash = "[^"]*";/, `chartHash = "${hash}";`);
		return src.slice(0, m.index) + block + src.slice(m.index + m[0].length);
	}
	return null;
}

// The first `key: value` line, as crds.nix's readField reads it.
async function readField(path, key) {
	const text = await readFile(path, 'utf8');
	const m = new RegExp(`^\\s*${key}: ([^\\s#]+)`, 'm').exec(text);
	if (!m) throw new Error(`no ${key} in ${path}`);
	return m[1];
}

async function get(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`GET ${url}: ${res.status} ${res.statusText}`);
	return Buffer.from(await res.arrayBuffer());
}

async function computeChartHash(releaseNamespace) {
	const dir = `infrastructure/controllers/${releaseNamespace}`;
	const repo = await readField(`${dir}/helm-repository.yml`, 'url');
	const chart = await readField(`${dir}/helm-release.yml`, 'chart');
	const version = await readField(`${dir}/helm-release.yml`, 'version');
	if (repo.startsWith('oci://')) {
		throw new Error(`${dir}: OCI repositories are not supported`);
	}

	const index = (await get(`${repo.replace(/\/*$/, '')}/index.yaml`)).toString('utf8');
	const { url, digest } = chartUrl(index, repo, chart, version);
	const tgz = await get(url);
	if (digest) {
		const actual = createHash('sha256').update(tgz).digest('hex');
		if (actual !== digest) throw new Error(`${url}: sha256 ${actual}, index says ${digest}`);
	}

	const hash = narHash(chartFiles(tgz));
	console.log(`${releaseNamespace}: ${chart} ${version} ${hash}`);
	return hash;
}

async function main(packageFiles) {
	let src = await readFile(CRDS, 'utf8');
	const namespaces = packageFiles.length
		? packageFiles.map((f) => basename(dirname(f)))
		: [...chartBlocks(src)].map((m) => namespaceOf(m[0])).filter(Boolean);

	for (const ns of namespaces) {
		if (rewriteChartHash(src, ns, '') === null) {
			console.log(`${ns}: not downloaded by ${CRDS}, skipping`);
			continue;
		}
		src = rewriteChartHash(src, ns, await computeChartHash(ns));
	}

	await writeFile(CRDS, src);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	await main(process.argv.slice(2));
}
