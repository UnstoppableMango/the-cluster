import * as YAML from 'yaml';
import { ComponentResourceOptions, output, Output } from '@pulumi/pulumi';
import { remote } from '@pulumi/command';
import { Chmod, Tee } from '@unmango/pulumi-commandx/remote';
import { CommandComponent, CommandComponentArgs } from './command';
import type { Node as NodeConfig, Vlan as VlanConfig } from '../config';

export interface VlanArgs extends CommandComponentArgs {
  config: NodeConfig;
  vlan: VlanConfig;
}

export class Vlan extends CommandComponent {
  public readonly netplanConfig!: Output<string>;
  public readonly removeNetplan!: remote.Command;
  public readonly netplanTee!: Tee;
  public readonly netplanChmod!: Chmod;
  public readonly applyNetplan!: remote.Command;

  constructor(name: string, args: VlanArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:infra:Vlan/${name}`, name, args, opts);
    if (opts?.urn) return;

    const { vlan, config: node } = args;
    const file = '/etc/netplan/69-thecluster-vlan.yaml';

    const remove = this.exec(remote.Command, 'remove-netplan', {
      delete: 'netplan apply',
    });

    const content = YAML.stringify({
      network: {
        vlans: {
          [vlan.name]: {
            id: vlan.tag,
            link: vlan.interface,
            addresses: [
              `${node.clusterIp}/16`,
            ],
          },
        },
      },
    });

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

    this.removeNetplan = remove;
    this.netplanConfig = output(content);
    this.netplanTee = config;
    this.netplanChmod = chmod;
    this.applyNetplan = apply;

    this.registerOutputs({
      removeNetplan: this.removeNetplan,
      netplanConfig: this.netplanConfig,
      netplanTee: this.netplanTee,
      netplanChmod: this.netplanChmod,
      applyNetplan: this.applyNetplan,
    });
  }
}
