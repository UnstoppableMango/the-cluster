import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';
import { versions } from './config';

const ns = new k8s.core.v1.Namespace('qemu-guest-agent', {
  metadata: { name: 'qemu-guest-agent' },
}, { provider });

const resources = new k8s.yaml.ConfigGroup('qemu-guest-agent-talos', {
  files: `https://raw.githubusercontent.com/crisobal/qemu-guest-agent-talos/${versions.qemuGuestAgentTalos}/qemu-ga-talos-with-sa.yaml`,
  transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
    if (obj.kind !== 'Namespace' && obj.metadata.name !== 'qemu-guest-agent') return;

    obj.apiVersion = 'v1';
    obj.kind = 'List';
  }, (obj: any, opts: pulumi.CustomResourceOptions) => {
    if (obj.kind !== 'DaemonSet' && obj.metadata.name !== 'qemu-ga-talos') return;

    obj.spec.template.spec.containers[0].image = `ghcr.io/UnstoppableMango/qemu-guest-agent-talos:${versions.customImage}`;
  }],
}, { provider });
