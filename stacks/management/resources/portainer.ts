import { Namespace } from '@pulumi/rancher2';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { AppV2, Catalog, CatalogV2 } from '@pulumi/rancher2';
import * as yaml from 'yaml';

export class Portainer extends ComponentResource {

  public readonly chartUrl = 'https://portainer.github.io/k8s';
  public readonly namespace: Namespace;
  public readonly catalog: Catalog;
  public readonly catalogV2: CatalogV2;
  public readonly app: AppV2;

  constructor(name: string, args: PortainerArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:portainer', name, undefined, opts);

    this.namespace = new Namespace('portainer', {
      name: 'portainer',
      projectId: args.projectId,
    }, { parent: this });

    this.catalog = new Catalog('portainer', {
      clusterId: args.clusterId,
      url: this.chartUrl,
      version: 'helm_v3',
    }, { parent: this });

    this.catalogV2 = new CatalogV2('portainer', {
      clusterId: args.clusterId,
      url: this.chartUrl,
    }, { parent: this });

    this.app = new AppV2('portainer', {
      clusterId: args.clusterId,
      projectId: args.projectId,
      namespace: this.namespace.name,
      repoName: this.catalogV2.name,
      chartName: 'portainer',
      chartVersion: args.chartVersion,
      // https://portainer.github.io/k8s/charts/portainer/
      values: yaml.stringify({
        service: { type: 'ClusterIP' },
        ingress: {
          enabled: true,
          hosts: [{
            host: 'portainer.int.unmango.net',
            paths: [{
              path: '/',
              port: 9000,
            }],
          }],
        },
        persistence: {
          enabled: true, // Default: true
          size: '1Gi', // Default: 10Gi
        },
      }),
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface PortainerArgs {
  clusterId: Input<string>;
  projectId: Input<string>;
  chartVersion: Input<string>;
}
