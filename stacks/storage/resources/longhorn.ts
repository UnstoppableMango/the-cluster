import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { App, Namespace } from '@pulumi/rancher2';

export class Longhorn extends ComponentResource {

  public readonly namespace: Namespace;
  public readonly app: App;

  constructor(name: string, args: LonghornArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:longhorn', name, undefined, opts);

    this.namespace = new Namespace('longhorn', {
      name: 'longhorn-system',
      projectId: args.projectId,
    }, { parent: this });

    this.app = new App('longhorn', {
      catalogName: 'library',
      projectId: args.projectId,
      targetNamespace: this.namespace.name,
      templateName: 'longhorn',
      answers: {
        // 'service.ui.type': 'Rancher-Proxy',
        'ingress.enabled': true,
        'ingress.host': 'longhorn.int.unmango.net',
        'defaultSettings.backupTarget': 'nfs://zeus:/tank1/rancher/longhorn/backup',
        'defaultSettings.taintToleration': 'StorageOnly=true:NoExecute;CriticalAddonsOnly=true:NoExecute',
      },
    }, { parent: this });

    this.registerOutputs();
  }

}

export interface LonghornArgs {
  projectId: Input<string>;
}
