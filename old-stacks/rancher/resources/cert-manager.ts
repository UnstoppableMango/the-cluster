import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';

export class CertManager extends ComponentResource {

  public readonly chartUrl = 'https://charts.jetstack.io';
  public readonly namespace: k8s.core.v1.Namespace;
  public readonly chart: k8s.helm.v2.Chart;

  constructor(name: string, args: CertManagerArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:cert-manager', name, undefined, opts);

    this.namespace = new k8s.core.v1.Namespace('cert-manager', {
      metadata: { name: 'cert-manager' },
    }, { parent: this });

    this.chart = new k8s.helm.v2.Chart('cert-manager', {
      namespace: this.namespace.metadata.name,
      fetchOpts: { repo: this.chartUrl },
      chart: 'cert-manager',
      version: args.version,
      values: {
        installCRDs: true,
      },
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface CertManagerArgs {
  version?: Input<string>;
}
