import { Command } from '@pulumi/command/remote';
import { ComponentResource, ComponentResourceOptions, Input } from '@pulumi/pulumi';

export interface NodeCertificateArgs {
  host: Input<string>;
}

export class NodeCertificate extends ComponentResource {
  public readonly command: Command;

  constructor(name: string, args: NodeCertificateArgs, opts?: ComponentResourceOptions) {
    super('thecluster:index:nodeCertificate', name, args, opts);

    const command = new Command(name, {
      connection: {
        host: args.host,
      },
      environment: {
        CERT_PEM: '',
        KEY_PEM: '',
      },
      stdin: '',
      create: 'echo $CERT_PEM',
      update: '',
      delete: '',
    }, { parent: this });

    this.command = command;

    this.registerOutputs({ command });
  }
}
