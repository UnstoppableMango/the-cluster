import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { App } from '@pulumi/rancher2';
import * as yaml from 'yaml';

export class MetalLb extends ComponentResource {

  public readonly app: App;

  constructor(name: string, args: MetalLbArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:metallb', name, undefined, opts);

    this.app = new App(name, {
      projectId: args.projectId,
      catalogName: args.catalogName,
      templateName: 'metallb',
      templateVersion: args.version,
      targetNamespace: args.namespace,
      forceUpgrade: true,
      answers: {
        configInline: yaml.stringify({
          'address-pools': [{
            name: 'default',
            protocol: 'layer2',
            addresses: args.addresses,
          }],
        }).trimEnd(),
      },
    }, { parent: this });

    this.registerOutputs();
  }
}

export interface MetalLbArgs {
  projectId: Input<string>;
  catalogName: Input<string>;
  namespace: Input<string>;
  version: Input<string>;
  addresses: string[];
}
