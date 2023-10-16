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
    : process.env.GITHUB_REF_NAME;

console.log(`Using target ref: origin/${target}`);

const diff = execSync(`git diff --name-only origin/${target}`, { encoding: 'utf-8' }).trim();
const files = !diff ? [] : diff.split(os.EOL);

console.log(`Found ${files.length} changed files:`, files);

const modified = files.map(x => x.split(path.sep))
    .filter(x => x.length > 2) // Only look at directories
    .filter(x => x[0] === 'stacks')
    .map(x => x[1])
    .filter((x, i, a) => a.indexOf(x) === i); // Distinct

console.log('Modified stacks: ', modified);

const isPush = github.context.eventName === 'push';
stacks.forEach(stack => {
  const result = modified.includes(stack) || isPush;
  console.log('Setting output: ', stack, result);
  core.setOutput(stack, result);
});
