import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import * as pulumi from '@pulumi/pulumi';
import { AppV2, Namespace } from '@pulumi/rancher2';
import { getNameResolver, toYaml } from '@unmango/shared';

export class NfsClient extends ComponentResource {

  private readonly getName = getNameResolver('nfs-client', this.name);

  public readonly namespace: Namespace;
  public readonly app: AppV2;

  constructor(private name: string, args: NfsClientArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:nfs-client', name, undefined, opts);

    this.namespace = new Namespace(this.getName(), {
      name: this.getName(),
      projectId: args.projectId,
    }, { parent: this });

    this.app = new AppV2(this.getName(), {
      clusterId: args.clusterId,
      projectId: args.projectId,
      namespace: this.namespace.name,
      repoName: 'ckotzbauer',
      chartName: 'nfs-client-provisioner',
      chartVersion: '1.0.2',
      values: toYaml({
        nfs: {
          server: 'zeus',
          path: pulumi.output(args.subPath).apply(subPath => {
            return `/tank1/${subPath}`;
          }),
        },
        storageClass: {
          name: args.storageClass ?? 'nfs-client',
        },
      }),
    }, { parent: this });

    this.registerOutputs();
  }
}

export interface NfsClientArgs {
  clusterId: Input<string>;
  projectId: Input<string>;
  subPath: Input<string>;
  storageClass?: Input<string>;
}
