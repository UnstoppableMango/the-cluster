// Run with: node --test 'hack/*.test.mjs'
// `nix flake check` runs these too, as checks.hack-scripts.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gzipSync } from 'node:zlib';

import { chartFiles, chartUrl, narHash, rewriteChartHash } from './renovate-chart-hash.mjs';

// A minimal ustar writer, enough to build the archives `helm package` produces.
function tarEntry(name, data = '', type = '0') {
	const body = Buffer.from(data);
	const header = Buffer.alloc(512);
	header.write(name, 0, 100);
	header.write('0000644\0', 100);
	header.write('0000000\0', 108);
	header.write('0000000\0', 116);
	header.write(body.length.toString(8).padStart(11, '0') + '\0', 124);
	header.write('00000000000\0', 136);
	header.write(' '.repeat(8), 148);
	header.write(type, 156);
	header.write('ustar\0', 257);
	header.write('00', 263);
	let sum = 0;
	for (const b of header) sum += b;
	header.write(sum.toString(8).padStart(6, '0') + '\0 ', 148);
	const padded = Buffer.alloc(Math.ceil(body.length / 512) * 512);
	body.copy(padded);
	return Buffer.concat([header, padded]);
}

function paxEntry(records) {
	const body = Object.entries(records)
		.map(([k, v]) => {
			const rest = ` ${k}=${v}\n`;
			let len = rest.length;
			while (`${len}${rest}`.length !== len) len = `${len}${rest}`.length;
			return `${len}${rest}`;
		})
		.join('');
	return tarEntry('PaxHeaders/x', body, 'x');
}

const tgz = (...entries) => gzipSync(Buffer.concat([...entries, Buffer.alloc(1024)]));

test('narHash matches `nix hash path` of the expanded chart', () => {
	const files = new Map([
		['values.yaml', Buffer.from('')],
		['templates/a.yaml', Buffer.from('a: 1\n')],
		['Chart.yaml', Buffer.from('name: x\n')],
		['b/z', Buffer.from('z')],
	]);
	// `nix hash path` of that tree, every file mode 0644 as helm writes them.
	assert.equal(narHash(files), 'sha256-cgajgASpvDLbxtdutEbdOUQsIGRSocc+3uUGZsr4/18=');
});

test('chartFiles expands an archive the way `helm pull --untar` does', () => {
	const long = 'templates/' + 'x'.repeat(120) + '.yaml';
	const files = chartFiles(
		tgz(
			tarEntry('mychart/', '', '5'),
			tarEntry('mychart/Chart.yaml', '﻿name: mychart\n'),
			tarEntry('mychart/templates/', '', '5'),
			tarEntry('mychart/templates/a.yaml', 'a: 1\n'),
			paxEntry({ path: `mychart/${long}` }),
			tarEntry('mychart/templates/truncated', 'long\n'),
			tarEntry('pax_global_header', 'ignored', 'g'),
			tarEntry('mychart/templates/a.yaml', 'a: 2\n'),
		),
	);

	assert.deepEqual([...files.keys()].sort(), ['Chart.yaml', 'templates/a.yaml', long].sort());
	assert.equal(files.get('Chart.yaml').toString(), 'name: mychart\n', 'strips the UTF-8 BOM');
	assert.equal(files.get('templates/a.yaml').toString(), 'a: 2\n', 'a later entry overwrites');
	assert.equal(files.get(long).toString(), 'long\n');
});

const index = `apiVersion: v1
entries:
  other:
  - name: other
    urls:
    - https://example.com/other-1.0.0.tgz
    version: 1.0.0
  mychart:
  - apiVersion: v2
    digest: abc
    keywords:
    - operator
    maintainers:
    - email: a@example.com
      name: a
    name: mychart
    urls:
    - charts/mychart-v1.2.0.tgz
    version: v1.2.0
  - name: mychart
    urls:
    - https://cdn.example.com/mychart-1.1.0.tgz
    - https://mirror.example.com/mychart-1.1.0.tgz
    version: 1.1.0
generated: "2026-10-01T10:18:01Z"
`;

test('chartUrl finds the version in a helm repository index', () => {
	assert.deepEqual(chartUrl(index, 'https://charts.example.com', 'mychart', '1.1.0'), {
		url: 'https://cdn.example.com/mychart-1.1.0.tgz',
		digest: undefined,
	});
});

test('chartUrl resolves a relative URL against the repository', () => {
	assert.deepEqual(chartUrl(index, 'https://charts.example.com/stable', 'mychart', 'v1.2.0'), {
		url: 'https://charts.example.com/stable/charts/mychart-v1.2.0.tgz',
		digest: 'abc',
	});
});

test('chartUrl throws on a version the index does not hold', () => {
	assert.throws(() => chartUrl(index, 'https://charts.example.com', 'mychart', '9.9.9'), /mychart 9\.9\.9/);
	assert.throws(() => chartUrl(index, 'https://charts.example.com', 'other', '1.1.0'), /other 1\.1\.0/);
});

const crds = `
  a = kubelib.buildHelmChart {
    chart = downloadFluxHelmChart {
      releaseNamespace = "a-system";
      chartHash = "sha256-AAAA";
    };
  };

  b = kubelib.buildHelmChart {
    chart = downloadFluxHelmChart {
      chartHash = "sha256-BBBB";
      releaseNamespace = "b-system";
    };
  };
`;

test('rewriteChartHash rewrites the chartHash beside the namespace', () => {
	const out = rewriteChartHash(crds, 'a-system', 'sha256-NEW=');
	assert.equal(out, crds.replace('sha256-AAAA', 'sha256-NEW='));
	assert.equal(
		rewriteChartHash(crds, 'b-system', 'sha256-NEW='),
		crds.replace('sha256-BBBB', 'sha256-NEW='),
	);
});

test('rewriteChartHash returns null for a namespace crds.nix does not download', () => {
	assert.equal(rewriteChartHash(crds, 'c-system', 'sha256-NEW='), null);
});
