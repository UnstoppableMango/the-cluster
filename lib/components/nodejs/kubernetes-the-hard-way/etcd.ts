import { ComponentResource, ComponentResourceOptions, Input, Output, interpolate, output } from '@pulumi/pulumi';
import { remote } from '@pulumi/command/types/input';
import { Wget } from './wget';

export type Architecture = 'amd64' | 'arm64';

export interface EtcdArgs {
  architecture: Input<Architecture>;
  connection: Input<remote.ConnectionArgs>;
  version?: Input<string>;
}

export class Etcd extends ComponentResource {
  public static readonly defaultVersion: string = '3.4.15';

  public readonly architecture: Output<Architecture>;
  public readonly url: Output<string>;
  public readonly version: Output<string>;
  public readonly wget: Wget;

  constructor(name: string, args: EtcdArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:etcd', name, args, opts);

    const architecture = output(args.architecture);
    const version = output(args.version ?? Etcd.defaultVersion);
    const url = interpolate`https://github.com/etcd-io/etcd/releases/download/v/etcd-v3.4.15-linux-amd64.tar.gz`;

    const wget = new Wget(name, {
      connection: args.connection,
      directoryPrefix: interpolate`~/.kthw/bin`,
      url: interpolate``,
    }, { parent: this });

    this.architecture = architecture;
    this.version = version;
    this.wget = wget;

    this.registerOutputs({ version, wget });
  }
}
