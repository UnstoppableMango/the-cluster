import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as github from '@pulumi/github';
import { ComponentResource, ComponentResourceOptions } from '@pulumi/pulumi';
import { toKebabCase } from '../external';

export class Utils extends ComponentResource {

  private readonly _ignoredFiles = ['node_modules'];
  private readonly _opts = { parent: this };
  private readonly _rootDir = path.join(__dirname, '..');
  private readonly _srcDir = path.join(this._rootDir, 'external');

  public readonly repo = new github.Repository('util', {
    name: 'the-cluster-util',
    description: 'Helper utilities for THECLUSTER',
    allowMergeCommit: false,
    allowRebaseMerge: true,
    allowSquashMerge: true,
    autoInit: true,
    deleteBranchOnMerge: true,
    gitignoreTemplate: 'Node',
    hasIssues: true,
    hasProjects: false,
    hasWiki: false,
    licenseTemplate: 'WTFPL',
    visibility: 'public',
    vulnerabilityAlerts: true,
  }, this._opts);

  public readonly defaultBranch = new github.BranchDefault('main', {
    branch: 'main',
    repository: this.repo.name,
  }, this._opts);

  public readonly files: github.RepositoryFile[];

  constructor(name: string, opts?: ComponentResourceOptions) {
    super('unmango:the-cluster:util', name, undefined, opts);

    cp.execSync('npm run build', { cwd: this._srcDir });
    this.files = this.getRepoFiles(this._srcDir);
  }

  private getRepoFiles(dir: string, parts?: string[]): github.RepositoryFile[] {
    const files = fs.readdirSync(dir)
      .filter(x => !this._ignoredFiles.includes(x))
      .filter(x => !x.match(/^[a-zA-Z]+\.{1}ts/gm))
      .filter(x => !x.match(/.*spec.*/gm));

    const results: github.RepositoryFile[] = [];

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.lstatSync(fullPath).isDirectory()) {
        results.push(...this.getRepoFiles(fullPath, [
          ...(parts ?? []),
          path.basename(file),
        ]));
      } else {
        results.push(this.toRepoFile(fullPath, parts));
      }
    });

    return results;
  }

  private toName(file: string, parts?: string[]): string {
    return toKebabCase(...(parts ?? []), path.basename(file));
  }

  private toRepoFile(file: string, parts?: string[]): github.RepositoryFile {
    return new github.RepositoryFile(this.toName(file, parts), {
      // Filter out /bin so files in it get put at the root of the repo
      file: path.join(...(parts ?? []).filter(x => x !== 'bin'), path.basename(file)),
      repository: this.repo.name,
      branch: this.defaultBranch.branch,
      content: fs.readFileSync(file).toString(),
      overwriteOnCreate: true,
    }, { parent: this.repo });
  }

}
