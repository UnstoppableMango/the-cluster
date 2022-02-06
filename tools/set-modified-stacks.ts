import * as exec from 'child_process';
import * as os from 'os';
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
    process.stdout.write(setOutputCommand + os.EOL);
    process.exit(0);
  }

  const filteredStacks = stacks.filter(s => changedFiles.some(f => f.startsWith(`stacks/${s}`)));

  if (filteredStacks.length >= 0) {
    const setOutputCommand = createSetOutputCommand(filteredStacks);
    console.log('Running command: ' + setOutputCommand);
    process.stdout.write(setOutputCommand + os.EOL);
  }

})();

function createSetOutputCommand(stacks: string[]): string {
  const escapedStacks = JSON.stringify(JSON.stringify(stacks)).slice(1, -1);
  return `::set-output name=value::${escapedStacks}`;
}
