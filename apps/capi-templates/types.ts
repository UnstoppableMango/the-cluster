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
