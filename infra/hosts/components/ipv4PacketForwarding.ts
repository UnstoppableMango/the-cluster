import { ComponentResourceOptions } from '@pulumi/pulumi';
import { remote } from '@pulumi/command';
import { Tee } from '@unmango/pulumi-commandx/remote';
import { CommandComponent, CommandComponentArgs } from './command';

export interface Ipv4PacketForwardingArgs extends CommandComponentArgs {}

export class Ipv4PacketForwarding extends CommandComponent {
  constructor(name: string, args: Ipv4PacketForwardingArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:infra:Ipv4PacketForwarding/${name}`, name, args, opts);
    if (opts?.urn) return;

    const deleteSysctl = this.exec(remote.Command, `remove-ipv4-forwarding`, {
      delete: 'sysctl --system',
    });

    const file = `/etc/sysctl.d/k8s.conf`;
    const tee = this.exec(Tee, 'ipv4-forwarding', {
      stdin: `net.ipv4.ip_forward = 1\n`,
      create: {
        files: [file],
      },
      delete: `rm ${file}`,
    }, { dependsOn: deleteSysctl });

    this.exec(remote.Command, 'apply-ipv4-forwarding', {
      create: 'sysctl --system',
    }, { dependsOn: tee });
  }
}

