import * as exec from 'child_process';
import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as semver from 'semver';
import * as util from 'util';

const execAsync = util.promisify(exec.exec);
const globAsync = util.promisify(glob);

(async () => {
  let crd2PulumiVersion = 'v0.0.0';
  try {
    const { stdout } = await execAsync('crd2pulumi version');
    crd2PulumiVersion = stdout;
  } catch {
    console.log('crd2pulumi may not be installed');
    return;
  }

  if (semver.lt(crd2PulumiVersion, '1.0.10')) {
    console.log(`crd2pulumi must be at least v1.0.10. Actual: ${crd2PulumiVersion}`);
    return;
  }

  const crdGlobs = [
      'submodules/cert-manager/deploy/crds/*.yaml',
      'submodules/traefik-helm-chart/traefik/crds/*.yaml'
  ];
  
  const crds = await Promise.all(crdGlobs.map(g => globAsync(g))).then(x => x.flat());

  let gitRoot = '';
  try {
    const { stdout } = await execAsync('git rev-parse --show-toplevel');
    gitRoot = stdout.trim();
  } catch {
    console.log('Failed to determine git root');
    return;
  }

  const outdir = path.join(gitRoot, 'lib', 'crds');

  if (fs.existsSync(outdir)) {
    try {
      await fs.promises.rm(outdir, {
        force: true,
        recursive: true
      });
    } catch (e) {
      console.log('Failed to clean outdir');
      return;
    }
  }

  try {
    const command = [
      'crd2pulumi',
      `--nodejsPath ${outdir}`,
      crds.join(' '),
    ].join(' ');

    await execAsync(command);
  } catch (e) {
    console.log(e);
    console.log('Failed to generate crds');
    return;
  }
})();
