const core = require('@actions/core');
const github = require('@actions/github');
const { readdirSync } = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function getRootDir() {
  return execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
}

function getStacks(root, roots) {
  return roots.flatMap(r => readdirSync(path.join(root, r), 'utf-8').map(x => path.join(r, x)));
}

function getTargetRef() {
  return github.context.eventName === 'pull_request'
    ? process.env.GITHUB_BASE_REF
    : process.env.GITHUB_REF_NAME;
}

function getModifiedFiles(target) {
  const diff = execSync(`git diff --name-only origin/${target}`, { encoding: 'utf-8' }).trim();
  return !diff ? [] : diff.split(os.EOL);
}

function getModifiedStacks(files, roots) {
  return files.map(x => x.split(path.sep))
    .filter(x => x.length > 2) // Only look at directories
    .filter(x => roots.includes(x[0]))
    .map(x => path.join(x[0], x[1]))
    .filter((x, i, a) => a.indexOf(x) === i); // Distinct
}

function getNodeStacks(root, stacks) {
  return stacks.filter(
    x => readdirSync(path.join(root, x), 'utf-8')
      .some(x => /package.*\.json/g.test(x))
  );
}

const root = getRootDir();
const roots = ['apps', 'clusters', 'infra'];
const stacks = getStacks(root, roots);
const nodeStacks = getNodeStacks(root, stacks);
const target = getTargetRef();
const files = getModifiedFiles(target);
const modified = getModifiedStacks(files, roots);
const isPush = github.context.eventName === 'push';
const nodeUpdate = files.some(x => x.includes('.nvmrc'));
const workflowUpdate = files.some(x => /\.github\/(workflows|actions)/g.test(x))
const override = isPush || workflowUpdate;

console.log(`Using root:        ${root}`);
console.log('All stacks:        ', stacks);
console.log('Node stacks:       ', nodeStacks);
console.log(`Using target ref:  origin/${target}`);
console.log(`Found ${files.length} changed files:`, files);
console.log('Modified stacks:   ', modified);

if (override) console.log('Override reasons: ', { isPush, workflowUpdate });
if (nodeUpdate) console.log('Node appears to have been updated');

stacks.forEach(stack => {
  const result = modified.includes(stack)
    || (nodeUpdate && nodeStacks.includes(stack))
    || override;

  const name = stack.split(path.sep)[1];
  console.log('Setting output: ', name, result);
  core.setOutput(name, result);
});
