import { asset, ComponentResourceOptions } from '@pulumi/pulumi';
import { remote } from '@pulumi/command';
import { CommandComponent, CommandComponentArgs } from './command';
import type { Node as NodeConfig } from '../config';
import { Kubectl } from './kubectl';
import { Kubeadm } from './kubeadm';
import { Netplan } from './netplan';

export interface NodeArgs extends CommandComponentArgs {
  config: NodeConfig;
}

export abstract class Node extends CommandComponent {
  public readonly config!: NodeConfig;
  public readonly ethernets?: Netplan;
  public readonly bond?: Netplan;
  public readonly vlan?: Netplan;
  public readonly kubectl!: Kubectl;
  public readonly kubeadm!: Kubeadm;

  constructor(type: string, name: string, args: NodeArgs, opts?: ComponentResourceOptions) {
    super(type, name, args, opts);
    if (opts?.urn) return;

    const { config } = args;
    this.config = config;

    if (config.ethernets) {
      this.ethernets = this.exec(Netplan, 'ethernets', {
        config: Netplan.ethernets(config.ethernets),
        file: '/etc/netplan/20-ethernets.yaml',
      });
    }

    if (config.bond) {
      this.exec(remote.CopyToRemote, 'systemd-module', {
        remotePath: '/etc/modules-load.d/bonding.conf',
        source: new asset.StringAsset('bonding'),
      });

      const modprobe = this.exec(remote.Command, 'modprobe', {
        create: 'modprobe bonding',
        delete: 'modprobe -r bonding',
      });

      this.bond = this.exec(Netplan, 'bond', {
        config: Netplan.bond(config.bond),
        file: '/etc/netplan/60-bonding.yaml',
      }, { dependsOn: this.ethernets });
    }

    if (config.vlan) {
      this.vlan = this.exec(Netplan, 'vlan', {
        config: Netplan.vlan(config, config.vlan),
        file: '/etc/netplan/69-thecluster-vlan.yaml',
      }, { dependsOn: this.bond });
    }

    const archArgs = { arch: config.arch };
    this.kubectl = this.exec(Kubectl, name, archArgs);
    this.kubeadm = this.exec(Kubeadm, name, archArgs);
  }

  protected allowPort(ip: string, port: number): remote.Command {
    return this.exec(remote.Command, `ufw-${ip}-${port}`, {
      create: `ufw allow ${port}`,
      delete: `ufw deny ${port}`,
    });
  }
}
