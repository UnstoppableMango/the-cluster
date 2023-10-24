const core = require('@actions/core');
const github = require('@actions/github');
const { readdirSync } = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

function getRootDir() {
  return execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
}

function getClusterDir(root) {
  return path.join(root, 'clusters');
}

function getAppDir(root) {
  return path.join(root, 'apps');
}

function getClusters(clusterDir) {
  return readdirSync(clusterDir, 'utf-8').map(x => path.join('clusters', x));
}

function getApps(appDir) {
  return readdirSync(appDir, 'utf-8').map(x => path.join('apps', x));
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

function getModifiedStacks(files) {
  return files.map(x => x.split(path.sep))
    .filter(x => x.length > 2) // Only look at directories
    .filter(x => ['clusters', 'apps'].includes(x[0]))
    .map(x => x[1])
    .filter((x, i, a) => a.indexOf(x) === i); // Distinct
}

function getNodeStacks(root, stacks) {
  return stacks
    .filter(
      x => path.join(root, x)
        .readdirSync(x, 'utf-8')
        .some(x => /package.*\.json/g.test(x))
    )
    .map(x => x.split(path.sep)[1]);
}

const root = getRootDir();
const clustersDir = getClusterDir(root);
const appsDir = getAppDir(root);
const clusters = getClusters(clustersDir);
const apps = getApps(appsDir);
const stacks = [...clusters, ...apps];
const nodeStacks = getNodeStacks(root, stacks);
const target = getTargetRef();
const files = getModifiedFiles(target);
const modified = getModifiedStacks(files);
const isPush = github.context.eventName === 'push';
const nodeUpdate = files.some(x => x.includes('.nvmrc'));
const workflowUpdate = files.some(x => /\.github\/(workflows|actions)/g.test(x))
const override = isPush || workflowUpdate;

console.log(`Using root:        ${root}`);
console.log(`Using clustersDir: ${clustersDir}`);
console.log(`Using appsDir:     ${appsDir}`);
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

  console.log('Setting output: ', stack, result);
  core.setOutput(stack, result);
});
