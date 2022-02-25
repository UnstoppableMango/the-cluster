import * as exec from 'child_process';
import * as os from 'os';
import * as util from 'util';

const execAsync = util.promisify(exec.exec);

(async () => {
  const diffCommand = [
    'git', 'diff', '--name-only', 'origin/main',
  ].join(' ');

  const changedFiles = await execAsync(diffCommand).then(x => x.stdout.split(os.EOL));

  const triggerAllFiles = ['lib'];

  const triggerAllDependencies = [
    /"@pulumi\/.*"/gm,
    /"@unmango\/.*"/gm,
    /"typescript"/gm,
    /"yaml"/gm,
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

  if (changedFiles.some(f => f === 'package.json' || f === 'package-lock.json')) {
    const command = [
      'git', 'diff', '-U0', 'origin/main', 'package.json',
    ].join(' ');

    const packageJsonDiff = await execAsync(command).then(x => x.stdout.split(os.EOL));

    const modified = packageJsonDiff
      .filter(l => /^[+]/gm.test(l))
      .filter(l => !/^(--- a\/|\+\+\+ b\/)/gm.test(l));

    if (modified.some(x => triggerAllDependencies.some(t => t.test(x)))) {
      const setOutputCommand = createSetOutputCommand(stacks);
      console.log('Running command: ' + setOutputCommand);
      process.stdout.write(setOutputCommand + os.EOL);
      process.exit(0);
    }
  }

  const filteredStacks = stacks.filter(s => changedFiles.some(f => f.startsWith(`stacks/${s}`)));

  if (filteredStacks.length > 0) {
    const setOutputCommand = createSetOutputCommand(filteredStacks);
    console.log('Running command: ' + setOutputCommand);
    process.stdout.write(setOutputCommand + os.EOL);
    process.exit(0);
  }

  // Workflow expects valid json
  const setOutputCommand = createSetOutputCommand([]);
  process.stdout.write(setOutputCommand + os.EOL);
})();

function createSetOutputCommand(stacks: string[]): string {
  return `::set-output name=value::${JSON.stringify(stacks)}`;
}
