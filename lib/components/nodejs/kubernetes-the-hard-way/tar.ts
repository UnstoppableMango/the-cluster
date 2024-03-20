import { ComponentResource, ComponentResourceOptions, Input, Output, all, output, interpolate } from '@pulumi/pulumi';
import { Command } from '@pulumi/command/remote';
import { remote } from '@pulumi/command/types/input';

export interface TarArgs {
  archive: Input<string>;
  directory?: Input<string>;
  extract?: Input<boolean>;
  gzip?: Input<boolean>;
  connection: Input<remote.ConnectionArgs>;
}

export class Tar extends ComponentResource {
  public readonly archive: Output<string>;
  public readonly command: Command;
  public readonly directory: Output<string | undefined>;
  public readonly extract: Output<boolean>;

  constructor(name: string, args: TarArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:tar', name, args, opts);

    const archive = output(args.archive);
    const directory = output(args.directory);
    const extract = output(args.extract ?? true); // Is this a sane default?
    const gzip = output(args.gzip ?? false);

    const options: Output<string> = all([directory, extract, gzip]).apply(([directory, extract, gzip]) => {
      const options: string[] = [];

      if (directory) options.push(`--directory '${directory}'`);
      if (extract) options.push('--extract');
      if (gzip) options.push('--gzip');

      return options.join(' ');
    });

    const command = new Command(name, {
      connection: args.connection,
      create: interpolate`tar ${options} '${archive}'`,
      // TODO: Should we clean anything up?
    }, { parent: this });

    this.archive = archive;
    this.command = command;
    this.directory = directory;
    this.extract = extract;

    this.registerOutputs({ archive, command, extract });
  }
}
