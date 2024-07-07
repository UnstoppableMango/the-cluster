import { asset, ComponentResourceOptions } from '@pulumi/pulumi';
import { remote } from '@pulumi/command';
import { CommandComponent, CommandComponentArgs } from './command';

export interface BondingArgs extends CommandComponentArgs {}

export class Bonding extends CommandComponent {
  constructor(name: string, args: BondingArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:infra:Bonding/?${name}`, name, args, opts);
    if (opts?.urn) return;

    this.exec(remote.CopyToRemote, name, {
      remotePath: '/etc/modules-load.d/bonding.conf',
      source: new asset.StringAsset('bonding'),
    });

    this.exec(remote.Command, name, {
      create: 'modprobe bonding',
      delete: 'modprobe -r bonding',
    });
  }
}
