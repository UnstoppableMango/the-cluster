import { ComponentResource, ComponentResourceOptions, Input, Output, interpolate, output } from '@pulumi/pulumi';
import { Command } from '@pulumi/command/remote';
import { remote } from '@pulumi/command/types/input';

export type InstallArgs = Omit<RemoteFileArgs, 'content'>;

export interface RemoteFileArgs {
  connection: Input<remote.ConnectionArgs>;
  path: Input<string>;
  content: Input<string>;
}

export class RemoteFile extends ComponentResource {
  public readonly command: Command;
  public readonly content: Output<string>;
  public readonly path: Output<string>;

  public get stderr(): Output<string> {
    return this.command.stderr;
  }

  public get stdin(): Output<string | undefined> {
    return this.command.stdin;
  }

  public get stdout(): Output<string> {
    return this.command.stdout;
  }

  constructor(name: string, args: RemoteFileArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:remoteFile', name, args, opts);

    const content = output(args.content);
    const path = output(args.path);

    const command = new Command(name, {
      connection: args.connection,
      stdin: content,
      create: interpolate`tee ${path}`,
      delete: interpolate`rm ${path}`,
    }, { parent: this });

    this.command = command;
    this.content = content;
    this.path = path;

    this.registerOutputs({ command, content, path });
  }
}
