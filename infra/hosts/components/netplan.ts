import * as YAML from 'yaml';
import { ComponentResourceOptions, Inputs, output, Output } from '@pulumi/pulumi';
import { remote } from '@pulumi/command';
import { Chmod, Tee } from '@unmango/pulumi-commandx/remote';
import { CommandComponent, CommandComponentArgs } from './command';

export interface NetplanArgs extends CommandComponentArgs {
  config: Inputs;
}

export class Netplan extends CommandComponent {
  public readonly remove!: remote.Command;
  public readonly configTee!: Tee;
  public readonly configChmod!: Chmod;
  public readonly apply!: remote.Command;
  public readonly file!: Output<string>;
  public readonly content!: Output<string>;

  constructor(name: string, args: NetplanArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:infra:Netplan/${name}`, name, args, opts);
    if (opts?.urn) return;

    const file = '/etc/netplan/69-thecluster-vlan.yaml';
    const remove = this.exec(remote.Command, 'remove-netplan', {
      delete: 'netplan apply',
    });

    const content = output(args.config).apply(YAML.stringify);
    const config = this.exec(Tee, 'netplan', {
      stdin: content,
      create: {
        files: [file],
      },
      delete: `rm ${file}`,
    }, { dependsOn: remove });

    // TODO: I think this still isn't working
    const chmod = this.exec(Chmod, 'netplan', {
      create: {
        files: [file],
        mode: '600',
      },
    }, { dependsOn: config });

    const apply = this.exec(remote.Command, 'apply-netplan', {
      create: 'netplan apply',
    }, { dependsOn: [config, chmod] });

    this.remove = remove;
    this.file = output(file);
    this.content = content;
    this.configTee = config;
    this.configChmod = chmod;
    this.apply = apply;

    this.registerOutputs({
      remove: this.remove,
      file: this.file,
      content: this.content,
      configTee: this.configTee,
      configChmod: this.configChmod,
      apply: this.apply,
    });
  }
}
