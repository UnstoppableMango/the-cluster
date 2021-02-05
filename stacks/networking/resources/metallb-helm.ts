import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as yaml from 'yaml';

export class MetalLb extends pulumi.ComponentResource {

  public readonly chartUrl = 'https://charts.bitnami.com/bitnami';
  public readonly namespace: k8s.core.v1.Namespace;

  // Have to use v2 due to
  // https://github.com/pulumi/pulumi-kubernetes/issues/1335
  public readonly chart: k8s.helm.v2.Chart;

  constructor(name: string, args: MetalLbArgs, opts?: pulumi.ComponentResourceOptions) {
    super('unmango:apps:metallb', name, undefined, opts);

    this.namespace = new k8s.core.v1.Namespace('metallb-system', {
      metadata: { name: 'metallb-system' },
    }, { parent: this });
    
    this.chart = new k8s.helm.v2.Chart('metallb', {
      namespace: this.namespace.metadata.name,
      fetchOpts: { repo: this.chartUrl },
      chart: 'metallb',
      version: args.version,
      values: {
        configInline: yaml.stringify({
          'address-pools': [{
            name: 'default',
            protocol: 'layer2',
            addresses: args.addresses,
          }],
        }).trimEnd(),
      },
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface MetalLbArgs {
  version: pulumi.Input<string>;
  addresses: string[];
}
