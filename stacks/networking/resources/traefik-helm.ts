import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';

export class Traefik extends ComponentResource {

  public readonly chartUrl = 'https://helm.traefik.io/traefik';
  public readonly namespace: k8s.core.v1.Namespace;
  public readonly chart: k8s.helm.v3.Chart;

  constructor(name: string, private args: TraefikArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:traefik', name, undefined, opts);

    this.namespace = new k8s.core.v1.Namespace('traefik', {
      metadata: { name: 'traefik-system' },
    }, { parent: this });

    this.chart = new k8s.helm.v3.Chart('traefik', {
      // TODO: Why TF does helm not put the service in the ns with everything else...
      namespace: this.namespace.metadata.name,
      chart: 'traefik',
      version: args.version,
      fetchOpts: { repo: this.chartUrl },
      values: {
        logs: { general: { level: 'DEBUG' } },
        pilot: {
          enabled: true,
          token: args.pilotToken,
        },
      },
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface TraefikArgs {
  version: Input<string>;
  pilotToken: Input<string>;
}
