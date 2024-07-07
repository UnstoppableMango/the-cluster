import { ComponentResourceOptions, Output } from '@pulumi/pulumi';
import { Architecture, CniPluginsInstall } from '@unmango/pulumi-kubernetes-the-hard-way/remote';
import { Mkdir } from '@unmango/pulumi-commandx/remote';
import { CommandComponent, CommandComponentArgs } from './command';
import { versions } from '../config';

export interface CniPluginsArgs extends CommandComponentArgs {
  arch: Architecture;
}

export class CniPlugins extends CommandComponent {
  public readonly directory!: Output<string>;

  constructor(name: string, args: CniPluginsArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:infra:CniPlugins/${name}`, name, args, opts);
    if (opts?.urn) return;

    const directory = '/opt/cni/bin';

    const mkdir = this.exec(Mkdir, 'cni', {
      create: { parents: true, directory },
      delete: `rm -rf ${directory}`,
    });

    const install = this.exec(CniPluginsInstall, 'cni', {
      architecture: args.arch,
      directory,
      version: versions.cniPlugins,
    }, { dependsOn: mkdir });

    this.directory = install.directory;

    this.registerOutputs({
      directory: this.directory,
    });
  }
}
