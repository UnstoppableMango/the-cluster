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
    const source = fs.readFileSync(path.join(crdDir, file), { encoding: 'utf-8' });
    const data = yaml.parse(source, (k, v) => {
        return typeof v === 'object' && k === 'default' ? undefined : v;
    });
    fs.writeFileSync(path.join(outDir, file), yaml.stringify(data));
});

// yaml.parseAllDocuments(crdYaml).forEach((parsedKubeResource, i) => {
//     const data = yaml.parse(parsedKubeResource.toString(), (k, v) => {
//         return typeof v === 'object' && k === 'default' ? undefined : v;
//     });
//     fs.writeFileSync(path, yaml.stringify(data));
// });
