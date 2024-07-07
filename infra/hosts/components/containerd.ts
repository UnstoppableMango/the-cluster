import { asset, ComponentResourceOptions, interpolate } from '@pulumi/pulumi';
import { remote } from '@pulumi/command';
import { Mkdir, Wget } from '@unmango/pulumi-commandx/remote';
import { Architecture, ContainerdInstall } from '@unmango/pulumi-kubernetes-the-hard-way/remote';
import { CommandComponent, CommandComponentArgs } from './command';
import { versions } from '../config';

export interface ContainerdArgs extends CommandComponentArgs {
  arch: Architecture
}

export class Containerd extends CommandComponent {
  constructor(name: string, args: ContainerdArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:infra:Containerd/${name}`, name, args, opts);
    if (opts?.urn) return;

    const install = this.exec(ContainerdInstall, 'containerd', {
      architecture: args.arch,
      version: versions.containerd,
    });

    const systemdDirectory = '/usr/local/lib/systemd/system';
    const systemdService = this.exec(Wget, 'containerd-systemd', {
      create: {
        url: [interpolate`https://raw.githubusercontent.com/containerd/containerd/v${versions.containerd}/containerd.service`],
        directoryPrefix: systemdDirectory,
      },
      delete: `rm '${systemdDirectory}/containerd.service'`,
    });

    const start = this.exec(remote.Command, 'containerd-start', {
      create: 'systemctl daemon-reload && systemctl enable --now containerd',
      delete: 'systemctl disable --now containerd',
    }, { dependsOn: [install, systemdService] });

    const mkdir = this.exec(Mkdir, 'etc-containerd', {
      create: { parents: true, directory: '/etc/containerd' },
    });

    const config = this.exec(remote.CopyToRemote, 'containerd-config', {
      source: new asset.FileAsset('./containerd/config.toml'),
      remotePath: '/etc/containerd/config.toml',
    }, { dependsOn: mkdir });

    const applyConfig = this.exec(remote.Command, 'apply-config', {
      update: 'systecmtcl restart containerd',
      triggers: [config],
    }, { dependsOn: start });
  }
}
