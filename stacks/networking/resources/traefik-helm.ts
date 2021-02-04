import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import * as util from '@unmango/shared';
import { IngressRoute } from './ingress-route';

export class Traefik extends ComponentResource {

  public readonly chartUrl = 'https://helm.traefik.io/traefik';
  // public readonly namespace: k8s.core.v1.Namespace;
  public readonly chart: k8s.helm.v3.Chart;
  public readonly dashboard?: IngressRoute;
  public readonly rancher?: IngressRoute;

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

    // this.namespace = new k8s.core.v1.Namespace('traefik', {
    //   metadata: { name: 'traefik-system' },
    // }, { parent: this });

    this.chart = new k8s.helm.v3.Chart('traefik', {
      // TODO: Why TF does helm not put the service in the ns with everything else...
      // Also, does traefik have an unwritten requirement to be in the default ns?
      // namespace: this.namespace.metadata.name,
      chart: 'traefik',
      version: args.version,
      fetchOpts: { repo: this.chartUrl },
      // values: pulumi.all({ token: args.pilotToken }).apply(({ token }) => util.flatten({
      //   // persistence: { enabled: true },
      //   logs: { general: { level: 'DEBUG' } },
      //   // additionalArguments: ['--api.insecure=true'],
      //   pilot: {
      //     enabled: true,
      //     token: token,
      //   },
      //   // // Needs to be a string boolean for some dumb reason
      //   // securityContext: { runAsNonRoot: 'false' },
      // })),
      values: {
        'logs.general.level': 'DEBUG',
        'pilot.enabled': true,
        'pilot.token': args.pilotToken,
      },
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

    this.rancher = new IngressRoute('rancher', {
      // metadata: { namespace: this.namespace.metadata.name },
      entrypoints: ['web', 'websecure'],
      hosts: ['rancher.int.unmango.net', 'rancher'],
      services: [{
        name: 'rancher',
        namespace: 'cattle-system',
        kind: 'Service',
        port: 443,
      }],
    }, { parent: this, dependsOn: this.chart });

    this.registerOutputs();
  }

}

export interface TraefikArgs {
  version: Input<string>;
  pilotToken: Input<string>;
}
