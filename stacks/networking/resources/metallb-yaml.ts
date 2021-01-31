import { ConfigMap, Namespace, Secret } from '@pulumi/kubernetes/core/v1';
import { ConfigFile } from '@pulumi/kubernetes/yaml';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';
import { RandomId } from '@pulumi/random';
import * as yaml from 'yaml';

export class MetalLb extends ComponentResource {

  public readonly ns: ConfigFile;
  public readonly deployment: ConfigFile;
  public readonly secret: Secret;
  public readonly config: ConfigMap;

  constructor(name: string, args: MetalLbArgs, opts?: ComponentResourceOptions) {
    super('unmango:apps:metallb', name, undefined, opts);

    const baseUrl = `https://raw.githubusercontent.com/metallb/metallb/v${args.version}/manifests`;

    this.ns = new ConfigFile('namespace', {
      file: `${baseUrl}/namespace.yaml`,
    }, { parent: this });

    this.deployment = new ConfigFile('metallb', {
      file: `${baseUrl}/metallb.yaml`,
    }, { parent: this, dependsOn: this.ns });

    const namespace = Namespace.get('namespace', 'metallb-system', {
      parent: this,
      dependsOn: this.ns,
    });

    const rand = new RandomId('secret', {
      byteLength: 128,
    }, { parent: this });

    this.secret = new Secret('memberlist', {
      metadata: {
        name: 'memberlist',
        namespace: namespace.metadata.name,
      },
      data: { secretkey: rand.b64Std },
    }, { parent: this, dependsOn: this.ns });

    this.config = new ConfigMap('metallb', {
      metadata: {
        name: 'metallb-config',
        namespace: namespace.metadata.name,
      },
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
