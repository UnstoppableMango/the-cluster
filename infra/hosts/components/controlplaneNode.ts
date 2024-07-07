import { ComponentResourceOptions } from '@pulumi/pulumi';
import { Node, NodeArgs } from './node';

export interface ControlPlaneNodeArgs extends NodeArgs { }

export class ControlPlaneNode extends Node {
  constructor(name: string, args: ControlPlaneNodeArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:infra:ControlPlanNode/${name}`, name, args, opts);
    if (opts?.urn) return;

    // TODO: Not all of these are needed on both localhost and clusterIp
    // https://kubernetes.io/docs/reference/networking/ports-and-protocols/#control-plane
    ['127.0.0.1', this.config.clusterIp].map(ip => {
      this.allowPort(ip, 6443); // Kubernetes API server
      this.allowPort(ip, 2379); // etcd server client API
      this.allowPort(ip, 2380); // etcd server client API
      this.allowPort(ip, 10250); // Kubelet API
      this.allowPort(ip, 10259); // kube-scheduler
      this.allowPort(ip, 10257); // kube-controller-manager
    });
  }
}
