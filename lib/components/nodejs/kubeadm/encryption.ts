import * as YAML from 'yaml';
import { ComponentResource, ComponentResourceOptions, Input, Output } from '@pulumi/pulumi';
import { RandomBytes } from '@pulumi/random';

export interface EncryptionKeyArgs {
  bytes: Input<number>;
}

export class EncryptionKey extends ComponentResource {
  public readonly key: RandomBytes;

  public get config(): Output<string> {
    return this.key.base64.apply(x => YAML.stringify({
      kind: 'EncryptionConfig',
      apiVersion: 'v1',
      resources: [{ secrets: [] }],
      providers: [
        {
          aescbc: {
            keys: [{
              name: 'key1',
              secret: x,
            }],
          },
        },
        { identity: {} },
      ],
    }));
  }

  constructor(name: string, args: EncryptionKeyArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:encryptionKey', name, args, opts);

    const key = new RandomBytes(name, {
      length: args.bytes,
    }, { parent: this });

    this.key = key;

    this.registerOutputs({ key });
  }

  // TODO: Copy to controllers
}
