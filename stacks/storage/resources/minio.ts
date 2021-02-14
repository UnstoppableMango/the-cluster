import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { AppV2, Namespace } from '@pulumi/rancher2';
import { RandomPassword } from '@pulumi/random';
import { getNameResolver } from '@unmango/shared/util';
import { toYaml } from '@unmango/shared';

export class Minio extends ComponentResource {

  private readonly getName = getNameResolver('minio', this.name);

  public readonly namespace: Namespace;
  public readonly accessKey: RandomPassword;
  public readonly secretKey: RandomPassword;
  public readonly app: AppV2;

  constructor(private name: string, args: MinioArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:minio', name, undefined, opts);

    this.namespace = new Namespace(this.getName(), {
      name: 'minio',
      projectId: args.projectId,
    }, { parent: this });

    this.accessKey = new RandomPassword(this.getName('accessKey'), {
      length: 10,
    }, { parent: this });

    this.secretKey = new RandomPassword(this.getName('secretKey'), {
      length: 40,
    }, { parent: this });

    this.app = new AppV2(this.getName(), {
      namespace: this.namespace.name,
      clusterId: args.clusterId,
      projectId: args.projectId,
      repoName: 'bitnami',
      chartName: 'minio',
      chartVersion: '6.1.7',
      values: toYaml({
        global: {
          imageRegistry: 'harbor.int.unmango.net/docker.io',
          // minio: {
          //   accessKey: '',
          //   secretKey: '',
          // },
        },
        mode: 'distributed',
        accessKey: { password: this.accessKey.result },
        secretKey: { password: this.secretKey.result },
        persistence: {
          storageClass: args.storageClass,
          size: '500Gi',
        },
        ingress:  {
          enabled: true,
          hostname: 'minio.int.unmango.net',
        },
      }),
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface MinioArgs {
  clusterId: Input<string>;
  projectId: Input<string>;
  storageClass: Input<string>;
}
