import { CustomResource } from '@pulumi/kubernetes/apiextensions';
import { ComponentResource, ComponentResourceOptions, Config, Input } from '@pulumi/pulumi';
import { App, CatalogV2 } from '@pulumi/rancher2';
import { Catalog, Namespace } from '@pulumi/rancher2';
import * as util from '@unmango/shared';

export class Traefik extends ComponentResource {

  private readonly _opts = { parent: this };
  private readonly _traefikConfig = new Config().requireObject<TraefikConfig>('traefik');
  private readonly _pilotConfig = this._traefikConfig.pilot;

  public readonly chartUrl = 'https://helm.traefik.io/traefik';

  public readonly catalog = new Catalog('traefik', {
    url: this.chartUrl,
    version: 'helm_v3',
  }, this._opts);

  public readonly catalogV2 = new CatalogV2('traefik', {
    clusterId: this.args.clusterId,
    url: this.chartUrl,
  }, this._opts);

  public readonly ns = new Namespace('traefik', {
    name: 'traefik-system',
    projectId: this.args.projectId,
  }, this._opts);

  public readonly app = new App('traefik', {
    projectId: this.args.projectId,
    targetNamespace: this.ns.name,
    catalogName: this.catalog.name,
    templateName: 'traefik',
    templateVersion: '9.13.0',
    answers: util.flatten({
      // persistence: { enabled: true },
      // logs: { general: { level: 'DEBUG' } },
      additionalArguments: '{--api.insecure=true}',
      pilot: {
        enabled: true,
        token: this._pilotConfig.token,
      },
      // Currently doesn't work, not sure if needed either.
      // ports: {
      //   http: { port: 80, expose: true, exposedPort: 80, protocol: 'TCP' },
      //   https: { port: 443, expose: true, exposedPort: 443, protocol: 'TCP' },
      // },
      // // Needs to be a string boolean for some dumb reason
      // securityContext: { runAsNonRoot: 'false' },
    }),
  }, this._opts);

  public readonly dashboard = new CustomResource('traefik-dashboard', {
    apiVersion: 'traefik.containo.us/v1alpha1',
    kind: 'IngressRoute',
    metadata: { namespace: this.ns.name },
    spec: {
      entryPoints: [ 'web' ],
      routes: [{
        match: 'Host(`traefik.int.unmango.net`) || Host(`traefik`)',
        kind: 'Rule',
        services: [{
          name: 'api@internal',
          kind: 'TraefikService',
        }],
      }],
    },
  }, {
    ...this._opts,
    dependsOn: this.app,
  });

  constructor(name: string, private args: TraefikArgs, opts?: ComponentResourceOptions) {
    super('unmango:k8s:apps', name, undefined, opts);
  }

}

export interface TraefikArgs {
  clusterId: Input<string>;
  projectId: Input<string>;
}

interface TraefikConfig {
  pilot: { token: string }
}
