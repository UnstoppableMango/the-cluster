import { asset, ComponentResourceOptions } from '@pulumi/pulumi';
import { remote } from '@pulumi/command';
import { Chmod } from '@unmango/pulumi-commandx/remote';
import { Architecture, KubeletInstall } from '@unmango/pulumi-kubernetes-the-hard-way/remote';
import { CommandComponent, CommandComponentArgs } from './command';
import { Defaults, versions } from '../config';

export interface KubeletArgs extends CommandComponentArgs {
  arch: Architecture;
}

export class Kubelet extends CommandComponent {
  constructor(name: string, args: KubeletArgs, opts?: ComponentResourceOptions) {
    super(`thecluster:infra:Kubelet/${name}`, name, args, opts);
    if (opts?.urn) return;

    const install = this.exec(KubeletInstall, name, {
      architecture: args.arch,
      version: versions.k8s,
    });

    const chmod = this.exec(Chmod, name, {
      create: {
        mode: '+x',
        files: [install.path],
      },
    });

    const systemdDirectory = Defaults.systemdDirectory;
    const systemdService = this.exec(remote.CopyToRemote, name, {
      remotePath: `${systemdDirectory}/kubelet.service`,
      source: new asset.FileAsset('./kubelet/kubelet.service'),
    });

    const start = this.exec(remote.Command, 'start', {
      create: 'systemctl daemon-reload && systemctl enable --now kubelet',
      delete: 'systemctl disable --now kubelet',
    }, { dependsOn: [install, chmod, systemdService] });
  }
}
