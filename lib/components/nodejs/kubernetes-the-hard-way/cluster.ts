import { ComponentResource, ComponentResourceOptions, Input, Output, all, output } from '@pulumi/pulumi';
import { RootCa } from './rootCa';
import { Certificate } from './certificate';
import { ClusterPki } from './clusterPki';

export interface Node {
  hostname?: Input<string>;
  ip: Input<string>;
}

export interface ClusterArgs {
  clusterName: Input<string>;
  controlPlanes: Input<Input<Node>[]>;
  workers: Input<Input<Node>[]>;
}

function from<T>(x: T | undefined): T[] {
  return x ? [x] : [];
}

export class Cluster extends ComponentResource {
  public readonly pki: ClusterPki;

  constructor(name: string, args: ClusterArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:cluster', name, args, opts);

    const clusterName = output(args.clusterName);

    const pki = new ClusterPki(name, {
      clusterName,
      nodes: {
        test: { ip: '10.69.0.2' },
      },
      publicIp: '10.69.1.2',
    });

    this.pki = pki;

    this.registerOutputs({ clusterName, pki });
  }
}
