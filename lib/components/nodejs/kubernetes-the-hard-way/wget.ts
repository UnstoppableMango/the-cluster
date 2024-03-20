import { ComponentResource, ComponentResourceOptions, Input, Output, all, interpolate, output } from '@pulumi/pulumi';
import { Command } from '@pulumi/command/remote';
import { remote } from '@pulumi/command/types/input';

export interface WgetArgs {
  connection: Input<remote.ConnectionArgs>;
  directoryPrefix?: Input<string>;
  httpsOnly?: Input<boolean>;
  outputDocument?: Input<string>;
  quiet?: Input<boolean>;
  timestamping?: Input<boolean>;
  url: Input<string>;
}

export class Wget extends ComponentResource {
  public readonly command: Command;
  public readonly directoryPrefix: Output<string | undefined>;
  public readonly httpsOnly: Output<boolean>;
  public readonly outputDocument: Output<string | undefined>;
  public readonly quiet: Output<boolean>;
  public readonly timestamping: Output<boolean>;
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

    const directoryprefix = output(args.directoryPrefix);
    const httpsOnly = output(args.httpsOnly ?? true);
    const outputDocument = output(args.outputDocument);
    const quiet = output(args.quiet ?? false);
    const timestamping = output(args.timestamping ?? true);
    const url = output(args.url);

    const options: Output<string> = all([
      directoryprefix,
      httpsOnly,
      outputDocument,
      quiet,
      timestamping,
    ]).apply(([directoryPrefix, httpsOnly, outputDocument, quiet, timestamping]) => {
      const options: string[] = [];

      if (directoryPrefix) options.push(`--directory-prefix '${directoryPrefix}'`);
      if (httpsOnly) options.push('--https-only');
      if (outputDocument) options.push(`--output-document '${outputDocument}'`);
      if (quiet) options.push('--quiet');
      if (timestamping ?? true) options.push('--timestamping');

      return options.join(' ');
    });

    const command = new Command(name, {
      connection: args.connection,
      create: interpolate`wget ${options} '${url}'`,
    }, { parent: this });

    this.command = command;
    this.directoryPrefix = directoryprefix;
    this.httpsOnly = httpsOnly;
    this.outputDocument = outputDocument;
    this.quiet = quiet;
    this.timestamping = timestamping;
    this.url = url;

    this.registerOutputs({
      command, httpsOnly, outputDocument,
      quiet, timestamping, url,
    });
  }
}
