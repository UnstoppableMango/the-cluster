import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';
import * as util from '@unmango/shared';
import { IngressRoute } from './ingress-route';

export class Traefik extends ComponentResource {

  public readonly chartUrl = 'https://helm.traefik.io/traefik';
  public readonly namespace: k8s.core.v1.Namespace;
  public readonly chart: k8s.helm.v2.Chart;
  public readonly dashboard?: IngressRoute;

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

    this.namespace = new k8s.core.v1.Namespace('traefik', {
      metadata: { name: 'traefik-system' },
    }, { parent: this });

    this.chart = new k8s.helm.v2.Chart('traefik', {
      // TODO: Why TF does helm not put the service in the ns with everything else...
      // namespace: this.namespace.metadata.name,
      chart: 'traefik',
      version: args.version,
      fetchOpts: { repo: this.chartUrl },
      values: pulumi.all({ token: args.pilotToken }).apply(({ token }) => util.flatten({
        // persistence: { enabled: true },
        // logs: { general: { level: 'DEBUG' } },
        additionalArguments: ['--api.insecure=true'],
        pilot: {
          enabled: true,
          token: token,
        },
        // Currently doesn't work, not sure if needed either.
        // ports: {
        //   http: { port: 80, expose: true, exposedPort: 80, protocol: 'TCP' },
        //   https: { port: 443, expose: true, exposedPort: 443, protocol: 'TCP' },
        // },
        // // Needs to be a string boolean for some dumb reason
        // securityContext: { runAsNonRoot: 'false' },
      })),
    }, { parent: this });

    this.dashboard = new IngressRoute('dashboard', {
      // metadata: { namespace: this.namespace.metadata.name },
      entrypoints: ['web', 'websecure'],
      hosts: ['traefik.int.unmango.net', 'traefik'],
      services: [{
        name: 'api@internal',
        kind: 'TraefikService',
      }],
    }, { parent: this, dependsOn: this.chart });

    this.registerOutputs();
  }

}

export interface TraefikArgs {
  version: Input<string>;
  pilotToken: Input<string>;
}
