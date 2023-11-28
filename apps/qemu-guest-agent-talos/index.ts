import * as k8s from '@pulumi/kubernetes';
import { provider } from './clusters';
import { versions } from './config';

const resources = new k8s.yaml.ConfigGroup('qemu-guest-agent-talos', {
  files: `https://raw.githubusercontent.com/crisobal/qemu-guest-agent-talos/${versions.qemuGuestAgentTalos}/qemu-ga-talos-with-sa.yaml`,
}, { provider });
