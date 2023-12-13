import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import { provider } from '@unmango/thecluster/cluster/from-stack';
import { versions } from './config';

const resources = new k8s.yaml.ConfigGroup('qemu-guest-agent-talos', {
  files: `https://raw.githubusercontent.com/crisobal/qemu-guest-agent-talos/${versions.qemuGuestAgentTalos}/qemu-ga-talos-with-sa.yaml`,
  transformations: [(obj: any, opts: pulumi.CustomResourceOptions) => {
    if (obj.kind !== 'DaemonSet' && obj.metadata.name !== 'qemu-ga-talos') return;

    obj.spec.template.spec.containers[0].image = `ghcr.io/unstoppablemango/qemu-guest-agent-talos:${versions.customImage}`;
    obj.spec.template.spec.nodeSelector = {
      'thecluster.io/qemu-agent': 'true',
    };
  }],
}, { provider });
