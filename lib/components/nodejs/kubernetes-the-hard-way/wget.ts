import { ComponentResource, ComponentResourceOptions, Input, Output, interpolate, output } from '@pulumi/pulumi';
import { Command } from '@pulumi/command/remote';
import { remote } from '@pulumi/command/types/input';

export interface WgetArgs {
  connection: Input<remote.ConnectionArgs>;
  path: Input<string>;
  url: Input<string>;
}

export class Wget extends ComponentResource {
  public readonly command: Command;
  public readonly path: Output<string>;
  public readonly url: Output<string>;

  public get stderr(): Output<string> {
    return this.command.stderr;
  }

  public get stdin(): Output<string | undefined> {
    return this.command.stdin;
  }

  public get stdout(): Output<string> {
    return this.command.stdout;
  }

  constructor(name: string, args: WgetArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:wget', name, args, opts);

    const url = output(args.url);
    const path = output(args.path);

    const command = new Command(name, {
      connection: args.connection,
      create: interpolate`wget --https-only --timestamping -O ${path} ${url}`,
      delete: interpolate`rm -f ${path}`,
    }, { parent: this });

    this.command = command;
    this.path = path;
    this.url = url;

    this.registerOutputs({ command, path, url });
  }
}
