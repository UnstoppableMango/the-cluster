import { ComponentResource, ComponentResourceOptions, Input, Output, interpolate, output } from '@pulumi/pulumi';
import { Command } from '@pulumi/command/remote';
import * as inputs from '@pulumi/command/types/input';

export interface RemoteFileArgs {
  connection: Input<inputs.remote.ConnectionArgs>;
  path: Input<string>;
  content: Input<string>;
}

export class RemoteFile extends ComponentResource {
  public readonly command: Command;
  public readonly path: Output<string>;

  constructor(name: string, args: RemoteFileArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:remoteFile', name, args, opts);

    const path = args.path;
    const command = new Command(name, {
      connection: args.connection,
      stdin: args.content,
      create: interpolate`tee ${path}`,
      delete: interpolate`rm ${path}`,
    }, { parent: this });

    this.command = command;
    this.path = output(path);

    this.registerOutputs({ command, path });
  }
}
