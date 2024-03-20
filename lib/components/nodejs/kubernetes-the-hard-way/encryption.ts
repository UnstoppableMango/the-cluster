import * as path from 'node:path';
import * as YAML from 'yaml';
import { ComponentResource, ComponentResourceOptions, Input, Output } from '@pulumi/pulumi';
import { RandomBytes } from '@pulumi/random';
import { remote } from '@pulumi/command/types/input';
import { RemoteFile } from './remoteFile';

export interface EncryptionKeyArgs {
  bytes: Input<number>;
}

export class EncryptionKey extends ComponentResource {
  public readonly config: Output<string>;
  public readonly key: RandomBytes;

  constructor(name: string, args: EncryptionKeyArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:encryptionKey', name, args, opts);

    const key = new RandomBytes(name, { length: args.bytes }, { parent: this });
    const config = key.base64.apply(keyData => YAML.stringify({
      kind: 'EncryptionConfig',
      apiVersion: 'v1',
      resources: [{ secrets: [] }],
      providers: [
        {
          aescbc: {
            keys: [{
              name: 'key1',
              secret: keyData,
            }],
          },
        },
        { identity: {} },
      ],
    }));

    this.config = config;
    this.key = key;

    this.registerOutputs({ config, key });
  }

  public install(name: string, connection: remote.ConnectionArgs, opts?: ComponentResourceOptions): RemoteFile {
    return install(this, name, connection, opts);
  }
}

export function install(
  key: EncryptionKey,
  name: string,
  connection: remote.ConnectionArgs,
  opts?: ComponentResourceOptions,
): RemoteFile {
  const target = path.join('home', 'kthw'); // TODO
  return new RemoteFile(name, {
    connection,
    content: key.config,
    path: path.join(target, 'encryption-config.yaml'),
  }, opts);
}
