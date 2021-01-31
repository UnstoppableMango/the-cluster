import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { AppV2, CatalogV2, Namespace } from '@pulumi/rancher2';
import * as yaml from 'yaml';

export class NfsClient extends ComponentResource {

  public readonly catalog: CatalogV2;
  public readonly namespace: Namespace;
  public readonly app: AppV2;

  constructor(name: string, args: NfsClientArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:nfs-client', name, undefined, opts);

    this.catalog = new CatalogV2('ckotzbauer', {
      clusterId: args.clusterId,
      url: 'https://ckotzbauer.github.io/helm-charts',
    }, { parent: this });

    this.namespace = new Namespace('nfs-client', {
      name: 'nfs-client',
      projectId: args.projectId,
    }, { parent: this });

    this.app = new AppV2('nfs-client', {
      clusterId: args.clusterId,
      repoName: this.catalog.name,
      projectId: args.projectId,
      namespace: this.namespace.name,
      chartName: 'nfs-client-provisioner',
      chartVersion: args.version,
      values: yaml.stringify({
        nfs: {
          server: 'zeus',
          path: '/tank1/rancher',
        },
        // storageClass: { name: '' }.
      }),
    }, { parent: this });

    this.registerOutputs();
  }
}

export interface NfsClientArgs {
  clusterId: Input<string>;
  projectId: Input<string>;
  version: Input<string>;
}
