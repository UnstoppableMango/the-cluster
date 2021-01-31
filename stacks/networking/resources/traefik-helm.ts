import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { Namespace } from '@pulumi/kubernetes/core/v1';
import { Chart } from '@pulumi/kubernetes/helm/v3';
import { ComponentResource, ComponentResourceOptions, Config, Input } from '@pulumi/pulumi';
import * as util from '@unmango/shared';
import { IngressRoute } from './ingress-route';

export class Traefik extends ComponentResource {

  public readonly chartUrl = 'https://helm.traefik.io/traefik';
  public readonly namespace: Namespace;
  public readonly chart: Chart;
  public readonly dashboard: IngressRoute;

  constructor(name: string, private args: TraefikArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:traefik', name, undefined, opts);

    // const traefikValues = pulumi.all({
    //   id: theCluster.id,
    //   name: theCluster.name,
    // }).apply(({ id, name }) => yaml.stringify({
    //   global: {
    //     cattle: {
    //       clusterId: id,
    //       clusterName: name,
    //     },
    //   },
    //   persistence: { enabled: true },
    //   ports: { traefik: { expose: true } },
    // }));

    this.namespace = new Namespace('traefik', {
      metadata: { name: 'traefik-system' },
    }, { parent: this });

    this.chart = new Chart('traefik', {
      namespace: this.namespace.metadata.name,
      chart: 'traefik',
      version: '9.13.0',
      fetchOpts: { repo: this.chartUrl },
      values: util.flatten({
        // persistence: { enabled: true },
        // logs: { general: { level: 'DEBUG' } },
        additionalArguments: '{--api.insecure=true}',
        pilot: {
          enabled: true,
          // TODO: Input crap
          token: args.pilotToken,
        },
        // Currently doesn't work, not sure if needed either.
        // ports: {
        //   http: { port: 80, expose: true, exposedPort: 80, protocol: 'TCP' },
        //   https: { port: 443, expose: true, exposedPort: 443, protocol: 'TCP' },
        // },
        // // Needs to be a string boolean for some dumb reason
        // securityContext: { runAsNonRoot: 'false' },
      }),
    }, { parent: this });

    this.dashboard = new IngressRoute('dashboard', {
      metadata: { namespace: this.namespace.metadata.name },
      entrypoints: ['web'],
      hosts: ['traefik.int.unmango.net', 'traefik'],
    }, { parent: this, dependsOn: this.chart });

    this.registerOutputs();
  }

}

export interface TraefikArgs {
  pilotToken: Input<string>;
}
