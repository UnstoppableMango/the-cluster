import * as pulumi from '@pulumi/pulumi';
import * as k8s from '@pulumi/kubernetes';
import ns from '../namespace';
import { Proxmox } from '../types';

const config = new pulumi.Config();
const proxmox = config.requireObject<Proxmox>('proxmox');

export default new k8s.core.v1.Secret('proxmox-credentials', {
  metadata: {
    name: 'proxmox-credentials',
    namespace: ns.metadata.name,
  },
  stringData: {
    PROXMOX_PASSWORD: proxmox.password,
    PROXMOX_SECRET: '',
    PROXMOX_TOKENID: '',
    PROXMOX_USER: proxmox.username,
  },
});
