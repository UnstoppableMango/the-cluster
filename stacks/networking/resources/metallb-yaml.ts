import * as k8s from '@pulumi/kubernetes';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { RandomId } from '@pulumi/random';
import * as yaml from 'yaml';

export class MetalLb extends ComponentResource {

  public readonly namespace: k8s.yaml.ConfigFile;
  public readonly deployment: k8s.yaml.ConfigFile;
  public readonly secret: k8s.core.v1.Secret;
  public readonly config: k8s.core.v1.ConfigMap;

  constructor(name: string, args: MetalLbArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:metallb', name, undefined, opts);

    const baseUrl = `https://raw.githubusercontent.com/metallb/metallb/v${args.version}/manifests`;

    const ns = 'metallb-system';
    this.namespace = new k8s.yaml.ConfigFile('namespace', {
      file: `${baseUrl}/namespace.yaml`,
    }, { parent: this });

    this.deployment = new k8s.yaml.ConfigFile('metallb', {
      file: `${baseUrl}/metallb.yaml`,
    }, { parent: this, dependsOn: this.namespace });

    const rand = new RandomId('secret', {
      byteLength: 128,
    }, { parent: this });

    this.secret = new k8s.core.v1.Secret('memberlist', {
      metadata: { name: 'memberlist', namespace: ns },
      data: { secretkey: rand.b64Std },
    }, { parent: this, dependsOn: this.namespace });

    this.config = new k8s.core.v1.ConfigMap('metallb', {
      metadata: { name: 'config', namespace: ns },
      data: {
        config: yaml.stringify({
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
  version: Input<string>;
  addresses: string[];
}
