import * as YAML from 'yaml';
import { asset, ComponentResourceOptions } from '@pulumi/pulumi';
import { remote } from '@pulumi/command';
import { Tee } from '@unmango/pulumi-commandx/remote';
import { CommandComponent, CommandComponentArgs } from './command';
import { Bond } from '../config';

export interface BondingArgs extends CommandComponentArgs {
  bond: Bond;
}

export class Bonding extends CommandComponent {
  constructor(name: string, args: BondingArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:infra:Bonding/?${name}`, name, args, opts);
    if (opts?.urn) return;

    const { bond } = args;

    this.exec(remote.CopyToRemote, 'systemd-module', {
      remotePath: '/etc/modules-load.d/bonding.conf',
      source: new asset.StringAsset('bonding'),
    });

    const modprobe = this.exec(remote.Command, 'modprobe', {
      create: 'modprobe bonding',
      delete: 'modprobe -r bonding',
    });

    const content = YAML.stringify({
      network: {
        bonds: {
          [bond.name]: {
            interfaces: bond.interfaces,
            addresses: bond.addresses,
            parameters: {
              mode: bond.mode,
              'transmit-hash-policy': 'layer3+4',
              'mii-monitor-interval': 1,
            },
          },
        },
      },
    });

    const remove = this.exec(remote.Command, 'remove-netplan', {
      delete: 'netplan apply',
    });

    const file = '/etc/netplan/60-bonding.yaml';
    const config = this.exec(Tee, 'netplan-config', {
      stdin: content,
      create: {
        files: [file],
      },
      delete: `rm ${file}`,
    }, { dependsOn: remove });

    this.exec(remote.Command, 'apply-netplan', {
      create: 'netplan apply',
    }, { dependsOn: [modprobe, config] });
  }
}
