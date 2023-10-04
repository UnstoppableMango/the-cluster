const core = require('@actions/core');
const github = require('@actions/github');
const { readdirSync } = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const root = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
console.log(`Using root:       ${root}`);

const stackDir = path.join(root, 'stacks');
console.log(`Using stackDir:   ${stackDir}`);

const stacks = readdirSync(stackDir, 'utf-8')
console.log('All stacks:      ', stacks);

const target = github.context.eventName === 'pull_request'
    ? process.env.GITHUB_BASE_REF
    : github.context.ref;

console.log(`Using target ref: ${target}`);

const diff = execSync(`git diff --name-only origin/${target}`, { encoding: 'utf-8' }).trim();

if (!diff) {
    console.log('No modified stacks');
    process.exit(0);
}

const files = diff.split(os.EOL);

console.log(`Found ${files.length} changed files:`, files);

const modified = files.map(x => x.split(path.sep))
    .filter(x => x.length > 2) // Only look at directories
    .filter(x => x[0] === 'stacks')
    .filter((x, i, a) => a.indexOf(x) === i) // Distinct
    .map(x => x[1]);

console.log('Modified stacks: ', modified);

const isPush = github.context.eventName === 'push';
const result = stacks.map(x => [x, modified.includes(x) || isPush]);
core.setOutput('stacks', Object.fromEntries(result));
