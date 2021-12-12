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
      chartVersion: '100.1.0+up1.2.2',
      values: yaml.stringify({
        // These are the settings refreshed from the remote to satisfy
        // that there are "no changes" when running `pulumi up`
        defaultSettings: {
          backupTarget: 'nfs://apollo:/tank1/backup/thecluster',
          createDefaultDiskLabeledNodes: false,
          defaultDataLocality: 'best-effort',
        },
        global: {
          cattle: {
            clusterId: 'local',
            clusterName: 'local',
            rkePathPrefix: '',
            rkeWindowsPathPrefix: '',
            systemDefaultRegistry: '',
            url: 'https://rancher.int.unmango.net',
          },
          systemDefaultRegistry: '',
        },
        image: { defaultImage: true },
        ingress: {
          enabled: true,
          host: 'longhorn.int.unmango.net',
        },
        longhorn: { default_setting: true },
        persistence: { reclaimPolicy: 'Retain' },
        // These are the settings I would prefer to have if I can
        // get the damn "improper constraint" error worked out
        // ingress: {
        //   enabled: true,
        //   host: 'longhorn.int.unmango.net',
        // },
        // defaultSettings: {
        //   backupTarget: 'nfs://apollo:/tank1/backup/thecluster',
        //   defaultDataLocality: 'best-effort',
        // },
        // persistence: { reclaimPolicy: 'Retain' }
      }),
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface LonghornArgs {
  clusterId: Input<string>;
  projectId: Input<string>;
}
