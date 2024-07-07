import { ComponentResourceOptions } from '@pulumi/pulumi';
import { Node, NodeArgs } from './node';
import { Ipv4PacketForwarding } from './ipv4PacketForwarding';
import { Containerd } from './containerd';
import { CniPlugins } from './cniPlugins';
import { Kubelet } from './kubelet';
import { Runc } from './runc';

export interface WorkerNodeArgs extends NodeArgs { }

export class WorkerNode extends Node {
  public readonly ipv4PacketForwarding!: Ipv4PacketForwarding;
  public readonly containerd!: Containerd;
  public readonly cniPlugins!: CniPlugins;
  public readonly kubelet!: Kubelet;
  public readonly runc!: Runc;

  constructor(name: string, args: WorkerNodeArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:infra:WorkerNode/${name}`, name, args, opts);
    if (opts?.urn) return;

    // https://kubernetes.io/docs/reference/networking/ports-and-protocols/#node
    ['127.0.0.1', this.config.clusterIp].map(ip => {
      this.allowPort(ip, 10250); // Kubelet API
      this.allowPort(ip, 10256); // kube-proxy
    });

    this.ipv4PacketForwarding = this.exec(Ipv4PacketForwarding, name, {});

    const archArgs = { arch: args.config.arch };
    this.containerd = this.exec(Containerd, name, archArgs);
    this.cniPlugins = this.exec(CniPlugins, name, archArgs);
    this.kubelet = this.exec(Kubelet, name, archArgs);
    this.runc = this.exec(Runc, name, archArgs);
  }
}
