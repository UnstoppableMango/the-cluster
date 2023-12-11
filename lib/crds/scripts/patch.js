import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import yaml from 'yaml';

const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
const projDir = path.join(root, 'lib', 'crds');
const outDir = path.join(projDir, 'manifests');
const crdDir = path.join(root, 'infra', 'crds', 'manifests');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
fs.readdirSync(crdDir, { encoding: 'utf-8' }).forEach(file => {
    // https://github.com/pulumi/crd2pulumi/issues/68#issuecomment-1272454502
    const source = fs.readFileSync(path.join(crdDir, file), { encoding: 'utf-8' });
    const data = yaml.parse(source, (k, v) => {
        return typeof v === 'object' && k === 'default' ? undefined : v;
    });
    fs.writeFileSync(path.join(outDir, file), yaml.stringify(data));
});
