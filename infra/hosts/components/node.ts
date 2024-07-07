import { ComponentResourceOptions } from '@pulumi/pulumi';
import { PrivateKey } from '@pulumi/tls';
import { remote } from '@pulumi/command';
import { CommandComponent, CommandComponentArgs } from './command';
import { Vlan } from './vlan';
import type { Node as NodeConfig } from '../config';
import { Kubectl } from './kubectl';
import { Kubeadm } from './kubeadm';
import { Bonding } from './bonding';

export interface NodeArgs extends CommandComponentArgs {
  config: NodeConfig;
}

export abstract class Node extends CommandComponent {
  public readonly config!: NodeConfig;
  public readonly vlan?: Vlan;
  public readonly bond?: Bonding;
  public readonly kubectl!: Kubectl;
  public readonly kubeadm!: Kubeadm;

  constructor(type: string, name: string, args: NodeArgs, opts?: ComponentResourceOptions) {
    super(type, name, args, opts);
    if (opts?.urn) return;

    const { config } = args;
    this.config = config;

    if (config.vlan) {
      this.vlan = this.exec(Vlan, name, {
        config: config,
        vlan: config.vlan,
      });
    }

    if (config.bond) {
      this.bond = this.exec(Bonding, name, {
        bond: config.bond,
      });
    }

    const archArgs = { arch: config.arch };
    this.kubectl = this.exec(Kubectl, name, archArgs);
    this.kubeadm = this.exec(Kubeadm, name, archArgs);
  }

  protected allowPort(ip: string, port: number): remote.Command {
    return this.exec(remote.Command,`ufw-${ip}-${port}`, {
      create: `ufw allow ${port}`,
      delete: `ufw deny ${port}`,
    });
  }
}
