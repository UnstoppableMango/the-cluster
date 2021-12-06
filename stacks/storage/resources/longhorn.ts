import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { AppV2, Namespace } from '@pulumi/rancher2';
import * as yaml from 'yaml';

export class Longhorn extends ComponentResource {

  public readonly namespace: Namespace;
  public readonly app: AppV2;

  constructor(name: string, args: LonghornArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:longhorn', name, undefined, opts);

    this.namespace = new Namespace('longhorn', {
      name: 'longhorn-system',
      projectId: args.projectId,
    }, { parent: this });

    this.app = new AppV2('longhorn', {
      name: 'longhorn',
      clusterId: args.clusterId,
      projectId: args.projectId,
      namespace: this.namespace.name,
      repoName: 'rancher-charts',
      chartName: 'longhorn',
      chartVersion: args.version,
      values: yaml.stringify({
        ingress: {
          enabled: true,
          host: 'longhorn.int.unmango.net',
        },
        defaultSettings: {
          backupTarget: 'nfs://zeus:/tank1/backup',
          createDefaultDiskLabeledNodes: false,
          defaultDataLocality: 'best-effort',
          // Bug (maybe?): https://github.com/longhorn/longhorn/issues/1833
          // taintToleration: 'StorageOnly=true:NoExecute;CriticalAddonsOnly=true:NoExecute',
        },
      }),
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface LonghornArgs {
  clusterId: Input<string>;
  projectId: Input<string>;
  version: Input<string>;
}
