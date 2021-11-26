import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import * as rancher from '@pulumi/rancher2';
import * as YAML from 'yaml';

export class BackupRestore extends pulumi.ComponentResource {

  public readonly app: rancher.AppV2;

  constructor(name: string, args: BackupRestoreArgs, opts?: pulumi.ComponentResourceOptions) {
    super('unmango:rancher:BackupRestore', name, undefined, opts);

    this.app = new rancher.AppV2(name, {
      chartName: 'rancher-backup',
      clusterId: args.clusterId,
      namespace: args.namespace,
      repoName: 'rancher-charts',
      chartVersion: '1.2.0',
      values: pulumi
        .all([args.storageClass, args.volumeSize])
        .apply(([storageClass, volumeSize]) => YAML.stringify({
          persistence: {
            storageClass,
            size: volumeSize,
          },
        })),
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface BackupRestoreArgs {
  clusterId: pulumi.Input<string>;
  namespace: pulumi.Input<string>;
  storageClass: pulumi.Input<string>;
  volumeSize: pulumi.Input<string>;
}
