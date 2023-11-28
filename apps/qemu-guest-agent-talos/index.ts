import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';
import { versions } from './config';

const ns = new k8s.core.v1.Namespace('qemu-guest-agent', {
  metadata: { name: 'qemu-guest-agent' },
}, { provider });

const resources = new k8s.yaml.ConfigGroup('qemu-guest-agent-talos', {
  files: `https://raw.githubusercontent.com/crisobal/qemu-guest-agent-talos/${versions['qemu-guest-agent-talos']}/qemu-ga-talos-with-sa.yaml`,
  transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
    if (obj.kind !== 'Namespace' && obj.metadata.name !== 'qemu-guest-agent') return;

    obj.apiVersion = 'v1';
    obj.kind = 'List';
  }],
}, { provider });
