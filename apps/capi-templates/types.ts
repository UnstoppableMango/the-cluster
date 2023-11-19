import { Output } from '@pulumi/pulumi';

export interface Versions {
  k8s: string,
  talos: string,
  'cloud-provider-proxmox': string;
}

export interface Proxmox {
  username: string;
  password: string;
  endpoint: string;
}

export interface ServerClassesOutput {
  'rpi4.md.id': { id: Output<string> },
  'ryzen.gen1.md.id': { id: Output<string> },
}

export interface MachineTemplatesOutput {
  'rpi4.md': { id: Output<string> },
  'ryzen.gen1.md': { id: Output<string> },
  'px.zeus.md': { id: Output<string> },
  'px.apollo.md': { id: Output<string> },
}

export interface ProxmoxOutput {
  configMap: { id: Output<string> },
  secret: { id: Output<string> },
}
