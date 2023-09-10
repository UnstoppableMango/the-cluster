import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';

export class Rancher extends ComponentResource {

  public readonly chartUrl = 'https://releases.rancher.com/server-charts/latest';
  public readonly namespace: k8s.core.v1.Namespace;
  public readonly chart: k8s.helm.v2.Chart;

  constructor(name: string, args: RancherArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:rancher', name, undefined, opts);

    this.namespace = new k8s.core.v1.Namespace('cattle-system', {
      metadata: { name: 'cattle-system' },
    }, { parent: this });

    this.chart = new k8s.helm.v2.Chart('rancher', {
      namespace: this.namespace.metadata.name,
      fetchOpts: { repo: this.chartUrl },
      chart: 'rancher',
      version: args.version,
      values: {
        hostname: 'rancher.int.unmango.net',
        // tls: 'external',
        // 'ingress.tls.source': 'letsEncrypt',
        // 'letsEncrypt.email': args.letsEncryptEmail,
      },
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface RancherArgs {
  version?: Input<string>,
  letsEncryptEmail?: Input<string>;
}
