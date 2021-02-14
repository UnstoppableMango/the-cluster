import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { AppV2, Namespace } from '@pulumi/rancher2';
import { getNameResolver, toYaml } from '@unmango/shared';

export class Duplicati extends ComponentResource {

  private readonly getName = getNameResolver('duplicati', this.name);

  public readonly namespace: Namespace;
  public readonly app: AppV2;

  constructor(private name: string, args: DuplicatiArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:duplicati', name, undefined, opts);

    this.namespace = new Namespace(this.getName(), {
      name: this.getName(),
      projectId: args.projectId,
    }, { parent: this });

    this.app = new AppV2(this.getName(), {
      clusterId: args.clusterId,
      projectId: args.projectId,
      namespace: this.namespace.name,
      repoName: 'k8s-at-home',
      chartName: 'duplicati',
      chartVersion: '2.0.1',
      values: toYaml({
        image: {
          repository: 'harbor.int.unmango.net/docker.io/linuxserver/duplicati',
        },
        timezone: 'America/Chicago',
        ingress: {
          enabled: true,
          hosts: ['duplicati.int.unmango.net'],
        },
      }),
    }, { parent: this });
  }

}

export interface DuplicatiArgs {
  clusterId: Input<string>;
  projectId: Input<string>;
}
