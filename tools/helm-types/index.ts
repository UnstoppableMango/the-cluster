import * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import * as process from 'node:child_process';

const root = process.execSync(
  'git rev-parse --show-toplevel',
  { encoding: 'utf-8' },
).trimEnd();

const cacheDir = path.join(root, 'tools', 'helm-types', '.cache');

const remotes: [string, string][] = [
  ['nginx-ingress', 'https://raw.githubusercontent.com/nginxinc/kubernetes-ingress/v3.4.0/charts/nginx-ingress/values.schema.json'],
  ['k8s-definitions', 'https://raw.githubusercontent.com/nginxinc/kubernetes-json-schema/master/v1.28.0/_definitions.json'],
];

const input: [string, string][] = [
  ['filebrowser', path.join(root, 'charts', 'filebrowser', 'values.schema.json')],
  // ['deemix', path.join(root, 'charts', 'deemix', 'values.schema.json')],
  ['nginxIngress', path.join(cacheDir, 'nginx-ingress', 'values.schema.json')],
  ['k8sDefinitions', path.join(cacheDir, 'k8s-definitions', '_definitions.json')],
];

async function sync(name: string, url: string): Promise<void> {
  console.log('Fetching from: ', url);
  const data = await fetch(url).then(x => x.text());
  const outDir = path.join(cacheDir, name);
  console.log('Using outDir: ', outDir);

  if (!fs.existsSync(outDir)) {
    await fsp.mkdir(outDir);
  }

  const outFile = path.join(outDir, path.basename(url));
  console.log('Writing to: ', outFile);
  await fsp.writeFile(outFile, data);
}

async function sanitize(name: string, file: string): Promise<void> {
  console.log('Reading: ', file);
  const data = await fsp.readFile(file, 'utf-8');
  console.log('Parsing: ', file);
  const obj = JSON.parse(data);

  // In case the author forgot the top-level type
  obj.type = 'object';

  if (name === 'k8sDefinitions') {
    obj['$id'] = 'https://raw.githubusercontent.com/nginxinc/kubernetes-json-schema/master/v1.28.0/_definitions.json';
  }

  const newData = JSON.stringify(obj, null, 2);
  const result = `export const ${name} = ${newData} as const;\n`;
  const fileName = path.basename(file);
  console.log('Using filename: ', fileName);
  const outFileName = `${name}.${fileName}.ts`;
  console.log('Using outFileName: ', outFileName);
  const outFile = path.join(root, 'lib', 'nodejs', 'helm', 'schemas', outFileName);
  console.log('Using outFile: ', outFile);
  console.log('Writing result...');
  await fsp.writeFile(outFile, result);
}

async function main() {
  if (!fs.existsSync(cacheDir)) {
    await fsp.mkdir(cacheDir);
  }

  await Promise.all(remotes.map(r => sync(...r)));
  await Promise.all(input.map(i => sanitize(...i)));
}

main();
