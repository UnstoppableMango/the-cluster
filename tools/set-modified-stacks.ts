import * as exec from 'child_process';
import * as util from 'util';

const execAsync = util.promisify(exec.exec);

(async () => {
  const diffCommand = [
    'git', 'diff', '--name-only', 'origin/main',
  ].join(' ');

  const changedFiles = await execAsync(diffCommand).then(x => x.stdout.split('\n'));

  const triggerAllFiles = [
    'lib',
    'package-lock.json',
    'package.json',
  ];

  const stacks = [
    'auth',
    'dev',
    'management',
    'media',
    'networking',
    'rancher',
    'storage',
  ];

  if (changedFiles.some(f => triggerAllFiles.some(t => f.startsWith(t)))) {
    const setOutputCommand = createSetOutputCommand(stacks);
    console.log('Running command: ' + setOutputCommand);
    await execAsync(setOutputCommand);
  }

  const filteredStacks = stacks.filter(s => changedFiles.some(f => f.startsWith(`stacks/${s}`)));

  if (filteredStacks.length >= 0) {
    const setOutputCommand = createSetOutputCommand(filteredStacks);
    console.log('Running command: ' + setOutputCommand);
    await execAsync(setOutputCommand);
  }

})();

function createSetOutputCommand(stacks: string[]): string {
  const escapedStacks = JSON.stringify(JSON.stringify(stacks)).slice(1, -1);
  return `echo '::set-output name=value::${escapedStacks}'`;
}
