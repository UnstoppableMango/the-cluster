import { ComponentResource, ComponentResourceOptions, Input, Output, output, interpolate } from '@pulumi/pulumi';
import { Command } from '@pulumi/command/remote';
import { remote } from '@pulumi/command/types/input';
import { Wget } from './wget';

export interface RemoteDownloadArgs {
  connection: Input<remote.ConnectionArgs>;
  destination: Input<string>;
  url: Input<string>;
}

export class RemoteDownload extends ComponentResource {
  public readonly mkdir: Command;
  public readonly destination: Output<string>
  public readonly url: Output<string>;
  public readonly wget: Wget;

  constructor(name: string, args: RemoteDownloadArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:remoteDownload', name, args, opts);

    const destination = output(args.destination);
    const url = output(args.url);

    const mkdir = new Command(name, {
      connection: args.connection,
      create: interpolate`mkdir -p ${destination}`,
      // Do we want to clean up the directory on update/delete?
    }, { parent: this });

    const wget = new Wget(name, {
      connection: args.connection,
      url: args.url,
      directoryPrefix: args.destination,
    }, { parent: this, dependsOn: mkdir });

    this.mkdir = mkdir;
    this.destination = destination;
    this.url = url;
    this.wget = wget;

    this.registerOutputs({ mkdir, destination, url, wget });
  }
}
